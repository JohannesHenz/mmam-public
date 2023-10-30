const {Client} = require('pg')

class Database {
    constructor(config) {
        this.client = new Client(config)
    }

    testQuery() {
        this.client.connect((err) => {
            this.client.query('SELECT * from test', (err, res) => {
                if (err) console.log(err.stack)
                this.result = res.rows
            })
        })
        return JSON.stringify(this.result)
    }
}

module.exports = Database