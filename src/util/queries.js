module.exports = {

    getValueArrayMerchant: () => {
        return (`SELECT * FROM statements.ACCOUNTSTATEMENT 
                WHERE DATE(TRX_DATETIME) 
                BETWEEN ? AND ? And MSISDN = ? OR MSISDN = ?`)
    },
    getValueArray: () => {
        return `SELECT * FROM statements.ACCOUNTSTATEMENT WHERE DATE(TRX_DATETIME) BETWEEN ? AND ? And MSISDN = ? OR MSISDN = ?   ;`;
    },
    taxStatement: (customerMobileNumer, mappedMsisdn, startDate, endDate) => {
        return `SELECT * FROM statements.TAXSTATEMENT WHERE (MSISDN = '${customerMobileNumer}' OR MSISDN = '${mappedMsisdn}') And (Date(TRX_DATETIME) BETWEEN '${startDate}' AND '${endDate}')   ;`;
    },

};
