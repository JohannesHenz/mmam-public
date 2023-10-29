const { Client } = require('pg')
const client = new Client({
    host: 'localhost',
    port: 5432,
    database: 'mmam',
    user: 'postgres',
    password: 'postgres'
})
 
client.connect((err) => {
    client.query('SELECT * from test', (err, res) => {
        console.log(err ? err.stack : res.rows)
        client.end()
    })
})