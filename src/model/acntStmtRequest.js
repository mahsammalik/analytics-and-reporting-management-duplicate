import mongoose, {
    Schema
  } from "mongoose";
  
  class AccountStatementRequest {
  
    initSchema() {
      const schema = new Schema({
        msisdn: {
          type: String,
          required: true
        },
        email: {
          type: String,
          required: false,
        },
        startDate: {
          type: String,
          required: false,
        },
        endDate: {
          type: String,
          required: false,
        },
        requestType: {
          type: String,
          required: false
        },
        metadata: {
            type: Object,
            required: false
        },
        format: {
          type: String,
          required: false 
        },
        merchantName: {
            type: String,
            required: false
        },
        accountLevel: {
            type: String,
            required: false
        },
        channel: {
            type: String,
            required: false
        },
        status: {
          type: String,
          required: false
        },
        requestTime: {
          type: Date,
          required: false,
        },
        failureCount: {
          type: Number,
          required: false
        }
      }, {
        timestamps: true
      });
      mongoose.model("accntStmtRequest", schema);
    }
  
    getInstance() {
      this.initSchema();
      return mongoose.model("accntStmtRequest");
    }
  }
  
  export default new AccountStatementRequest().getInstance();