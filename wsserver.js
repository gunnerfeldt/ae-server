/*

  Module - Server
  
  Keeping track of the remote gui(s)
  
  
*/

var util = require("util")
var events = require("events")

module.exports = Server;
//var server = new Server();


var clients = [];
var conf;



// Makes Server also an EventEmitter
util.inherits(Server, events.EventEmitter)


function Server() {
    var self = this;
    var CLIENT_BUFFER_MAX = 64;
    var WebSocketServer = require('ws').Server,
        wss = new WebSocketServer({ port: 8001 });


    wss.on('connection', function connection(conn) {
        // **** **** **** SERVER CONNECTION **** **** ****
        console.log("websocket connected key: " + conn.upgradeReq.headers['sec-websocket-key']);
        var client = {
            "conn": conn,
            "buffer": []
        }
        clients.push(client);

        var string = "" + clients.length + " remote(s)";
        console.log("CMD%Remote%" + string);

        // **** **** **** INCOMING MESSAGE **** **** ****
        conn.on("message", function(str) {
                if (isJsonString(str)) {
                    var wsObject = JSON.parse(str);
                    if (wsObject.cmd == "buffer overflow") {
                        console.log("buffer overflow");
                        console.log("size " + wsObject.size);
                    } else if (wsObject.cmd == "automan") {
                        console.log("remote client connected");
                        conn.send(JSON.stringify({
                            "cmd": "server info",
                            "data": {
                                "version": "1.0.0",
                                "year": "2016",
                                "host": "osx"
                            }
                        }), function ack(error) {
                            // if error is not defined, the send has been completed,
                            // otherwise the error object will indicate what failed.
                            if (error) {
                                console.log("websocket send error ACK");
                                console.log(error);
                                removeClient(conn.upgradeReq.headers['sec-websocket-key']);
                            }
                        });
                    } else if (wsObject.cmd == "update") {
                        // update specific client
                        updateClient(conn.upgradeReq.headers['sec-websocket-key']);
                        /*
                        console.log("request from:");
                        console.log(conn.upgradeReq.headers['sec-websocket-key']);
                        */
                    } else if (wsObject.cmd == "update2.0") {
                        // update specific client
                        updateClient(conn.upgradeReq.headers['sec-websocket-key']);
                        /*
                        try new concept:
                          send all states always
                          if running send interval of points
                        */
                    } else {
                        wsObject.id = conn.upgradeReq.headers['sec-websocket-key'];
                        //    console.log("Command: "+wsObject.cmd);
                        self.emit("command", wsObject);
                    }
                } else {
                    console.log("not a JSON message");
                }
            })
            // **** **** **** SERVER CONNECTION CLOSED **** **** ****
        conn.on("close", function(code, reason) {
                console.log(code);
                console.log(reason);
                removeClient(conn.upgradeReq.headers['sec-websocket-key']);
            })
            // **** **** **** SERVER CONNECTION ERROR **** **** ****   
        conn.on("error", function(err) {
            console.log("websocket error");
            console.log(err);
            removeClient(conn.upgradeReq.headers['sec-websocket-key']);
            conn.close();
        });
    })

    // **** **** **** GET LOCAL IP ADDRESS **** **** **** 
    this.getIPAddress = function() {
        var interfaces = require('os').networkInterfaces();
        for (var devName in interfaces) {
            var iface = interfaces[devName];

            for (var i = 0; i < iface.length; i++) {
                var alias = iface[i];
                if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal)
                    return alias.address;
            }
        }
        return '0.0.0.0';
    };

    // **** **** **** UPDATE SPECIFIC CLIENT **** **** **** 
    function updateClient(id) {
        if (clients.length > 0) {
            clients.forEach(function(client) {
                if (client.conn.upgradeReq.headers['sec-websocket-key'] == id) {
                    //  if(client.buffer.length>0){
                    while (client.buffer.length > 0) {
                        var msg = client.buffer.shift();
                        var jsonMsg = JSON.stringify(msg);
                        client.conn.send(jsonMsg, function ack(error) {
                            // if error is not defined, the send has been completed,
                            // otherwise the error object will indicate what failed.
                            if (error) {
                                console.log("websocket error");
                                console.log(error);
                                removeClient(client.conn.upgradeReq.headers['sec-websocket-key']);
                            }
                        });
                    }
                }
            });
        }
    }

    // **** **** **** SEND **** **** **** 
    this.send = function(msg) {
            if (clients.length > 0) {
                clients.forEach(function(client) {
                    if (client.conn.upgradeReq.headers['sec-websocket-key'] == msg.id) {
                        client.buffer.push(msg);
                        if (client.buffer.length > CLIENT_BUFFER_MAX) {
                            console.log("trim buffer. Size " + client.buffer.length);
                            client.buffer.shift();
                        }
                    }
                });
            }
        }
        // **** **** **** BROADCAST TO ALL **** **** **** 
    this.broadcast = function(msg) {
        if (clients.length > 0) {
            var jsonMsg = JSON.stringify(msg);
            clients.forEach(function(client) {
                client.buffer.push(msg);
                if (client.buffer.length > CLIENT_BUFFER_MAX) {
                    //  console.log("trim buffer. Size "+client.buffer.length);
                    client.buffer.shift();
                }
            });
        }
    }
}

// **** **** **** REMOVE CLIENT BY KEY **** **** **** 
function removeClient(key) {
    for (var i = 0; i < clients.length; i++) {
        if (key == clients[i].conn.upgradeReq.headers['sec-websocket-key']) {
            console.log("removed key: " + key);
            clients.splice(i, 1);
        }
    }
    var string = "" + clients.length + " remote(s)";
    if (clients.length < 1) string = "Offline";
    console.log("CMD%Remote%" + string);
}

// **** **** **** CHECK IF JSON FORMAT **** **** **** 
function isJsonString(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}