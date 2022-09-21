import { accountStatementData } from "./constants";

export const getTransactionType = type => {
    const { trxType } = accountStatementData;
    return trxType[type] ? trxType[type] : trx;
}

export const getTransactionChannel = (trxChannel, type) => {
    const { channel, trxType } = accountStatementData;
    const apiChannel = trxType[type] === 'ATM Withdrawal' ? 'Debit Card' : trxChannel;
    const otherChannel = channel[trxChannel] ? channel[trxChannel] : trxChannel;
    return trxChannel === 'API' ? apiChannel : otherChannel;
}

export const getTransactionDescription = (desc, type, reason, amount, msisdn) => {
    if(type === 'Utility Bills Payment' || type === 'Utility Bill Payment'){

        if(reason.includes('Customer Pay Bill for') || reason.includes('OMNO Customer Pay Bill for')){
            const companyName = reason.split(' for')[1].split('-')[0];
            const account = msisdn ? msisdn.replace(/\d(?=\d{4})/g, "*") : '';
            return `Bill Payment Made to ${companyName} of amount ${amount} from JazzCash Account ${account}`
        }else if(reason.includes('ReadyCash Self Repay')){
            return `ReadyCash loan repayment`
        }else if(reason.includes('Customer Buy Load') || reason.includes('Customer Buys Prepaid Load for') || reason.includes('OMNO Customer Buys Prepaid Load')){
            const companyName = reason.split(' for')[1].split('-')[0];
            return `Mobile Prepaid Load - ${companyName}`;
        }else{
            return desc;
        }

    }else if(type === 'Donation'){

        if(reason.includes('Customer Donate OR Customer Donation')){
            const companyName = reason.split(' ').slice(2).join(' ').split('-')[0];
            return `Donation at ${companyName}`;
        }else return desc;

    }else if(type === 'Transfer(C2C)'){
        const account = desc ? desc.split('92')[1].replace(/\d(?=\d{4})/g, "*") : '';
        return `Money transfer to JazzCash account ${account}`;
    }else if(type === 'Transfer(C2B)'){
        return reason.includes('RAAST') ? `Money Transfer via RAAST` : `Money Transfer From JazzCash Account`
    }else if(type === 'Transfer(B2C)'){
        const account = desc ? desc.split('92')[1].replace(/\d(?=\d{4})/g, "*") : '';
        return `Payment Received to JazzCash Account ${account}`
    }else if(type === 'Refund Merchant Payment'){
        return reason.includes('Insurance Reversal') ? `Insurance Payment Reversal` : desc;
    }else if(type === 'Profit Disburse'){
        return `Savings Profit`
    }if(type === 'Online Payment'){
        const account = msisdn ? msisdn.replace(/\d(?=\d{4})/g, "*") : '';
        return `Successful Online Payment Request From JazzCash Account ${account}`
    }else if(type === 'Merchant Payment'){
        if(reason.includes('Insurance')){
            return `Insurance Plan Payment`
        }else if(reason.includes('Bundles')){
            return reason
        }else if(reason.includes('Merchant Payment') || reason.includes('Customer Payment')){
            const account = msisdn ? msisdn.replace(/\d(?=\d{4})/g, "*") : '';
            return `Till Payment from JazzCash Account ${account}`
        }else{
            return desc;
        }
    }else if(type === 'Loan Repayment'){
        return reason.includes('Alfalah Repayment') ? `ReadyCash by Alfalah Loan Repayment` : `Loan Repayment`
    }else if(type === 'Loan Disbursement'){
        if(reason.includes('ReadyCash Loan Disbursement')){
            return `ReadyCash Loan Disbursement`
        }else if(reason.includes('Alfalah Disbursement')){
            return `ReadyCash by Alfalah Loan Disbursement`
        }else{
            return desc;
        }
    }else if(type === 'Jazz Load (Prepaid top-up)'){
        if(reason.includes('Customer Buys Jazz Bundles')){
            return `Prepaid Jazz Bundle Subscription`;
        }else{
            const account = desc ? desc.split('92')[1].replace(/\d(?=\d{4})/g, "*") : '';
            return `Mobile Prepaid Load - Jazz ${account}`
        }
    }else if(type === 'Incoming IBFT'){
        const account = msisdn ? msisdn.replace(/\d(?=\d{4})/g, "*") : '';
        return `Amount received to JazzCash Account ${account}`
    }else if(type === 'IBFT Outgoing Customer'){
        const account = desc ? desc.split('92')[1].replace(/\d(?=\d{4})/g, "*") : '';
        return `Money sent to ${account}`
    }else if(type === 'IBFT Credit'){
        const account = msisdn ? msisdn.replace(/\d(?=\d{4})/g, "*") : '';
        return `Amount Received to JazzCash Account ${account}`
    }else if(type === 'Cash out at Retailer' || type === 'Cash out'){
        return `Money Withdrawal from Retailer`
    }else if(type === 'Cash in at Retailer'){
        const account = msisdn ? msisdn.replace(/\d(?=\d{4})/g, "*") : '';
        return `Amount Credited to JazzCash Account ${account}`;
    }else if(type === 'Cash in'){
        const account = msisdn ? msisdn.replace(/\d(?=\d{4})/g, "*") : '';
        return `Amount Credited to JazzCash Account ${account}`
    }else if(type === 'Auto Debit'){
        if(reason.includes('Loan Repayment')){
            return `Loan Repayment`
        }else if(reason.includes('Microensure Insurance')){
            return `Insurance Plan Recurring Payment`
        }else{
            return desc;
        }
    }else{
        return desc;
    }
} 