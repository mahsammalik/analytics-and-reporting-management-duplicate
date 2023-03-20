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
	<p>This is a system generated tax statement and does not require any signatures.</p></br>
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
const taxStatementConsumerTemplate = accountData => {
	try {
        const {
            accountTitle,
            accountNumber,
            accountLevel,
            taxPeriod,
            endDate,
            balance,
            balanceInWords,
            openingBalance,
            closingBalance,
            timePeriod,
            taxDeduction,
            taxDeductionInWords
        } = getStatementMappedData(accountData.data);
        logger.info();
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
	Account Details
</b>
	</div>

	<div class="taxDetails">
		<div>
			<div>Account Title </div>${accountTitle}</b>
		</div>
		<div>
			<div>Account Number </div>${accountNumber}</b>
		</div>
		<div>
			<div>Account Type </div>${accountLevel}</b>
		</div>
	</div>
	<div class="taxHeading">
		<b>
Account Balance from ${taxPeriod}
</b>
	</div>

	<div class="taxDetails">
		<div>
			<div>Balance as of Ending Date </div>${endDate}</b>
		</div>
		<div>
			<div>Balance in Amount </div>Rs ${balance}</b>
		</div>
		<div>
			<div>Balance in Words </div>${balanceInWords}</b>
		</div>
        <div>
			<div>Opening Balance </div>Rs ${openingBalance}</b>
		</div>
        <div>
			<div>Closing Balance </div>Rs ${closingBalance}</b>
		</div>

	</div>
	<div class="taxHeading">
		<b>
Withholding Tax Deducted:
</b>
	</div>

	<div class="taxDetails">
		<div>
			<div>Time Period of Certificate</div> ${timePeriod} </b>
		</div>
		<div>
			<div>Tax Deduction</div>Rs ${taxDeduction}</b>
		</div>
        <div>
			<div>Tax Deduction in Words</div>Rs ${taxDeductionInWords}</b>
		</div>
	</div>
</main>${htmlFoot}`;

		return htmlString;
	} catch (error) {
		logger.error(error);
		return new Error(`error:  ${error}`);
	}


};

const getStatementMappedData = (data) => {
    try{
        logger.info({
            event: 'Tax Statement Data for Mapping',
            data
        });
        return {
            accountTitle: data[0] || "",
            accountNumber: data[1] || "",
            accountLevel: data[2] || "",
            taxPeriod: data[3] || "",
            endDate: data[4] || "",
            balance: data[5] || 0,
            balanceInWords: data[6] || "",
            openingBalance: data[7] || 0,
            closingBalance: data[8] || 0,
            timePeriod: data[9] || "",
            taxDeduction: data[10] || 0,
            taxDeductionInWords: data[11] || ""
        }
    }catch(err){
        logger.error(err);
        return new Error(`error:  ${err}`);
    }
}

export default taxStatementConsumerTemplate;