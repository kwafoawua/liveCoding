var express = require('express');
var webSocketServer = require('ws').Server;
var app = express();
var server = require('http').createServer(app);
var wss = new webSocketServer({
    server: server
});
var port = 8011;
var liveCoding = require('./app.js')();


var users = [];

server.listen(port, function () {
    //console.log('Example app listening at port 8011');
});

wss.on('connection', function (ws) {
    ws.on('message', function (msg) {
        var data = JSON.parse(msg);
        if (users.indexOf(data.id) === -1) {
            users.push(data.id);
        }
        console.log(users);
        wss.clients.forEach(function each(client) {
            client.send(msg);
        });

    });
    ws.on('close', function () {

    });
});