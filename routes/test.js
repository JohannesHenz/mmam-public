const database = require('../database');
const router = require('express-promise-router')();

router.get('/', async (request, response) => {
    const data = await database.query('SELECT * from test ORDER BY id');
    response.setHeader('Content-Type', 'application/json');
    response.send(data.rows);
});

module.exports = router