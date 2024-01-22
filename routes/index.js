const Routes = (server) => {
    server.use('/', require('./root'));
    server.use('/test', require('./test'));
    server.use('/weather', require('./weather'));
    server.use('/settings', require('./settings'));
    server.use('/journeys', require('./journeys'));
    server.use('/stop-info', require('./stop-info'));
};

module.exports = Routes;
