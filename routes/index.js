const Routes = (server) => {
    server.use('/test', require('./test'));
    server.use('/', require('./root'));
};

module.exports = Routes;