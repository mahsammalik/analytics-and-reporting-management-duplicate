const odbc = require('odbc');
 
async function connectToDatabase() {
    const connection1 = await odbc.connect('DSN=MYDSN');
    // connection1 is now an open Connection
 
    // or using a configuration object
    const connectionConfig = {
        connectionString: 'DSN=MYDSN',
        connectionTimeout: 10,
        loginTimeout: 10,
    }
    const connection2 = await odbc.connect(connectionConfig);
    // connection2 is now an open Connection
}
 
connectToDatabase();