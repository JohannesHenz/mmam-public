const logger = require('../utils/logger');
const {Client} = require('pg');

class Database {
    constructor(config) {
        logger.debug('Database.constructor()');
        this.client = new Client(config);
        this.client.connect(undefined).then(() => {
            logger.success('Database: Connected');
            this.connected = true;
        }).catch(error => {
            logger.error(`Database: Failed to connect\n${error.stack}`);
        });
    }

    async query(query, parameters) {
        if (!this.connected) {
            logger.error(`Database.query(${query}): Not connected`);
            return [];
        }
        const start = Date.now();
        const result = await this.client.query(query, parameters);
        const duration = Date.now() - start;
        logger.debug(`Database.query(${query}): ${duration}ms rows: ${result.rowCount}`);
        return result;
    }
}

const database = new Database({
    host: 'localhost',
    port: 5432,
    database: 'mmam',
    user: 'postgres',
    password: 'postgres'
});

module.exports = database
