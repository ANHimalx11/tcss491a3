var express = require('express');
var app = express();
var port = 8888;

var dbURL = "localhost:27017/testdb";
var collections = ["table"];
var db = require("mongojs")(dbURL, collections);

var io = require("socket.io").listen(app.listen(port));

console.log("Server started.")
var connections = 0;
var messages = [];

io.sockets.on("connection", function (socket) {
    console.log("New Socket: " + (connections + 1));

    var query = {
        messages: { $exists: true }
    };

    var fields = {};

    if (connections === 0) {
        messages = [];
        db.table.find(query, fields, function (err, records) {
            if (err) console.log(err);
            if (records && records[0]) {
                console.log("Messages loaded.");
                messages = records[0].messages.concat(messages);
                socket.emit("sync", messages);
            }
        });
    }
    else {
        socket.emit("sync", messages);
    }

    connections++;

    var count = 0;
    var ping = 0;

    socket.emit('message', { message: 'welcome to the chat' });

    setInterval(function () {
        ping = Date.now();
        socket.emit("ping", count++);
    }, 10000);

    socket.on("pong", function () {
        console.log("pong " + (Date.now() - ping) + "ms");
    });


    socket.on('send', function (data) {
        messages.push(data);
        io.sockets.emit('message', data);
    });

    socket.on("disconnect", function () {
        console.log("Disconnected: " + (--connections));

        if (connections === 0) {
            console.log("Messages saved.");
            db.table.update(query, { messages: messages }, {upsert: true});
        }
    });
});
