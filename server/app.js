/*A stream is an abstract interface implemented by various objects in Node.js. For example a request to an HTTP server is a stream, as is process.stdout. Streams are readable, writable, or both. All streams are instances of EventEmitter.
Duplex streams are streams that implement both the Readable and Writable interfaces.*/


module.exports = function () {

    //SERVER 
    var express = require('express');
    var http = require('http');
    var app = express();
    var bodyParser = require('body-parser');
    var path = require('path');
    var server = http.createServer(app);
    var WebSocketServer = require('ws').Server;
    var wss = new WebSocketServer({
        server: server
    });
    server.listen(8008, function () {
        console.log('Example app listening at port 8008');
    });

    //SHARE JS
    var Duplex = require('stream').Duplex;
    var sharejs = require('share');
    var livedb = require('livedb');
    var shareCodemirror = require('share-codemirror');
    var backend = livedb.client(livedb.memory());
    var share = sharejs.server.createClient({
        backend: backend
    });

    //SCRIPTDIRS
    app.use(express.static(__dirname + '../../www'));
    app.use(bodyParser.urlencoded({
        extended: false
    }));
    app.use(bodyParser.text());
    app.use(express.static(sharejs.scriptsDir));
    app.use(express.static(shareCodemirror.scriptsDir));
    app.use(express.static(__dirname + '../../node_modules/codemirror/lib'));

    //VARIABLES GLOBALES
    var users = [];
    app.post('/users', function (req, res) {
        var body = req.body;
        var data = JSON.parse(body);
        var id = data.id;
        users.push(id);
        res.send('Got a post request');
    });

    //
    wss.on('connection', function (client) {
        var stream = new Duplex({
            objectMode: true
        });
        //The Writable stream interface is an abstraction for a destination that you are writing data to.
        stream._write = function (data, encoding, callback) {
            console.log('s->c perro', data.src);
            client.send(JSON.stringify(data));
            return callback();
        };
        stream._read = function () {}; //The Readable stream interface is the abstraction for a source of data that you are reading from. In other words, data comes out of a Readable stream.


        stream.headers = client.upgradeReq.headers;
        stream.remoteAddress = client.upgradeReq.connection.remoteAddress;
        console.log('Client URL: ' + client.upgradeReq.headers['sec-websocket-key']);

        var session = {
            users: escape(client.upgradeReq.headers['sec-websocket-key'])

        };

        client.send(JSON.stringify(session));


        client.on('message', function (data) {
            stream.push(data);
            console.log('s->c onmessage', data);
        });

        client.on('close', function (reason) { //The event indicates that no more events will be emitted, and no further computation will occur.
            stream.push(null);
            stream.emit('close');

        });

        stream.on('end', function () { //This event fires when there will be no more data to read.
            client.close();
        });

        // Give the stream to sharejs
        return share.listen(stream);
    });

};

function startServer() {

}

function stopServer() {

}

function getRootUrl() {

}

module.exports.startServer = startServer;
module.exports.stopServer = stopServer;
module.exports.getRootUrl = getRootUrl;