import { accountStatementData } from "./constants";

export const getTransactionType = trx => {
    const { trxType } = accountStatementData;
    return trxType[trx] ? trxType[trx] : trx;
}

// getTransactionChannel = (channel, trxType) => {
//     const { channel } = accountStatementData;
    
// }