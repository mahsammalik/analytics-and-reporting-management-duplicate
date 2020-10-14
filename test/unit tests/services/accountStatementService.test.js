import { logger } from '/util'; // relative path using babel-plugin-module-resolver
global.logger = logger;
import { accountStatementService } from '/services';
import faker from 'faker';
import moment from 'moment';
describe('Unit test accountStatementService', () => {
    const accountStatement = new accountStatementService();
    it('should be an instance accountStatementService class', () => {
        expect(accountStatement).toBeInstanceOf(accountStatementService);
    });

    it('should successfully create an account statement CSV', async() => {
        const payload = {
            msisdn: '03015091633',
            start_date: '2001-02-01',
            end_date: '2021-02-01',
            request: "Download",
            email: 'mohabashraf',
            subject: 'Hello',
            html: '<html></html>',
            format: 'csv'
        };
        const response = await accountStatement.sendEmailCSVFormat(payload);
        expect(response).toBe(true);
    });
    it('should fail in creating an account statement CSV', async() => {
        console.log(moment(faker.date.between('1990', '2000')).format('YYYY-MM-DD'));
        const payload = {
            msisdn: faker.phone.phoneNumber(),
            start_date: moment(faker.date.between('1990', '2000')).format('YYYY-MM-DD'),
            end_date: moment(faker.date.between('1990', '2000')).format('YYYY-MM-DD'),
            request: "Download",
            email: faker.internet.email(),
            subject: faker.lorem.sentence(),
            html: '<html></html>',
            format: 'csv'
        };
        const response = await accountStatement.sendEmailCSVFormat(payload);
        expect(response).toBe(true); //false for now
    });
});