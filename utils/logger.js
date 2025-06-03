class Logger {
    constructor() {
        if (Logger.instance == null) {
            Logger.instance = this;
        }
    }

    #internal(color, ...args) {
        const timestamp = new Date().toLocaleString('de-de').replace(',', '');
        console.log(timestamp, color, ...args, '\x1b[0m');
    }

    debug(...args) {
        this.#internal('\x1b[35m', ...args);
    }

    info(...args) {
        //this.#internal('\x1b[36m', ...args);
        this.#internal('', ...args);
    }

    warn(...args) {
        this.#internal('\x1b[33m', ...args);
    }

    error(...args) {
        this.#internal('\x1b[31m', ...args);
    }

    success(...args) {
        this.#internal('\x1b[32m', ...args);
    }
}

const logger = new Logger();
module.exports = logger;
