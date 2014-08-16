var http = require('http'),
    httpProxy = require('./node_modules/node-inject/node_modules/http-proxy/');

httpProxy.createServer(
    require('node-inject')("http://localhost/inject.js"),
    function (req,res,proxy) {
        proxy.proxyRequest(req, res, {
          host: 'localhost',
          port: 80
        });
    }
).listen(8000);

