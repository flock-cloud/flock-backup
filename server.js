var http = require('http'),
    url = require('url'),
    Marathon = require('marathon.node');

// TODO read from consul
var MARATHON_API = process.env.MARATHON_API || 'http://10.141.141.10:8080';
var DOMAIN = 'flock.com';

// XXX
// TODO use host when DNS is available
var HAPROXY_HOST = url.parse(MARATHON_API).hostname;
var HAPROXY_PORT = 80;

http.createServer(function (req, res) {
    var appName = getAppId(req);
    scale(appName, function onscale() {
        setTimeout(function pipe() {
            var host = beautify(appName) + '.' + DOMAIN;
            var headers = req.headers;
            headers['host'] = host;
            console.log('proxy request to %s', host);

            var options = {
                host: HAPROXY_HOST,
                port: HAPROXY_PORT,
                method: req.method,
                headers: headers,
                path: req.url
            };
            var proxyRequest = http.request(options, function (proxyResponse) {
                proxyResponse.pipe(res);
            });
            req.pipe(proxyRequest);
        }, 65000); // TODO subscribe to marathon events instead of waiting
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
    client.app(appName).update({instances: 1}).then(function onscale(res) {
        console.log('scale up response', res);
        callback();
    });
}
console.log('flock-backup at http://0.0.0.0:%d/', process.env.PORT0);
