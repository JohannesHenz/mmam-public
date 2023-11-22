const Routes = (server) => {
    server.use('/test', require('./test'));
    server.use('/', require('./root'));
    server.use('/settings', require('./settings'));
};

module.exports = Routes;