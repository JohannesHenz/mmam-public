const logger = require("../utils/logger");
const { Client } = require("pg");

const RETRY_INTERVAL = 3000;

class Database {
  client = null;
  connected = false;

  constructor(config) {
    this.#connect(config);
  }

  #connect(config) {
    logger.debug("Database.#connect()");
    this.client = new Client(config);
    this.client
      .connect(undefined)
      .then(() => {
        logger.success("Database: Connected");
        this.connected = true;
        this.client.on("error", (error) => {
          if (this.connected === true) {
            logger.error(`Database: Connection lost\n${error}`);
            this.connected = false;
            this.#connect(config);
          }
        });
      })
      .catch((error) => {
        this.connected = false; // just to be sure
        logger.error(`Database: Failed to connect\n${error}`);
        setTimeout(() => this.#connect(config), RETRY_INTERVAL);
      });
  }

  async query(query, parameters) {
    if (!this.connected) {
      logger.error(`Database.query(${query}): Not connected`);
      return null;
    }
    const start = Date.now();
    const result = await this.client.query(query, parameters);
    const duration = Date.now() - start;
    logger.debug(
      `Database.query(${query}): ${duration}ms rows: ${result.rowCount}`
    );
    return result;
  }
}

const database = new Database({
  host: "database",
  port: 5432,
  database: "mmam",
  user: "postgres",
  password: "postgres",
});

module.exports = database;
