const database = require('../database');
const router = require('express-promise-router')();
const logger = require('../utils/logger');

router.get('/', async (request, response) => {
    const data = await database.query('SELECT * from settings WHERE id = 1');
    response.setHeader('Content-Type', 'application/json');
    delete data.rows[0].id;
    response.send(data.rows[0]);
});

const settingsBlueprint = {
    latitude: 'number',
    longitude: 'number',
    zoom: 'number'
};

// TDOO: move to utils
function checkObject(object, blueprint) {
    for (const key in blueprint) {
        if (object[key] === undefined) {
            return `.${key} is missing`;
        }
        if (typeof object[key] !== blueprint[key]) {
            return `.${key} is not a ${blueprint[key]}`;
        }
    }
    return null;
}

router.post('/', async (request, response) => {
    const body = request.body;
    logger.info(body);

    const result = checkObject(body, settingsBlueprint);
    if (result !== null) {
        response.status(400).send(result);
        return;
    }
    await database.query(`
        UPDATE settings SET
            latitude = ${body.latitude},
            longitude = ${body.longitude},
            zoom = ${body.zoom}
        WHERE id = 1
    `);
    response.setHeader('Content-Type', 'application/json');
    response.status(200).send();
});

module.exports = router
