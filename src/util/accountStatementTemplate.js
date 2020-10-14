import path from 'path';
import moment from 'moment';
import logger from './logger';


const dirName = `${path.dirname(__dirname)}/public/assets`;

const htmlHead = `<!DOCTYPE html>
<head>
	<meta charset="utf-8">
		<meta http-equiv="X-UA-Compatible" content="IE=edge">
		<meta name="viewport" content="width=device-width, initial-scale=1">
		<title>Title</title>
		<link href="file://${dirName}/css/reset.css" rel="stylesheet">
		<link href="file://${dirName}/css/style.css" rel="stylesheet">
</head><body>
<header>
	<div class="headerLogo">
		<img class="headerLogo-img" src="file://${dirName}/images/JazzCash_logo.png" />
	</div>`;

const htmlFoot = `<footer>
<div class="disclaimer">
	<b>Disclaimer:</b>
	<p>This is an electronic statement.</p></br>
	<p> This file may contain information that is privileged and/or confidential under applicable laws. If you are not the intended recipient of this file, you should delete it immediately and are hereby notified that any dissemination, copy or disclosure of this file is strictly prohibited. Including any unauthorized use or communication of this file in whole or in part.
	</p></br>
	<p>
		Mobilink Microfinance Bank will not be Liable for the improper or incomplete transmission of the information contained in this file nor for any delay in its receipt or damage to your system. Mobilink Microfinance Bank does not guarantee that the integrity of this file has been maintained nor that this communication is free of viruses, interceptions or interferences. </p>
</div>
<div class="copyright">
	<div class="helpline">
		<p>Customer Helpline: <b>444</b> | UAN: 111-124-444</p>
		<b>wwww.jazzcash.com.pk</b>
	</div>
	<div class="footerlogo">
		<img src="file://${dirName}/images/mobilink-microfinance.png"
	</div>

</div>
</footer>
</body>
</html>`;
/**
 * 
 * @param {*} accountData
 */
const accountStatementTemplate = accountData => {

    try {
        logger.info({ event: 'Entered function', functionName: 'accountStatementTemplate' });
        const pageSize = 9;

        // console.log(JSON.stringify(accountData.payload));

        const accountDetails = `<div class="headerTable">
		<div><b>Date of Issue: </b>${moment(accountData.payload.start_date).format('DD-MM-YYYY')}</div>
		<div><b>Account Title: </b>Nishat Linen</div>
		<div><b>Account Number: </b>${accountData.payload.msisdn}</div>
		<div><b>Account Type: </b>Premium Business Account</div>
		<div><b>Statement Period: </b>${moment(accountData.payload.start_date).format('DD-MM-YYYY')} - ${moment(accountData.payload.end_date).format('DD-MM-YYYY')}</div>
		</div>
		</header>
		<main>
		
		`;
        let htmlString = ``;
        if (accountData.data.length === 0) {
            logger.info({ event: 'Entered block accountData.data.length === 0 ', functionName: 'accountStatementTemplate' });
            htmlString = `${htmlHead}${accountDetails}<div class="section">
			<div class="heading">
			<h1>
			Statement of Account
			</h1></div><div class="mainSection"><i class="noData">No transactions performed during the selected period.</i></div></div></main>${htmlFoot}`;
            logger.info({ event: 'Exited function', functionName: 'accountStatementTemplate' });
            return htmlString;
        } else {
            logger.info({ event: 'Entered block accountData.data.length > 0 ', functionName: 'accountStatementTemplate' });
            const openingBalance = parseFloat(accountData.data[0][accountData.data[0].length - 1]).toFixed(2);
            const closingBalance = parseFloat(accountData.data[accountData.data.length - 1][accountData.data[0].length - 1]).toFixed(2);
            let creditTransactions = 0;
            let debitTransactions = 0;
            let totalCredit = 0;
            let totalDebit = 0;
            accountData.data.forEach((number) => {
                totalCredit += parseFloat(number[number.length - 2]);
                totalDebit += parseFloat(number[number.length - 3]);
                if (parseFloat(number[number.length - 2]) > parseFloat(0))
                    creditTransactions++;
                if (parseFloat(number[number.length - 3]) > parseFloat(0))
                    debitTransactions++;
            });
            totalCredit = parseFloat(totalCredit).toFixed(2);
            totalDebit = parseFloat(totalDebit).toFixed(2);
            const statementSummary = `<div class="section">
		<div class="heading">
			<h1>
				Statement Summary
				</h1>
			</div>
		</div>
		<div class="statementSummary">
			<div class="statementBalance">
				<div>Opening Balance: Rs ${openingBalance}</div>
			</div>
			<div class="statementDetails">
				<div>Total Credit Amount: <b>Rs. ${totalCredit}</b></div>
				<div>Total Credit Transactions: <b>${creditTransactions}</b></div>
				<div>Average Credit Transactions: <b>Rs. ${parseFloat(totalCredit / creditTransactions).toFixed(2)}</b></div>
				<div>&nbsp;</div>
				<div>Total Debit Amount: <b>Rs. ${totalDebit}</b></div>
				<div>Total Debit Transactions: <b>${debitTransactions}</b></div>
				<div>Average Debit Transactions: <b>Rs. ${parseFloat(totalDebit / debitTransactions).toFixed(2)}</b></div>
			</div>
		
			<div class="statementBalance">
				<div>Closing Balance: Rs. ${closingBalance}</div>
			</div>
			
		</div>`;


            let statementTableHeader = accountData.headers.map(header => `<th>${header}</th>`);
            statementTableHeader = statementTableHeader.join().replace(/,/g, '');
            let slicedArray = [];

            // if (accountData.data.length <= pageSize) {
            //     slicedArray = accountData.data;
            //     console.log(slicedArray);
            // } else {
            slicedArray = accountData.data.map((item, index) => {
                return index % pageSize === 0 ? accountData.data.slice(index, index + pageSize) : null;
            }).filter((item) => { return item; });
            // }

            slicedArray.forEach((item, index) => {
                let pagination = `<div class="section">
				<div class="heading">
				<h1>
				Statement of Account
				</h1>
				<i>${index + 1} of ${slicedArray.length}</i> <b>Page </b> 
				</div>
			</div>`;
                htmlString += `${htmlHead}${accountDetails}${pagination}<div class="main-section"><table><thead>${statementTableHeader}</thead>`;
                let page = item.map(row => {
                    let column = row.map((col, ind) => { if (ind != 2) { return ind > 5 ? `<td>${parseFloat(col).toFixed(2)}</td>` : `<td>${col}</td>`; } });
                    column = column.join().replace(/,/g, '');
                    return `<tr>${column}</tr>`;
                });
                page = page.join().replace(/,/g, '');
                htmlString += `<tbody>${page}</tbody></table><div class="main-section">`;

                htmlString += index === slicedArray.length - 1 ? `${statementSummary}</main>${htmlFoot}` : `</main>${htmlFoot}`;

            });
            logger.info({ event: 'Exited function', functionName: 'accountStatementTemplate' });
            return htmlString;
        }

    } catch (error) {

        logger.error({ event: 'Error thrown ', functionName: 'accountStatementTemplate', error, accountData });
        logger.info({ event: 'Exited function', functionName: 'accountStatementTemplate' });
        throw new Error(`error in account statement template  ${error}`);
    }


};

export default accountStatementTemplate;