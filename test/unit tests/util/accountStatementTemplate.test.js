import { logger } from '/util'; // relative path using babel-plugin-module-resolver
global.logger = logger;
import { accountStatementTemplate } from '/util';

describe('Test account Statement Template', () => {
    it('accountStatementTemplate should be a function', () => {
        expect(accountStatementTemplate()).toBeDefined();
    });
    it('accountStatementTemplate should return html string', () => {
        const accountData = {
            headers: ['Transaction ID', 'Transaction Date', 'Transaction Type', 'Channel', 'Description', 'Amount debited', 'Amount credited', 'Running balance'],
            data: [
                ['0097066316033', '2020-11-26', '923015091633', 'Money Transfer - Mobile Account', 'Mobile App', 'Beneficiary Details: 923012009814', '0.0000', '5.0000', '1058.1900'],
            ],
            payload: {
                msisdn: '923002101232',
                start_date: '2000-10-01',
                end_date: '2020-10-01',
                request: 'pdf',
                email: 'nabbasi@pk.ibm.com',
                subject: 'Hello',
                html: '<html></html>',
                format: 'download'
            }
        };
        const result = accountStatementTemplate(accountData);
        expect(result).toEqual(expect.stringContaining('<!DOCTYPE html>'));
    });
});