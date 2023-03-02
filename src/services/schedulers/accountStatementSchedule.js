import Agenda from 'agenda';
import logger from '../../util/logger';
import AccountStatementRequest from '../../model/acntStmtRequest';
import accountStatementService from '../../services/accountStatementService'

const connectionString = process.env.MONGO_CONNECTION || config.mongodb.connectionString;
const interval = process.env.ACCOUNT_STATEMENT_QUERY_SCHEDULER_INTERVAL || config.accountStatementScheduler.accountStatementQueryInterval;
const schedular = process.env.ACCOUNT_STATEMENT_SCHEDULER || config.accountStatementScheduler.scheduler || false;
const failureCountNumber = process.env.ACCOUNT_SCHEDULER_FAILURE_COUNT || config.accountStatementScheduler.failureCount;
const failureTimeInMinutes = process.env.ACCOUNT_SCHEDULER_FAILURE_TIME_IN_MINUTES || config.accountStatementScheduler.failureTimeInMinutes;
const requestRetrievelTimeInMinutes = process.env.SCHEDULER_REQUEST_RETRIEVEL_TIME_IN_MINUTES || config.accountStatementScheduler.requestRetrievelTimeInMinutes || 15;
const requestsQueryLimit = process.env.SCHEDULER_REQUESTS_QUERY_LIMIT || config.accountStatementScheduler.requestsQueryLimit || 1;

const agenda = new Agenda( {
  db: {
    address: connectionString
  }
} );

const jobName = 'AcntStmtQueryJob';
class accountStatementQueryScheduler {
  constructor (AccountStatementRequest, accountStatementService) {
    this.schedulerModel = AccountStatementRequest;
    this.accountStatementService = accountStatementService;
    this.createJob = this.createJob.bind(this);
    this.executeJob = this.executeJob.bind(this);
    this.createJob();
  }

  async createJob() {
    if(schedular){
      agenda.define(jobName, {
        concurrency: 0
      }, this.executeJob );
      await agenda.start();
      await agenda.every(interval, jobName, null, {
        timezone: "Asia/Karachi"
      } );
    }else{
      logger.info("Scheduler is skipping for this microservice");
    }
  }

  async executeJob(job) {
    const requests = await this.fetchRequest(job);
    const count = requests.length;
    if(count > 0){
      for(let i = 0; i < count; i++){
        await this.updateRequestStatus(requests[i]._id, 'inProgress');
        this.processRecords(requests[i]);
      }
    }else{
      logger.info("No new request found!");
    }
  }

  async fetchRequest(job){
    try{
        const requests = await this.schedulerModel.find({
          $or: [
            {
              $and: [
                { "requestTime": { $gte: new Date().getTime()-(requestRetrievelTimeInMinutes*60*1000) } }, // fetch requests from last X minutes
                { "status": "pending" }
              ]
            },
            {
              $and: [
                { "status": "failed" },
                { "failureCount" : { $lt: failureCountNumber } }, //max number of failures of trying repeatedly
                { "requestTime": { $lt: new Date() } } //failed request will add time for next request
              ]
            }
          ]
        })
        .sort({ createdAt: 1 })
        .limit(parseInt(requestsQueryLimit));
        logger.info({
          event: "Requests retrieved",
          data: requests
        });
        return requests;
    }catch(error){
        logger.error( 'Error in executeJob for Account Statement query schedular from analytics and reporting microservice' + error )
    }
  }

  async requestAccountStatement(data){
    try{
        const payload = {
            msisdn: data.msisdn,
            start_date: data.startDate,
            end_date: data.endDate,
            request: data.requestType,
            email: data.email,
            subject: 'Hello',
            html: '<html></html>',
            format: data.format,
            metadata: data.metadata || false,
            merchantName: data.merchantName,
            accountLevel: data.accountLevel,
            channel: data.channel
        }

        logger.info({
          event: "Scheduler: Payload for Account Statement",
          data: payload
        })

        logger.info({
          event: "Payload and Channel Account Statement",
          data: {payload : payload.format , channel : payload.channel}
        })

        if(payload.format === 'pdf'){
          var execute = {
            'consumerApp': accountStatementService.sendEmailPDFFormat,
            'merchantApp': accountStatementService.sendEmailPDFMerchant,
          }
          logger.info('***Request Executed***');
          // await execute[payload.channel](payload)
        }
        else {
          var execute = {

              'consumerApp': accountStatementService.sendEmailCSVFormat,
              'merchantApp': accountStatementService.sendEmailCSVFormatMerchant,
          }
          
          await execute[payload.channel](payload)
        }
        return { success: true }
    }catch(error){
        console.log('Error', error)
        logger.error( 'Error in executing account statement for schedular from analytics and reporting microservice' + error );
        return { success: false };
    }
  }

  async updateRequestStatus(id, status){
    try{
        const query = { _id: id };
        const updateData = { status, requestTime: new Date() };
        const requestUpdated = await this.schedulerModel.findOneAndUpdate(query, updateData);
        if(requestUpdated) return true;
        else return false;
    }catch(error){
        logger.error('Failed to update request status in account statement query scheduler' + error)
    }
  }

  async updateFailedRequestStatus(request){
    try{
      const query = { _id: request._id };
      const timeToAdd = parseInt(failureTimeInMinutes) * 60 * 1000;
      const updateData = {
        status: 'failed',
        failureCount: request.failureCount + 1,
        requestTime: new Date(new Date().getTime() +  timeToAdd) //add time for next try after getting failed
      };
      const requestUpdated = await this.schedulerModel.findOneAndUpdate(query, updateData);
      if(requestUpdated) return true;
      else return false;
  }catch(error){
      logger.error('Failed to update request status in account statement query scheduler' + error)
  }
  }

}


export default new accountStatementQueryScheduler(AccountStatementRequest, accountStatementService);