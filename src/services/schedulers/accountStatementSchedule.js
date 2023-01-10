import Agenda from 'agenda';
import mongoose from "mongoose";
import logger from '../../util/logger';
import AccountStatementRequest from '../../model/acntStmtRequest';
import accountStatementService from '../../services/accountStatementService'

const connectionString = process.env.MONGO_CONNECTION || config.mongodb.connectionString;
const interval = process.env.ACCOUNT_STATEMENT_QUERY_INTERVAL || config.accountStatementScheduler.accountStatementQueryInterval;
const collectionName = process.env.ACCOUNT_QUERY_SCHEDULER_TABLE || config.accountStatementScheduler.collection;

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
    this.createJob = this.createJob.bind( this );
    this.executeJob = this.executeJob.bind( this );
    this.createJob();
  
  }

  async createJob() {

    // this.schedulerModel = mongoose.model(collectionName);
    agenda.define(jobName, {
      concurrency: 0
    }, this.executeJob );
    await agenda.start();
    await agenda.every("*/1 * * * *", jobName, null, {
      timezone: "Asia/Karachi"
    } );
  }

  async executeJob(job) {
    console.log('Job Invoked');
    const requests = await this.fetchAllRequests(job);
    requests.forEach(async (request) => {
        const requestExecuted = await this.requestAccountStatement(request);
        if(requestExecuted.success){
            const requestRemoved = await this.removeRequest(request._id);
            if(requestRemoved){
                logger.info("Request Removed")
            }
        } 
    })
    // await this.sendPNOnRemaingDays(job);
  }

  async fetchAllRequests(job){
    try{
        const requests = await this.schedulerModel.find({});
        job.schedule( "in 1 minutes" ); 
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

  async removeRequest(id){
    try{
        const requestDeleted = await this.schedulerModel.remove({ _id: id });
        if(requestDeleted) return true;
        else return false;
    }catch(error){
        logger.error('Failed to remove request in account statement query scheduler' + error)
    }
  }

}


export default new accountStatementQueryScheduler(AccountStatementRequest, accountStatementService);