import path from 'path';
import moment from 'moment';
import logger from './logger';


const dirName = `${path.dirname(__dirname)}/public/assets`;

/**
 * 
 * @param {*} accountData
 */
const accountStatementEmailTemplate = ({ title, customerName, accountNumber, statementPeriod, accountLevel }) => {
	logger.info({ event: 'Entered function', functionName: 'accountStatementEmailTemplate' });
	logger.debug("accountStatementEmailTemplate details: ", title, customerName, accountNumber, statementPeriod, accountLevel)
	try {
		const htmlString = `
		<html>

		<head>
		  <meta charset="UTF-8" />
		  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
		  <meta http-equiv="X-UA-Compatible" content="ie=edge" />
		  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css" />
		
		  <title>JazzCash</title>
		  <style type="text/css">
			@font-face {
			  font-family: work-sans-italic;
			  src: url('${dirName}/fonts/Work_Sans/WorkSans-Italic-VariableFont_wght.ttf');
			}
		
			@font-face {
			  font-family: work-sans;
			  src: url('${dirName}/fonts/Work_Sans/WorkSans-VariableFont_wght.ttf');
			}
		  </style>
		</head>
		
		<body style="margin: 0px; max-width: 600px; margin: auto;">
		  <table border="0" cellpadding="0" cellspacing="0" align="center"
			style="margin:0px auto;width:100%;max-width: 600px; border-bottom:2px solid #B7A3A3;font-family:tahoma,arial;font-size:14px">
			<tbody>
			  <tr>
				<td style="
			   background-color: white;
			  background-image:url('file:///${dirName}/images/header@3x.png');
			  border-radius: 0px 0px 0px 32px;
			  display:block;border:0px;width:100%;max-width: 600px;height:216px
			  "> <a href="https://www.jazzcash.com.pk/" target="_blank"
	  >              <img
	  src="file:///${dirName}/images/jazzcashbusinesslogo.png"
					  height="216" border="0"
					  style="display:block;border:0px; width:40%; max-width: 300px; height:95px; object-fit: cover; padding-left: 15px; padding-top: 25px; min-width: 165px;"
					  class="CToWUd" />
		
				  </a>
				  <p style="
		font-family: work-sans Black; font-size:14px;  text-align:left;
		 font-style: normal;
		font-weight: normal;
		font-size: 24px;
		line-height: 28px;
		color: #FFFFFF;
		padding-top: 10px;
		padding-left: 25px;
		"><b>Dear ${customerName},</b></p>
			  </tr>
			  <tr>
				<td>
				  <table cellpadding="25" cellspacing="0" border="0">
					<tbody>
					  <tr>
						<td style="padding-bottom: 0px;">
						  Your ${title} is attached for:<br />
						  Account number : <b>${accountNumber}</b><br />
						  Account Type:<b> ${accountLevel}</b><br />
						  Statement Period: <b>${statementPeriod}</b><br />
						</td>
					  </tr>
					  <tr>
						<td>
		
						  <b>
							Regards,<br />
							JazzCash
						  </b>
						</td>
					  </tr>
					</tbody>
				  </table>
				</td>
			  </tr>
			  <tr>
				<td>
				  <table cellpadding="25" cellspacing="0" border="0">
					<tbody>
					  <tr>
						<td style="font-family: work-sans Black;font-size:11px;text-align:left;color:#727272">
						  <p><b>Disclaimer:</b></p>
						  <p>This is a system generated email.</p>
						  <p>This email (inlcuding any attachments) may contain information that is priviledged and/or
							confidential under applicable laws. If you are not the intended recipient of this email, you should
							delete it immediately and are hereby notified that any dissemination, copy or disclosure of email
							(innlcuding any attachments is strictly prohibited. Including any unauthorized use or communication
							of this email (including any attachments in whole or in part. </p>
						  <p>Mobilink Microfinance Bank will not be liable for the improper or incomplete transmission of the
							information contained in this communication nor for any delay in its receipts or damage to your
							system. Mobilink Microfinance Bank does not guarantee that the integrity of this communication has
							been maintained nor that this communication is free of viruses, interceptions or interferences. </p>
						  <p>Thank you <br> JazzCash</p>
						</td>
					  </tr>
					</tbody>
				  </table>
				</td>
			  </tr>
		
			</tbody>
		  </table>
		  <div style="display: flex; position: relative;">
			<div style="font-family: work-sans Black;
		  font-size: 11px;
		  font-style: normal;
		  font-weight: 400;
		  line-height: 13px;
		  letter-spacing: 0em;
		  text-align: left;
		  padding-left: 25px;
		  width: 50%;
		  color: #000000">
		
			  <p>Customer Helpline: <b>444</b> | UAN: <b>111-124-444</b></p>
			  <b>https://www.jazzcash.com.pk/.pk</b>
			</div>
			<div style="width: 50%;">
			  <img
			  src="file:///${dirName}/images/mobilink-microfinance.png"
				style="display:block;border:0px;width:100%;height:74px; max-width: 175px; margin: auto;" 
				/>
			</div>
		  </div>
		</body>
		
		</html>
		`;
		logger.info({ event: 'Exited function', functionName: 'accountStatementEmailTemplate' });
		return htmlString;


	} catch (error) {

		logger.error({ event: 'Error thrown ', functionName: 'accountStatementEmailTemplate', error, accountData });
		logger.info({ event: 'Exited function', functionName: 'accountStatementEmailTemplate' });
		throw new Error(`error in account statement template  ${error}`);
	}


};

export default accountStatementEmailTemplate;