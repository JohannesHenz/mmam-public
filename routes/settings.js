const router = require('express-promise-router')();

router.get('/', (request, response) => {
    response.render('settings');
});

module.exports = router