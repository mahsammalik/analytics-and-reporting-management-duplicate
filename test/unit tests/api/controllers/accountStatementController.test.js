import { EventEmitter } from 'events';
import { logger } from '/util'; // relative path using babel-plugin-module-resolver
global.logger = logger;
import { accountStatementController } from '/api/controllers';
import httpMocks from 'node-mocks-http';

let req, res, next;


describe('test account Statement Controller', () => {
    const accountStatement = new accountStatementController();
    beforeEach(() => {
        req = httpMocks.createRequest();
        res = httpMocks.createResponse({ eventEmitter: EventEmitter });
        next = jest.fn();
    });
    it('should be an instance accountStatementController class', () => {
        expect(accountStatement).toBeInstanceOf(accountStatementController);
    });

    it('should successfully calculate and generate account statement', async(done) => {

        req.headers = {
            "Content-Type": "application/json",
            "x-msisdn": "03015091633",
            "x-meta-data": "mohabashraf",
            "X-APP-TYPE": "Web",
            "x-channel": "Backend Portal",
            "x-device-id": "test",
            "X-IBM-CLIENT-ID": "123",
            "X-IP-ADDRESS": "8.8.8.8",
            "X-APP-Version": "test"
        };
        req.query = {
            "start_date": "2001-02-01",
            "end_date": "2021-02-01",
            "format": "csv",
            "requestType": "Download",
        };


        res.on('end', () => {
            logger.debug(res._getData());
            done();
        });
        res.on('send', () => {
            logger.debug(res._getData());
            done();
        });
        await accountStatement.calculateAccountStatement(req, res, next);
        // logger.debug('accountStmt', res.json());
        expect(res.locals.response).toBe(true);
        // expect(res.statusCode).toBe(200);

    });
});