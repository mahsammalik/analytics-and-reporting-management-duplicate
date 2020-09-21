module.exports = {
    testEnvironment: "node",
    globals: {
        "config": require('./src/config/default.json').config,
    },
    transform: {
        "^.+\\.js?$": "babel-jest",
    },
    testTimeout: 15000
};