import moment from 'moment';
import { accountStatementData } from "./constants";
import logger from "./logger";

const getTransactionType = type => {
    logger.info({
        event: "accountStatement.getTransactionType",
        type
    })
    const { trxType } = accountStatementData;
    return trxType[type] ? trxType[type] : type;
}

const getTransactionChannel = (trxChannel, type) => {
    logger.info({
        event: "accountStatement.getTransactionChannel",
        data: { trxChannel, type }
    })
    const { channel, trxType } = accountStatementData;
    const apiChannel = trxType[type] === 'ATM Withdrawal' ? 'Debit Card' : trxChannel;
    const otherChannel = channel[trxChannel] ? channel[trxChannel] : trxChannel;
    return trxChannel === 'API' ? apiChannel : otherChannel;
}

const getCompanyNamebySpace = reason => {
    logger.info({
        event: "accountStatement.getCompanyNamebySpace",
        reason
    })
    //Company name starts after second space and continue till 'via' occurs
    return reason.split(" ").slice(2).join(" ").split("via")[0];
}

const getCompanyNamebyFor = reason => {
    //Company name starts after 'for' and continue till 'via' or 'at' occurs
    logger.info({
        event: "accountStatement.getCompanyNamebyFor",
        reason
    })
    replace(/00/g,'')
    return reason.split(" for")[1].replace(/at/g, "via").split("via")[0] || "";
}

const getAccountbyMSISDN = msisdn => {
    logger.info({
        event: "accountStatement.getAccountbyMSISDN",
        msisdn
    })
    return msisdn ? msisdn.replace(/\d(?=\d{4})/g, "*") : '' || "";
}

const getAccountByDescription = desc => {
    logger.info({
        event: "accountStatement.getAccountByDescription",
        desc
    })
    return desc ? desc.split('92')[1]?.replace(/\d(?=\d{4})/g, "*") : '' || "";
}

const getTransactionDescription = (desc = '', type = '', reason = '', amount = 0, msisdn = '') => {
    logger.info({
        event: "accountStatement.getTransactionDescription",
        data: { desc, type, reason, amount, msisdn }
    })

    if(type === 'Utility Bills Payment' || type === 'Utility Bill Payment'){
        if(reason?.includes('Customer Pay Bill for') || reason?.includes('OMNO Customer Pay Bill for')){
            const companyName = getCompanyNamebyFor(reason);
            const account = getAccountbyMSISDN(msisdn);
            return `Bill Payment Made to ${companyName} of amount ${amount} from JazzCash Account ${account}`
        }else if(reason?.includes('ReadyCash Self Repay')){
            return `ReadyCash loan repayment`
        }else if(reason?.includes('Customer Buy Load') || reason?.includes('Customer Buys Prepaid Load for') || reason?.includes('OMNO Customer Buys Prepaid Load')){
            const companyName = getCompanyNamebyFor(reason);
            return `Mobile Prepaid Load - ${companyName}`;
        }else{
            return desc;
        }
    }else if(type === 'Donation'){

        if(reason?.includes('Customer Donate OR Customer Donation')){
            const companyName = getCompanyNamebySpace(reason);
            return `Donation at ${companyName}`;
        }else return desc;

    }else if(type === 'Transfer(C2C)'){
        const account = getAccountByDescription(desc);
        return `Money transfer to JazzCash account ${account}`;
    }else if(type === 'Transfer(C2B)'){
        return reason?.includes('RAAST') ? `Money Transfer via RAAST` : `Money Transfer From JazzCash Account`
    }else if(type === 'Transfer(B2C)'){
        const account = getAccountByDescription(desc);
        return `Payment Received to JazzCash Account ${account}`
    }else if(type === 'Refund Merchant Payment'){
        return reason?.includes('Insurance Reversal') ? `Insurance Payment Reversal` : desc;
    }else if(type === 'Profit Disburse'){
        return `Savings Profit`
    }else if(type === 'Online Payment'){
        const account = getAccountbyMSISDN(msisdn);
        return `Successful Online Payment Request From JazzCash Account ${account}`
    }else if(type === 'Merchant Payment'){
        if(reason?.includes('Insurance')){
            return `Insurance Plan Payment`
        }else if(reason?.includes('Bundles')){
            return reason
        }else if(reason?.includes('Merchant Payment') || reason?.includes('Customer Payment')){
            const account = getAccountbyMSISDN(msisdn);
            return `Till Payment from JazzCash Account ${account}`
        }else{
            return desc;
        }
    }else if(type === 'Loan Repayment'){
        return reason?.includes('Alfalah Repayment') ? `ReadyCash by Alfalah Loan Repayment` : `Loan Repayment`
    }else if(type === 'Loan Disbursement'){
        if(reason?.includes('ReadyCash Loan Disbursement')){
            return `ReadyCash Loan Disbursement`
        }else if(reason?.includes('Alfalah Disbursement')){
            return `ReadyCash by Alfalah Loan Disbursement`
        }else{
            return desc;
        }
    }else if(type === 'Jazz Load (Prepaid top-up)'){
        if(reason?.includes('Customer Buys Jazz Bundles')){
            return `Prepaid Jazz Bundle Subscription`;
        }else{
            const account = getAccountByDescription(desc);
            return `Mobile Prepaid Load - Jazz ${account}`
        }
    // }else if(type === 'Incoming IBFT'){
    //     const account = getAccountbyMSISDN(msisdn);
    //     return `Amount received to JazzCash Account ${account}`
    // }else if(type === 'IBFT Outgoing Customer'){
    //     const account = getAccountByDescription(desc);
    //     return `Money sent to ${account}`
    // }else if(type === 'IBFT Credit'){
    //     const account = msisdn ? msisdn.replace(/\d(?=\d{4})/g, "*") : '';
    //     return `Amount Received to JazzCash Account ${account}`
    }else if(type === 'Cash out at Retailer' || type === 'Cash out'){
        return `Money Withdrawal from Retailer`
    }else if(type === 'Cash in at Retailer'){
        const account = getAccountbyMSISDN(msisdn);
        return `Amount Credited to JazzCash Account ${account}`;
    }else if(type === 'Cash in'){
        const account = getAccountbyMSISDN(msisdn);
        return `Amount Credited to JazzCash Account ${account}`
    }else if(type === 'Auto Debit'){
        if(reason?.includes('Loan Repayment')){
            return `Loan Repayment`
        }else if(reason?.includes('Microensure Insurance')){
            return `Insurance Plan Recurring Payment`
        }else{
            return desc;
        }
    }else{
        return desc;
    }
} 

export const getMappedAccountStatement = arr => {
    logger.info({
        event: "Data in accountStatement.getMappedAccountStatement",
        data: arr
    })
    const [msisdn, date, trxId, trxType, channel, desc, amountDebit, amountCredit, runningBalance, reason] = arr;
    const description = desc === null ? '&#8203' : desc;
    return [
        moment(date).format('DD-MMM-YYYY HH:mm:ss'),
        trxId,
        getTransactionType(trxType),
        getTransactionChannel(channel, trxType),
        getTransactionDescription(description, trxType, reason, amountDebit, msisdn),
        amountDebit,
        amountCredit,
        runningBalance
    ];
}