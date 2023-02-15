import path from "path";
import moment from "moment";
import logger from "./logger";

const dirName = `${path.dirname(__dirname)}/public/assets`;

const htmlFoot = `<footer>
<div class="disclaimer">
	<b >Disclaimer:</b>
	<p style="margin-top: 3pt">This is an electronic statement.</p></br>
	<p> This file may contain information that is privileged and/or confidential under applicable laws. If you are not the intended recipient of this file, you should delete it immediately and are hereby notified that any dissemination, copy or disclosure of this file is strictly prohibited. Including any unauthorized use or communication of this file in whole or in part.
	</p></br>
	<p>
		Mobilink Microfinance Bank will not be Liable for the improper or incomplete transmission of the information contained in this file nor for any delay in its receipt or damage to your system. Mobilink Microfinance Bank does not guarantee that the integrity of this file has been maintained nor that this communication is free of viruses, interceptions or interferences. </p>
</div>
<div class="copyright">
	<div class="helpline">
		<p>Customer Helpline: <b>4444</b> | UAN: <b>111-124-4444</b></p>
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
 * Returns formated number like 1st, 2nd, 3rd, 4th
 * @param {*} day
 * @returns
 */
const nth = (day) => {
	if (day > 3 && day < 21) {
		return day + "th";
	}

	switch (day % 10) {
		case 1:
			return day + "st";
		case 2:
			return day + "nd";
		case 3:
			return day + "rd";
		default:
			return day + "th";
	}
};

/**
 * format date like 15th August, 2021
 * @param {*} date
 */
const formatEnglishDate = (date) => {
	return (
		nth(moment(date).format("DD")) +
		" " +
		moment(date).format("MMMM") +
		", " +
		moment(date).format("YYYY")
	);
};

/**
 *
 * @param {*} accountData
 */
const accountStatementTemplateMerchant = (accountData) => {
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
			<img class="headerLogo-img" src="file://${dirName}/images/${accountData.payload.channel === "consumerApp"
			? "JazzCash_logo"
			: "jazzcashbusinesslogo"
		}.png" />
		</div>`;
	try {
		logger.info({
			event: "Entered function",
			functionName: "accountStatementTemplateMerchant",
		});
		let pageSize = 7;

		//TODO: update account title based on input for metadata
		const accountDetails = `<div class="headerTable">
		<div style="line-height: 1.9;">Date of Issue: <b>${moment(
			accountData.payload.start_date
		).format("DD-MMM-YYYY")}</b></div>
		<div style="line-height: 1.9;">Account Title: <b>${accountData.payload.merchantName
			}</b></div>
		<div style="line-height: 1.9;">Account Number: <b>${accountData.payload.msisdn
			}</b></div>
		<div style="line-height: 1.9;">Account Type: <b>${accountData.payload.metadata.accountLevel ||
			accountData.payload.accountLevel ||
			""
			}</b></div>
		<div style="line-height: 1.8;">Statement Period: <b>${formatEnglishDate(
				accountData.payload.start_date
			)} - ${formatEnglishDate(accountData.payload.end_date)}</b></div>
		</div>
		</header>
		<main>
		
		`;
		let htmlString = ``;
		if (accountData.data.length === 0) {
			logger.info({
				event: "Entered block accountData.data.length === 0 ",
				functionName: "accountStatementTemplateMerchant",
			});
			htmlString = `${htmlHead}${accountDetails}<div class="section">
			<div class="heading">
			<h1>
			Statement of Account
			</h1></div><div class="mainSection"><i class="noData">No transactions performed during the selected period.</i></div></div></main>${htmlFoot}`;
			logger.info({
				event: "Exited function",
				functionName: "accountStatementTemplateMerchant",
			});
			return htmlString;
		} else {
			logger.info({
				event: "Entered block accountData.data.length > 0 ",
				functionName: "accountStatementTemplateMerchant",
			});
			const openingBalance = parseFloat(
				accountData.data[0][accountData.data[0].length - 2] / 100
			).toFixed(2);
			const closingBalance = parseFloat(
				accountData.data[accountData.data.length - 2][
				accountData.data[0].length - 2
				] / 100
			).toFixed(2);

			let creditTransactions = 0;
			let debitTransactions = 0;
			let totalCredit = 0;
			let totalDebit = 0;
			let totalFee = 0;
			accountData.data.forEach((number) => {
				totalFee += parseFloat(number[number.length - 3] / 100) || 0;
				totalCredit += parseFloat(number[number.length - 4] / 100) || 0;
				totalDebit += parseFloat(number[number.length - 5] / 100) || 0;
				if (parseFloat(number[number.length - 4]) > parseFloat(0))
					creditTransactions++;
				if (parseFloat(number[number.length - 5]) > parseFloat(0))
					debitTransactions++;
			});

			totalCredit = parseFloat(totalCredit).toFixed(2);
			totalDebit = parseFloat(totalDebit).toFixed(2);
			totalFee = parseFloat(totalFee).toFixed(2);

			const statementSummary = `<div class="section" >
		<div class="heading">
			<h1>
				Statement Summary
				</h1>
			</div>
		</div>
		<div class="statementSummary">
			<div class="statementBalance">
				<b>Opening Balance: Rs ${openingBalance
					? openingBalance
						.toString()
						.replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",")
					: 0
				}</b>
			</div>
			<div class="statementDetails">
				<div>Total Credit Amount: <b>Rs. ${totalCredit
					? totalCredit
						.toString()
						.replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",")
					: 0
				}</b></div>
				<div>Total Credit Transactions: <b>${creditTransactions
					? creditTransactions
						.toString()
						.replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",")
					: 0
				}</b></div>
				<div>Average Credit Transactions: <b>Rs. ${creditTransactions > 0
					? parseFloat(totalCredit / creditTransactions)
						.toFixed(2)
						.toString()
						.replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",")
					: 0
				}</b></div>
				<div>&nbsp;</div>
				<div>Total Debit Amount: <b>Rs. ${totalDebit
					? totalDebit
						.toString()
						.replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",")
					: 0
				}</b></div>
				<div>Total Debit Transactions: <b>${debitTransactions
					? debitTransactions
						.toString()
						.replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",")
					: 0
				}</b></div>
				<div>Average Debit Transactions: <b>Rs. ${debitTransactions > 0
					? parseFloat(totalDebit / debitTransactions)
						.toFixed(2)
						.toString()
						.replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",")
					: 0
				}</b></div>

				<div>Total Fee Amount: <b>${totalFee
					? totalFee
						.toString()
						.replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",")
					: 0
				}</b></div>

                </div >

				<div class="statementBalance">
					<b>Closing Balance: Rs. ${closingBalance
					? closingBalance
						.toString()
						.replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",")
					: 0
				}</b>
				</div>
			
		</div>`;

			const checkifsecondlastpage = (ind) =>
				ind === accountData.data.length && (ind % 7 >= 5 || ind % 7 == 0);

			let statementTableHeader = accountData.headers.map(
				(header) => `<th style="font-size: 6pt;">${header}</th>`
			);
			statementTableHeader = statementTableHeader.join().replace(/,/g, "");
			let slicedArray = [];

			slicedArray = accountData.data
				.map((item, index) => {
					if (checkifsecondlastpage(index + 1)) return [""];

					if (index % pageSize === 0)
						return accountData.data.slice(index, index + pageSize);

					return null;
				})
				.filter((item) => {
					return item;
				});

			slicedArray.forEach((item, index) => {
				let pagination = `<div class="section" style="margin-bottom: 5pt;" >
	<div class="heading">
		<h1 style="margin-right: -55pt;">
			Statement of Account
		</h1>
		<i style="margin: 0 3pt;font-style: italic;">${index + 1} of ${slicedArray.length
					}</i> <b style="font-style: italic;">Page </b>
	</div>
				</div>`;
				htmlString += `${htmlHead} ${accountDetails} ${pagination}<div class="main-section">`;
				if (item[0] !== "") {
					htmlString += `<table><thead>${statementTableHeader}</thead>`;
					let page = item.map((row) => {
						let column = row.map((col, ind) => {
							return ind >= 5 && ind <= 8
								? `<td style="font-size: 5pt;text-align:left;"><div style="font-size: 5pt;text-align:left;">${parseFloat(
									+col / 100
								)
									.toFixed(2)
									.toString()
									.replace(
										/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g,
										","
									)}</div></td>`
								: `<td style="font-size: 5pt;"><div style="font-size: 5pt; text-align:left;">${col.replace(
									/,/g,
									""
								)}</div></td>`;
						});
						column = column.join();
						return `<tr style="font-size: 5pt;">${column}</tr>`;
					});
					page = page.join().replace(/td>,<td/g, "td><td");
					page = page.replace(/tr>,<tr/g, "tr><tr");
					htmlString += `<tbody>${page}</tbody></table><div class="main-section">`;
				}

				htmlString +=
					index === slicedArray.length - 1
						? `${statementSummary}</main>${htmlFoot} `
						: `</main > ${htmlFoot} `;
			});
			logger.info({
				event: "Exited function",
				functionName: "accountStatementTemplateMerchant",
			});
			return htmlString;
		}
	} catch (error) {
		logger.error({
			event: "Error thrown ",
			functionName: "accountStatementTemplateMerchant",
			error,
			accountData,
		});
		logger.info({
			event: "Exited function",
			functionName: "accountStatementTemplateMerchant",
		});
		throw new Error(`error in account statement template  ${error} `);
	}
};

export default accountStatementTemplateMerchant;
