var Arrow = require('arrow'),
    server = new Arrow({ logLevel: 'fatal' }),
    log = server && server.logger || Arrow.createLogger({}, { name: 'appc.redis TEST' });

exports.Arrow = Arrow;
exports.log = log;
exports.server = server;
exports.testDb = process.env['testDB'] || 15;

before(function (next) {
    exports.connector = server.getConnector('appc.redis');
    exports.connector.config.db = exports.testDb;

    log.info('Redis test DB: ' + exports.connector.config.db);

    server.start(next);
});

after(function (next) {
    if (!exports.connector) {
        return server.stop(next);
    }
    exports.connector.client['flushdb'](function(err){
        if (err) {
            log.error(err.message);
        } else {
            log.info('Emptied test db at: ' + exports.connector.config.db);
        }
        server.stop(next);
    });
});