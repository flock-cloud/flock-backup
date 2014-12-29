var http = require('http');

http.createServer(function (req, res) {
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.end(JSON.stringify(req.headers));
}).listen(process.env.PORT0); // dynamic binding

console.log('flock-backup at http://0.0.0.0:%d/', process.env.PORT0);
