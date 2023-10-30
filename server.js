const logger = require('./logger.js')
const database = require('./database.js')

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

app.get('/test', (req, res) => {
    const json = database.testQuery()
    res.setHeader('Content-Type', 'application/json')
    res.send(json)
})

app.get('/async/test', async (request, result) => {
    const data = await database.query('SELECT * from test');
    result.setHeader('Content-Type', 'application/json');
    result.send(data);
});

app.listen(port, () => logger.success(`Listening: http://localhost:${port}`))

