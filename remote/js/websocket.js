var OFFLINE = 0;
var CONNECTING = 1;
var ONLINE = 2;
var CLOSING = 3;
var USERINPUT = 4;

console.log("localStorage.ip = " + localStorage.ip);


var Remote = function() {
    this.state = 0;
    var websocket;
    var connectorLoop;
    var self = this;

    this.on = function(name, callback) {
        events.addListener(name, callback);
    };

    this.send = function(data) {
        if (cv96.server.connected) websocket.send(data);
        else console.log("Not connected yet");
    };

    this.close = function() {
        self.state = CLOSING; // closing
        if (websocket) websocket.close();
        else self.state = OFFLINE;
        console.log("close connection");
        cv96.server.connected = false;
    };

    this.websocketStart = function(ip) {
        if (self.state !== OFFLINE) return;
        if (ip != undefined) {
            cv96.server.ip = ip;
            console.log("no cookie for ip");
        } else {
            console.log("cookie ip: " + localStorage.ip);
            cv96.server.ip = localStorage.ip;
        }

        if (cv96.server.ip != undefined) {
            console.log("...at: " + cv96.server.ip);
            console.log("STATE = " + this.state);
            websocket = new WebSocket("ws://" + cv96.server.ip + ":8001", "connect");
            self.state = CONNECTING; // connecting
        }

        var connectTimeOut = setTimeout(function() {
            if (!cv96.server.connected) {
                console.log("Where are you!");
                //    startConnectorLoop();
                findServers(8001, "192.168.0.", 1, 255, 50, 100, function(ip) {
                    console.log(ip);
                    self.websocketStart(ip);
                });
            }
        }, 1000)

        websocket.onopen = function() {
            self.state = ONLINE; // connected
            console.log('Server Found!');
            websocket.send(JSON.stringify({
                "cmd": 254,
                "versionHi": 1,
                "versionLo": 0,
            }));
            //          websocket.send("sw96%1.0.0");
            cv96.server.connected = true;
            events.fire("connected", true);
            localStorage.ip = cv96.server.ip;
        };

        // var lastStamp = 0;

        websocket.onmessage = function(event) {
            //    websocket.send('ACKNOWLEDGE BYTES');
            var wsObject;
            try {
                wsObject = JSON.parse(event.data);
            } catch (e) {
                console.log(e);
                console.log(event.data);
                return;
            }

            var cmd = wsObject.cmd;
            console.log(cmd)

            if (cmd === 0x4) {
                console.log("Mode Change to: " + wsObject.mode);
                events.fire("setMode", wsObject);
            }

            if (cmd === 0x10) // MTC object
            {
                events.fire("mtc", wsObject);

                //                    var timeStamp = Math.floor(Date.now());
                //                    console.log(timeStamp-lastStamp);
                //                    lastStamp=timeStamp;

            }
            if (cmd === 0x20) {
                events.fire("sessionData", wsObject);
            }
            if (cmd === 0x21) {
                events.fire("autoTrack", wsObject);
            }
            if (cmd === 0x22) {
                events.fire("addPoint", wsObject);
            }
            if (cmd === 0x23) {
                events.fire("deletePoint", wsObject);
            }
            if (cmd === 0x51) {
                events.fire("fileObj", wsObject);
            }
            if (cmd === 0x81) {
                events.fire("title", wsObject);
            }
            if (cmd === 0x82) {
                events.fire("version", wsObject);
            }
            if (properties.state.activeMode === "automation") {
                if (cmd === 0x31) {
                    properties.sessionState.faders[wsObject.chn].status = wsObject.status;
                    events.fire("trackStatus", wsObject);
                }
                if (cmd === 0x33) {
                    events.fire("trackTouch", wsObject);
                }
                if (cmd === 0x34) {
                    //    wsObject = undefined;
                    events.fire("trackLevel", wsObject);
                }
                if (cmd === 0x30) {
                    events.fire("autoRealTime", wsObject);
                }
                if (cmd === 0x36) {
                    events.fire("switchBank", wsObject);
                }
                if (cmd === 0x41) {
                    events.fire("huiStatus", wsObject);
                }
            }
            if (properties.state.activeMode === "recall") {
                if (cmd === 250) {
                    events.fire("recallData", wsObject);
                }
            }
            if (properties.state.activeMode === "recall") {
                if (cmd === 251) {
                    events.fire("recallDeltaData", wsObject);
                }
            }
            if (properties.state.activeMode === "recall") {
                if (cmd === 252) {
                    events.fire("updatePage", wsObject);
                }
            }
            /*
            if (cmd === 0x31) {
                console.log("set status, mode: " + properties.state.activeMode)
            }
            */
            self.send(JSON.stringify({
                "cmd": 255,
                "cntr": wsObject.cntr
            }));
        };
        websocket.onclose = function() {
            if (self.state == ONLINE) this.state = OFFLINE; // closed
            console.log('Websocket closed.');
            var reason;
            // See http://tools.ietf.org/html/rfc6455#section-7.4.1
            if (event.code === 1000)
                reason = "Normal closure, meaning that the purpose for which the connection was established has been fulfilled.";
            else if (event.code === 1001)
                reason = "An endpoint is \"going away\", such as a server going down or a browser having navigated away from a page.";
            else if (event.code === 1002)
                reason = "An endpoint is terminating the connection due to a protocol error";
            else if (event.code === 1003)
                reason = "An endpoint is terminating the connection because it has received a type of data it cannot accept (e.g., an endpoint that understands only text data MAY send this if it receives a binary message).";
            else if (event.code === 1004)
                reason = "Reserved. The specific meaning might be defined in the future.";
            else if (event.code === 1005)
                reason = "No status code was actually present.";
            else if (event.code === 1006)
                reason = "The connection was closed abnormally, e.g., without sending or receiving a Close control frame";
            else if (event.code === 1007)
                reason = "An endpoint is terminating the connection because it has received data within a message that was not consistent with the type of the message (e.g., non-UTF-8 [http://tools.ietf.org/html/rfc3629] data within a text message).";
            else if (event.code === 1008)
                reason = "An endpoint is terminating the connection because it has received a message that \"violates its policy\". This reason is given either if there is no other sutible reason, or if there is a need to hide specific details about the policy.";
            else if (event.code === 1009)
                reason = "An endpoint is terminating the connection because it has received a message that is too big for it to process.";
            else if (event.code === 1010) // Note that this status code is not used by the server, because it can fail the WebSocket handshake instead.
                reason = "An endpoint (client) is terminating the connection because it has expected the server to negotiate one or more extension, but the server didn't return them in the response message of the WebSocket handshake. <br /> Specifically, the extensions that are needed are: " + event.reason;
            else if (event.code === 1011)
                reason = "A server is terminating the connection because it encountered an unexpected condition that prevented it from fulfilling the request.";
            else if (event.code === 1015)
                reason = "The connection was closed due to a failure to perform a TLS handshake (e.g., the server certificate can't be verified).";
            else
                reason = "Unknown reason";

            websocket = null;
            console.log(reason);
            cv96.server.connected = false;
            events.fire("connected", false);
        };
        websocket.onerror = function(e) {
            console.log('Websocket error');
            self.state = OFFLINE;
        };
    };

    this.startConnectorLoop = function() {
        var self = this;
        if (!connectorLoop) {
            connectorLoop = setInterval(function() {
                if (self.state == OFFLINE) // closed and idle
                {
                    console.log("Connector loop");
                    self.websocketStart();
                }
            }, 1000);
        } else {
            console.log("connector loop already running!");
        }
    };



};

function findServers(port, ipBase, ipLow, ipHigh, maxInFlight, timeout, cb) {
    var ipCurrent = +ipLow,
        numInFlight = 0,
        servers = [];
    var ipFull;
    ipHigh = +ipHigh;

    function tryOne(ip) {
        ++numInFlight;
        var address = "ws://" + ipBase + ip + ":" + port;
        var socket = new WebSocket(address);
        var timer = setTimeout(function() {
            console.log(address + " timeout");
            var s = socket;
            socket = null;
            s.close();
            --numInFlight;
            next();
        }, timeout);
        socket.onopen = function() {
            if (socket) {
                console.log(address + " success");
                clearTimeout(timer);
                servers.push(socket.url);
                --numInFlight;
                ipFull = ipBase + ip;
                next();
            }
        };
        socket.onerror = function(err) {
            if (socket) {
                console.log(address + " error");
                clearTimeout(timer);
                --numInFlight;
                next();
            }
        }
    }

    function next() {
        while (ipCurrent <= ipHigh && numInFlight < maxInFlight) {
            tryOne(ipCurrent++);
        }
        // if we get here and there are no requests in flight, then
        // we must be done
        if (numInFlight === 0) {
            cb(ipFull);
        }
    }

    next();
}