import path from 'path';
import numberConverter from 'number-to-words';
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

        console.log(`payload ${JSON.stringify(accountData.payload)}`);
        console.log(`account data ${JSON.stringify(accountData.data)}`);

        const numberInWords = numberConverter.toWords(11110).charAt(0).toUpperCase() + numberConverter.toWords(11110).slice(1);
        const accountDetails = `<div class="headerTable">
		<div><b>Date: </b>20-Aug-2020</div>
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
			<div>Account Title </div>Nishat Linen</b>
		</div>
		<div>
			<div>Account Number </div>${accountData.payload.msisdn}</b>
		</div>
		<div>
			<div>Account Type </div>C2</b>
		</div>
		<div>
			<div>CNIC Number </div>42000-123123123123-1</b>
		</div>
	</div>
	<div class="taxHeading">
		<b>
Account Balance:
</b>
	</div>

	<div class="taxDetails">
		<div>
			<div>Balance of Account as of </div>30/6/2020</b>
		</div>
		<div>
			<div>Balance (in figures) </div>Rs 11,110.92</b>
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
			<div>Tax Deposited</div>Rs 11,110.92</b>
		</div>
	</div>
</main>${htmlFoot}`;

        return htmlString;
    } catch (error) {
        logger.error(error);
        return new Error(`error:  ${error}`);
    }


};

export default taxStatementTemplate;