import { accountStatementData } from "./constants";


const getTransactionType = data => {
    const { trxType } = accountStatementData;
    return trxType[data];
}

export default { getTransactionType };