const queries = {
    merchantAccountStatment: `
            SELECT MSISDN, TRX_DATETIME, TRX_ID, TRX_YPE, CHANNEL,
            DESCRIPTION, AMOUNT_DEBITED, AMOUNT_CREDITED, FEE_FED , 
            RUNNING_BALANCE, REASON_TYPE 
            FROM statements.ACCOUNTSTATEMENT 
            WHERE DATE(TRX_DATETIME) 
            BETWEEN ? AND ? And MSISDN = ? OR MSISDN = ?   ;`,
    consumerAccountStatement: `
            SELECT MSISDN, TRX_DATETIME, TRX_ID, 
            TRX_YPE, CHANNEL, DESCRIPTION, AMOUNT_DEBITED, 
            AMOUNT_CREDITED, RUNNING_BALANCE, REASON_TYPE 
            FROM statements.ACCOUNTSTATEMENT_NEW 
            WHERE DATE(TRX_DATETIME) 
            BETWEEN ? AND ? And MSISDN = ? OR MSISDN = ?   ;`,
};
const fetchQuery = (name) => queries[name] || null;

module.exports = fetchQuery;
