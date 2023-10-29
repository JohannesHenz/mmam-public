const {Client} = require('pg')

class Database {
    constructor(config) {
        this.client = new Client(config)
    }

    testQuery() {
        this.client.connect((err) => {
            this.client.query('SELECT * from test', (err, res) => {
                console.log(err ? err.stack : res.rows)
                this.client.end()
            })
        })
    }
}

module.exports = Database