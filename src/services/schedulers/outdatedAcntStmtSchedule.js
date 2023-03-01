import Agenda from 'agenda';
import logger from '../../util/logger';
import AccountStatementRequest from '../../model/acntStmtRequest';

const connectionString = process.env.MONGO_CONNECTION || config.mongodb.connectionString;
const interval = process.env.ACCOUNT_STATEMENT_TIMED_OUT_SCHEDULER_INTERVAL || config.accountStatementScheduler.timedOutRequestsSchedulerInterval;
const schedular = process.env.ACCOUNT_STATEMENT_OUTDATED_SCHEDULER || config.accountStatementScheduler.outDatedRequestsScheduler || false;
const requestRetrievelTimeInMinutes = process.env.SCHEDULER_REQUEST_RETRIEVEL_TIME_IN_MINUTES || config.accountStatementScheduler.requestRetrievelTimeInMinutes || 15; 

const agenda = new Agenda( {
  db: {
    address: connectionString
  }
} );

const jobName = 'AcntStmtTimedOutJob';

class outdatedAcntStmtScheduler {
  constructor (AccountStatementRequest) {
    this.schedulerModel = AccountStatementRequest;
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
      logger.info("Scheduler for outdated requests is skipping for this microservice");
    }
  }

  async executeJob(job) {
    logger.info({
        event: 'Scheduler for out dated Requests'
    })
    await this.updateRequests(job);
  }

  async updateRequests(job){
    try{
        const query = {
            "requestTime": {
                $lt: new Date().getTime()-(requestRetrievelTimeInMinutes*60*1000)
            }
        }
        const requests = await this.schedulerModel.updateMany(query, { $set: { status: 'systemFailed' } });
        if(!!requests){
            logger.info({
                event: "Scheduler: Requests updated with System Failed status.",
                requests
            })
        }else{
            logger.error('Scheduler: Error in updating system failed requests.');
        }
    }catch(err){
        logger.error('Scheduler: Error in updating system failed requests.' + err);
    }
  }

}

export default new outdatedAcntStmtScheduler(AccountStatementRequest);