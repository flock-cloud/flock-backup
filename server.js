var http = require('http'),
    Marathon = require('marathon.node');

// TODO read from consul
var MARATHON_API = 'http://10.141.141.10:8080';
var DOMAIN = 'flock.com';

http.createServer(function (req, res) {
    var appName = getAppId(req);
    scale(appName, function onscale() {
        setTimeout(function pipe() {
            var host = beautify(appName) + '.' + DOMAIN;
            var headers = req.headers;
            headers['host'] = host;
            console.log('proxy request to %s', host);

            var options = {
                host: '10.141.141.10', // TODO use host when DNS is available
                port: 80,
                method: req.method,
                headers: headers,
                path: req.url
            };
            var proxyRequest = http.request(options, function (proxyResponse) {
                proxyResponse.pipe(res);
            });
            req.pipe(proxyRequest);
        }, 30000); // TODO subscribe to marathon instead of waiting
    });
}).listen(process.env.PORT0); // dynamic binding

var client = new Marathon({base_url: MARATHON_API});

var getAppId = function getAppId(req) {
    return req.headers['x-flock-app'];
}

var beautify = function beautify(name) {
    var result = name.replace(/\/|-|\./g, '_');
    if (result.indexOf('_') == 0) {
        result = result.substring(1);
    }
    return result;
}

var scale = function scale(appName, callback) {
    client.app(appName).update({instances: 1}).then(function(res) {
        console.log(res);
        callback();
    });
}
console.log('flock-backup at http://0.0.0.0:%d/', process.env.PORT0);
