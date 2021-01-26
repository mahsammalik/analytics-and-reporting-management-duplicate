import axios from 'axios';
import { logger } from '/util/';

const userProfileURL = process.env.USER_PROFILE_URL || config.externalServices.accountManagementAPI.userProfileURL;

/**
 * 
 * @param {Array} headers 
 * @return {Array} "merchantProfile": {
		"identityID": "12424123232",
		"level": "M1",
		"msisdn": "923462104357",
		"cnic": "3412312312321",
		"uID": null,
		"dob": "1992-12-13",
		"firstNameEn": "JK",
		"firstNameUr": "JK",
		"lastNameEn": "JK",
		"lastNameUr": "JK",
		"email": "jk@ibm.com.pk",
		"profileImageURL": "c0a44caf-5a7b-46ea-99e9-ecc96021753f.jpg",
		"businessDetails": {
			"businessName": "JK Milk Shop",
			"merchantType": "Food",
			"businessAddress": "D.H.A Phase II, Karachi",
			"website": "https://facebook.com/jk",
			"shortCode": null,
			"operatorID": null,
			"userName": null
		},
		"language": "en",
		"customerType": "merchant",
		"firstLoginTS": "2020-06-19T12:10:06.000Z",
		"signupBonusTS": "2020-06-19T12:10:06.000Z",
		"requestToPay": null,
		"registrationDate": "2020-10-02T15:03:33.278Z",
		"expiryDate": null
	}
 */
const getUserProfile = headers => {
	try {

		logger.info({ event: 'Entered function', functionName: 'getUserProfile', headers, userProfileURL });
		const headerFields = {
			'Content-Type': headers['content-type'] || '',
			'X-MSISDN': headers['x-msisdn'] || '',
			'X-META-DATA': headers['x-meta-data'] || '',
			'X-APP-TYPE': headers['x-app-type'] || '',
			'x-channel': headers['x-channel'] || '',
			'x-device-id': headers['x-device-id'] || '',
			'X-IBM-CLIENT-ID': headers['x-ibm-client-id'] || '',
			'X-IP-ADDRESS': headers['x-ip-address'] || '',
			'X-APP-Version': headers['x-app-version'] || '',
		};
		console.log("REQUEST HEADERS IN PROFILE CALL: ", headerFields)
		const profile = await axios.get(userProfileURL, { headers: headerFields }).then(result => {
			console.log(result, "   result IN PROFILE CALL")
			return result.data.data.businessDetails || result.data.data ? { businessName: result.data.data.firstNameEn + " " + result.data.data.lastNameEn, accountLevel: result.data.data.level || '' } : {};
		}).catch(error => {
			console.log("ERROR IN PROFILE CALL: ", headerFields, error)
			logger.error({ event: 'Error thrown', functionName: 'getUserProfile', error });
			return {};
		});
		logger.info({ event: 'Exited function', functionName: 'getUserProfile', userProfileURL, profile });
		return profile;
	} catch (error) {
		logger.error({ event: 'Error thrown', functionName: 'getUserProfile', error });
		logger.info({ event: 'Exited function', functionName: 'getUserProfile' });
		return {};
	}
};

export default getUserProfile;