const express = require('express')
const favicon = require('serve-favicon');
const path = require('path');

const app = express()
const port = 3313;

app.use(express.static(__dirname + '/public'))
app.use(favicon(path.join(__dirname, '/public', 'favicon.ico')))

app.set('view engine', 'ejs')

app.get('/', (req, res) => {
    res.render('index')
});

app.listen(port, () => console.log(`listening on port http://localhost:${port}`))

const Database = require('./database.js')
const database = new Database({
    host: 'localhost',
    port: 5432,
    database: 'mmam',
    user: 'postgres',
    password: 'postgres'
});

database.testQuery();