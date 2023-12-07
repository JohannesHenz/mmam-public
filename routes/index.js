const Routes = (server) => {
    server.use('/', require('./root'));
    server.use('/test', require('./test'));
    server.use('/weather', require('./weather'));
    server.use('/settings', require('./settings'));
};

module.exports = Routes;