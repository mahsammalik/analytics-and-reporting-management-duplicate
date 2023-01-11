import Agenda from 'agenda';
import mongoose from "mongoose";
import logger from '../../util/logger';
import AccountStatementRequest from '../../model/acntStmtRequest';
import accountStatementService from '../../services/accountStatementService'

const connectionString = process.env.MONGO_CONNECTION || config.mongodb.connectionString;
const interval = process.env.ACCOUNT_STATEMENT_QUERY_SCHEDULER_INTERVAL || config.accountStatementScheduler.accountStatementQueryInterval;
const schedular = process.env.ACCOUNT_STATEMENT_SCHEDULER || config.accountStatementScheduler.scheduler || false;
const failureCountNumber = process.env.ACCOUNT_SCHEDULER_FAILURE_COUNT || config.accountStatementScheduler.failureCount;
const failureTimeInMinutes = process.env.ACCOUNT_SCHEDULER_FAILURE_TIME_IN_MINUTES || config.accountStatementScheduler.failureTimeInMinutes;

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
    const request = await this.fetchRequest(job);
    if(!!request){
      const requestExecuted = await this.requestAccountStatement(request);
      if(requestExecuted.success){
          const requestUpdated = await this.updateRequestStatus(request._id, 'sent');
          if(requestUpdated){
              logger.info("Scheduler: Email sent!")
          }
      }else{
        const requestUpdated = await this.updateFailedRequestStatus(request);
        logger.info({
          event: "Schedule: Failed to send email",
          data: { requestUpdated, message: "Request status updated" }
        })
      }
    }else{
      logger.info("No new request found!");
    }
  }

  async fetchRequest(job){
    try{
        const request = await this.schedulerModel.findOne({
          $or: [
            { "status": "pending" },
            {
              $and: [
                { "status": "failed" },
                { "failureCount" : { $lt: failureCountNumber } }, //max number of failures of trying repeatedly
                { "requestTime": { $lt: new Date() } } //failed request will add time for next request
              ]
            }
          ]
        });
        logger.info({
          event: "Request retrieved",
          data: request
        })
        return request;
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
            metadata: data.metadata,
            merchantName: data.merchantName,
            accountLevel: data.accountLevel,
            channel: data.channel
        }
        if (payload.format === 'pdf')
            await accountStatementService.sendEmailPDFFormat(payload)
        else
            await accountStatementService.sendEmailCSVFormat(payload);
        
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