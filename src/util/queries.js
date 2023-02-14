

module.exports = {

    "getValueArrayMerchant": () => {
        return "Select * from statements.ACCOUNTSTATEMENT where DATE(TRX_DATETIME) BETWEEN ? AND ? And MSISDN = ? OR MSISDN = ?   ;"
    },
    "getValueArray": () => {
        return "Select * from statements.ACCOUNTSTATEMENT where DATE(TRX_DATETIME) BETWEEN ? AND ? And MSISDN = ? OR MSISDN = ?   ;"
    },
    "taxStatement": (customerMobileNumer, mappedMsisdn, startDate, endDate) => {
        return `Select * from statements.TAXSTATEMENT where (MSISDN = '${customerMobileNumer}' OR MSISDN = '${mappedMsisdn}') And (Date(TRX_DATETIME) BETWEEN '${startDate}' AND '${endDate}')   ;`
    }

}
