// test/simpleServer.js 

var http = require('http'),
    destroyable = require('server-destroy');

var SimpleServer = function(port, responseFn, cb) {
    this.server = http.createServer(function(request, response) {
        responseFn(request, response);
    });
    this.server.listen(port, 'localhost', 10, cb);
    
    destroyable(this.server);
};

SimpleServer.prototype.stop = function(cb) {
    this.server.destroy(cb);
};

module.exports = SimpleServer;
