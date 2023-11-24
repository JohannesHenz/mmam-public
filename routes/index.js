const Routes = (server) => {
    server.use('/test', require('./test'));
    server.use('/', require('./root'));
    server.use('/weather', require('./weather'));
};

module.exports = Routes;