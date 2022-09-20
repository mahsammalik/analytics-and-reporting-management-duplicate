import { accountStatementData } from "./constants";


export const getTransactionType = data => {
    const { trxType } = accountStatementData;
    return trxType[data];
}