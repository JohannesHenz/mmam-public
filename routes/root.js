const router = require('express-promise-router')();

router.get('/', (request, response) => {
    response.render('index');
});

module.exports = router