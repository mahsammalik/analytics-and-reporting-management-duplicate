import axios from 'axios';
import { logger } from '/util/';

const userProfileURL = process.env.USER_PROFILE_URL || config.externalServices.accountManagementAPI.userProfileURL;
const userGetProfileidentityinformationURL = process.env.USER_PROFILE_URL || config.externalServices.accountManagementAPI.usergetProfileidentityinformationURL;
const levels = {
	"10": {
		"level": "L0",
		"levelDesc": "LO Mobilink Customer"
	},
	"15": {
		"level": "L0",
		"levelDesc": "L0 Standard OMNO Customer"
	},
	"14": {
		"level": "L0",
		"levelDesc": "L0 Corporate OMNO Customer"
	},
	"11": {
		"level": "L1",
		"levelDesc": "Ll Mobilink Customer"
	},
	"12": {
		"level": "L1",
		"levelDesc": "Ll Standard OMNO Customer"
	},
	"16": {
		"level": "L1",
		"levelDesc": "L1 Corporate OMNO Customer"
	},
	"18": {
		"level": "L2",
		"levelDesc": "L2 Corporate OMNO Customer"
	},
	"20": {
		"level": "L2",
		"levelDesc": "L2 Mobilink Customer"
	},
	"21": {
		"level": "L2",
		"levelDesc": "L2 Standard OMNO Customer"
	},
	"76": {
		"level": "M0",
		"levelDesc": "M0"
	},
	"77": {
		"level": "M1",
		"levelDesc": "M1"
	},
	"78": {
		"level": "M2",
		"levelDesc": "M2"
	},
	"1": {
		"level": "M0",
		"levelDesc": "M0 Merchant"
	},
	"2": {
		"level": "M1",
		"levelDesc": "M1 Merchant"
	},
	"3": {
		"level": "M2",
		"levelDesc": "M2 Merchant"
	},
	"69": {
		"level": "M0",
		"levelDesc": "Merchant"
	}
}

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

		logger.info("--- Before calling get profile from account-management ---A");
		return axios.get(userProfileURL, { headers: headerFields }).then(async result => {
			logger.debug(result, "   result IN PROFILE CALL");
			logger.info("--- After calling get profile from account-management ---B");
			logger.info(result);

			logger.info({ event: 'Entered function', functionName: 'userGetProfileidentityinformationURL', userGetProfileidentityinformationURL });

			logger.info("--- Before calling get profileIdentity from account-management ---C");
			const res = await axios.get(userGetProfileidentityinformationURL, { headers: headerFields });
			logger.info("--- After calling get profileIdentity from account-management ---D");
			logger.info(res);
			logger.debug("userGetProfileidentityinformationURL", res);
			logger.info({
				event: 'RESPONSE userGetProfileidentityinformationURL', functionName: 'userGetProfileidentityinformationURL',levels, TrustLevel: res.data.data.TrustLevel, check: levels[res.data.data.TrustLevel]
			});
			let accLevel = result.data.data.level || '';
			// logger.info({
			// 	event: 'accLevel before value', accLevel,
			// });
			// if (res.status === 200 && res.data && res.data.data && res.data.data.TrustLevel) {
			// 	accLevel = levels[res.data.data.TrustLevel].levelDesc
			// 	logger.info({
			// 		event: 'accLevel after value', accLevel
			// 	});
			// 	logger.info({ event: 'Trustlevel', functionName: 'userGetProfileidentityinformationURL', res: res.data.data.TrustLevel });
			// }

			logger.info({ event: 'AccountLevel', functionName: 'userGetProfileidentityinformationURL', res: accLevel });
			const profile = result.data.data.businessDetails || result.data.data ? { businessName: result.data.data.businessDetails.businessName || `${result.data.data.firstNameEn} ${result.data.data.lastNameEn}`, accountLevel: accLevel } : {};
			logger.info("--- After making simplified profile ---E");
			logger.info(profile);
			logger.info({ event: 'Exited function', functionName: 'getUserProfile', userProfileURL, profile });
			return profile;
		}).catch(error => {
			logger.debug("ERROR IN PROFILE CALL: ", headerFields, error)
			logger.error({ event: 'Error thrown', functionName: 'getUserProfile', error });
			return {};
		});
	} catch (error) {
		logger.error({ event: 'Error thrown', functionName: 'getUserProfile', error });
		logger.info({ event: 'Exited function', functionName: 'getUserProfile' });
		return {};
	}
};

export default getUserProfile;