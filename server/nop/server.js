var express = require('express');
var app2 = express();
var fs = require('fs');
var bodyParser = require('body-parser');
var ip = require('ip');
var whitelist = [];
var lcPort = 8008;
var exec = require('child_process').execF;
var liveCoding = require('./app.js')();
var htmlname = 'index2.html';
var userServer = require('./userServer.js')();



app2.use(bodyParser.urlencoded({
    extended: false
}));
app2.use(bodyParser.text());
app2.listen(8010, function () {
    console.log('Example app listening at port 8010');
});
app2.use(express.static(__dirname + '../../www'));
app2.enable('trust proxy');



app2.post('/addContact', function (req, res) {
    var body = req.body;
    var data = JSON.parse(body);
    whitelist.push(data.ID);
    console.log(whitelist);
});
app2.get('/getURLSession', function (req, res) {
    console.log(ip.address());
    var IP = ip.address();
    res.send('http://' + IP + ':' + lcPort + '/' + htmlname);

});

app2.get('/startLiveCoding', function (req, res) {
    res.send('http://localhost:' + lcPort + '/' + htmlname);
});

function runApp() {
    var child = exec('node app.js');
    child.stdout.on('data', function (data) {
        console.log('stdout: ' + data);
    });
    child.stderr.on('data', function (data) {
        console.log('stdout: ' + data);
    });
    child.on('close', function (code) {
        console.log('closing code: ' + code);
    });
}
module.exports = function (sharejs, shareCodemirror) {

    var express = require('express');
    var http = require('http');
    var app = express();
    app.use(express.static(__dirname + '../../www'));
    app.use(express.static(sharejs.scriptsDir));
    app.use(express.static(shareCodemirror.scriptsDir));
    app.use(express.static(__dirname + '../../node_modules/codemirror/lib'));
    var server = http.createServer(app);
    var WebSocketServer = require('ws').Server;
    var wss = new WebSocketServer({
        server: server
    });
    server.listen(8008, function () {
        console.log('Example app listening at port 8008');
    });
    return wss;
}