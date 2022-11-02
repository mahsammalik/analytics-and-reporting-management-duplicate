import path from 'path';
import numberConverter from 'number-to-words';
import logger from './logger';
import moment from 'moment';
const dirName = `${path.dirname(__dirname)}/public/assets`;

const htmlHead = `<!DOCTYPE html>
<head>
	<meta charset="utf-8">
		<meta http-equiv="X-UA-Compatible" content="IE=edge">
		<meta name="viewport" content="width=device-width, initial-scale=1">
		<title>Title</title>
		<link href="file:///${dirName}/css/reset.css" rel="stylesheet">
		<link href="file:///${dirName}/css/style.css" rel="stylesheet">
</head><body>
<header>
	<div class="headerLogo">
		<img class="headerLogo-img" src="file:///${dirName}/images/JazzCash_logo.png" />
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
		<img src="file:///${dirName}/images/mobilink-microfinance.png"
	</div>

</div>
</footer>
</body>
</html>`;
/**
 * 
 * @param {*} accountData
 */
const taxStatementTemplate = accountData => {

	try {

		logger.debug(`payload ${JSON.stringify(accountData.payload)}`);
		logger.debug(`account data ${JSON.stringify(accountData.data)}`);
		logger.debug(`account data2 ${JSON.stringify(accountData.data2)}`);

		console.log(`payload ${JSON.stringify(accountData.payload)}`);
		console.log(`account data ${JSON.stringify(accountData.data)}`);
		console.log(`account data2 ${JSON.stringify(accountData.data2)}`);

		const WithdrawWhtTax = accountData.data.map(tax => tax[6]).reduce(function (a, b) {
			return a + b;
		}, 0) || 0;
		const PostProfitingWhtTax = accountData.data.map(tax => tax[7]).reduce(function (a, b) {
			return a + b;
		}, 0) || 0;
		const totalTax = Number.parseFloat(WithdrawWhtTax + PostProfitingWhtTax).toFixed(2);
		const taxInWords = numberConverter.toWords(totalTax).charAt(0).toUpperCase() + numberConverter.toWords(totalTax).slice(1);
		console.log("TAX:  ", taxInWords, totalTax)
		const numberInWords = numberConverter.toWords(Number.parseFloat(accountData.payload.updatedRunningbalance) || 0).charAt(0).toUpperCase() + numberConverter.toWords(Number.parseFloat(accountData.payload.updatedRunningbalance) || 0).slice(1);
		const openingBalance = parseFloat(accountData.data2[0][accountData.data2[0].length - 2] / 100).toFixed(2);
		const closingBalance = parseFloat(accountData.data2[accountData.data2.length - 2][accountData.data2[0].length - 2] / 100).toFixed(2);
		let creditTransactions = 0;
		let debitTransactions = 0;
		let totalCredit = 0;
		let totalDebit = 0;
		accountData.data2.forEach((number) => {
			totalCredit += parseFloat(number[number.length - 4] / 100) || 0;
			totalDebit += parseFloat(number[number.length - 5] / 100) || 0;
			if (parseFloat(number[number.length - 4]) > parseFloat(0))
				creditTransactions++;
			if (parseFloat(number[number.length - 5]) > parseFloat(0))
				debitTransactions++;
		});
		totalCredit = parseFloat(totalCredit).toFixed(2);
		totalDebit = parseFloat(totalDebit).toFixed(2);

		console.log("TOTAL <> ========================================",totalCredit)
		console.log("TOTAL <---> ========================================",totalDebit)
	

		const statementSummary = `<div class="section" >
		<div class="heading">
			<h1>
				Statement Summary
				</h1>
			</div>
		</div>
		<div class="statementSummary">
			<div class="statementBalance">
				<b>Opening Balance: Rs ${openingBalance ? openingBalance.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",") : 0}</b>
			</div>
			<div class="statementDetails">
				<div>Total Credit Amount: <b>Rs. ${totalCredit ? totalCredit.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",") : 0}</b></div>
				<div>Total Credit Transactions: <b>${creditTransactions ? creditTransactions.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",") : 0}</b></div>
				<div>Average Credit Transactions: <b>Rs. ${creditTransactions > 0 ? parseFloat(totalCredit / creditTransactions).toFixed(2).toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",") : 0}</b></div>
				<div>&nbsp;</div>
				<div>Total Debit Amount: <b>Rs. ${totalDebit ? "-" + totalDebit.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",") : 0}</b></div>
				<div>Total Debit Transactions: <b>${debitTransactions ? debitTransactions.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",") : 0}</b></div>
				<div>Average Debit Transactions: <b>Rs. ${debitTransactions > 0 ? parseFloat(totalDebit / debitTransactions).toFixed(2).toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",") : 0}</b></div>
			</div >

	<div class="statementBalance">
		<b>Closing Balance: Rs. ${closingBalance ? closingBalance.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",") : 0}</b>
	</div>
			
		</div>`;
		const accountDetails = `<div class="headerTable">
		<div><b>Date: </b>${moment().format('DD-MMM-YYYY')}</div>
	</div>
		</header>
		<main>
		<div class="section">
		<div class="heading">
		<h1>
		Certificate of Tax Deduction
		</h1>
		</div>
		`;

		let htmlString = `${htmlHead}${accountDetails}<div class="taxHeading">
		<b>
	Account Details:
</b>
	</div>

	<div class="taxDetails">
		<div>
			<div>Account Title </div>${accountData.payload.merchantName}</b>
		</div>
		<div>
			<div>Account Number </div>${accountData.payload.msisdn}</b>
		</div>
		<div>
			<div>Account Type </div>${accountData.payload.accountLevel || ''}</b>
		</div>
		${accountData.payload && accountData.payload.metadata && accountData.payload.metadata.cnic ? `<div>
			<div>CNIC Number </div>${accountData.payload.metadata.cnic || ''}</b>
		</div>`: ''}
	</div>
	<div class="taxHeading">
		<b>
Account Balance:
</b>
	</div>

	<div class="taxDetails">
		<div>
			<div>Balance of Account as of </div>${accountData.payload.end_date}</b>
		</div>
		<div>
			<div>Balance (in figures) </div>Rs ${accountData.payload.updatedRunningbalance ? Number.parseFloat(accountData.payload.updatedRunningbalance).toFixed(2) : 0}</b>
		</div>
		<div>
			<div>Balance (in words) </div>${numberInWords}</b>
		</div>

	</div>
	<div class="taxHeading">
		<b>
Withholding Tax Deducted:
</b>
	</div>

	<div class="taxDetails">
		<div>
			<div>Time Period of statement</div> ${accountData.payload.start_date} - ${accountData.payload.end_date}</b>
		</div>
		<div>
			<div>Tax Deposited</div>Rs ${totalTax}</b>
		</div>
	</div>
	${statementSummary}
</main>${htmlFoot}`;

		return htmlString;
	} catch (error) {
		logger.error(error);
		return new Error(`error:  ${error}`);
	}


};

export default taxStatementTemplate;