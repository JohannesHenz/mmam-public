class Logger {
    constructor() {
        if (Logger.instance == null) {
            Logger.instance = this;
        }
    }

    debug(...args) {
        const timestamp = new Date().toLocaleString('de-de').replace(',', '');
        console.log(timestamp, '\x1b[2m', ...args, '\x1b[0m');
    }

    info(...args) {
        const timestamp = new Date().toLocaleString('de-de').replace(',', '');
        console.log(timestamp, '\x1b[36m', ...args, '\x1b[0m');
    }

    warn(...args) {
        const timestamp = new Date().toLocaleString('de-de').replace(',', '');
        console.log(timestamp, '\x1b[33m', ...args, '\x1b[0m');
    }

    error(...args) {
        const timestamp = new Date().toLocaleString('de-de').replace(',', '');
        console.log(timestamp, '\x1b[31m', ...args, '\x1b[0m');
    }

    success(...args) {
        const timestamp = new Date().toLocaleString('de-de').replace(',', '');
        console.log(timestamp, '\x1b[32m', ...args, '\x1b[0m');
    }
}

const logger = new Logger();
module.exports = logger;