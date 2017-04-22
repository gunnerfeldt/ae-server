function Client() {
    var self = this;
    var MAX_BUFFER = 80000;
    var COOKIE_LOOKUP_TIMEOUT = 1000;
    var SCAN_LOOKUP_TIMEOUT = 5000;
    var BUFFER_UNLOAD_INTERVAL = 5;
    var CONNECTED = 0;
    var ipFound = false;
    var websocket = {};
    var bufferUnloadTimer;
    var serverRequestTimer;
    var socketBuffer = [];
    var SW96_PORT = "8001";
    var SERVER_REQUEST_REFRESH_INTERVAL = 20;
    var REQUEST_LOOP_TIMEOUT = 500;
    var lastTime = 0;

    this.on = function(name, callback) {
        events.addListener(name, callback);
    };



    // *** *** CONNECT *** ***
    this.connect = function(ip) {
        console.log('Connecting...');
        websocket = new WebSocket("ws://" + ip + ":" + SW96_PORT, "connect");
        // timeOut after XX ms
        setTimeout(function() {
            // if cookie address wasn't found
            if (!CONNECTED) {
                events.fire("connected", false);
            } else {}
        }, COOKIE_LOOKUP_TIMEOUT)

        // **** **** **** SERVER CONNECTION **** **** ****
        websocket.onopen = function() {
            CONNECTED = 1;
            websocket.send(JSON.stringify({
                "cmd": "automan"
            }))
            events.fire("connected", true, ip);
            localStorage.ip = ip;
            // start server request loop
            serverRequestTimer = setInterval(function() {
                serverRequest();
            }, SERVER_REQUEST_REFRESH_INTERVAL);
            // start buffer security
            bufferUnloadTimer = setInterval(function() {
                bufferUnload();
            }, BUFFER_UNLOAD_INTERVAL);
        };

        // **** **** **** INCOMING MESSAGE **** **** ****        
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
            checkBuffer();
            socketBuffer.push(wsObject);
        };

        // **** **** **** CLIENT CONNECTION CLOSED **** **** ****
        websocket.onclose = function() {
            CONNECTED = 0;
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
            clearInterval(bufferUnloadTimer);
            events.fire("connected", false);
        };

        // **** **** **** CLIENT CONNECTION ERROR **** **** ****  
        websocket.onerror = function(e) {
            console.log('Websocket error');
            CONNECTED = 0;
            console.log(e);
            clearInterval(bufferUnloadTimer);
        };
    };

    // *** *** SCAN LOCAL NETWORK *** ***
    this.scanLocalNetwork = function(base) {
        // start scanning
        findServers(SW96_PORT, base, 1, 254, 10, 100, function(ip) {
                events.fire("scan result", ip);
                ipFound = true;
            })
            // timeOut after XX ms
        setTimeout(function() {
            // if scanning address wasn't found
            if (!ipFound) {
                events.fire("scan result", false);
            }
            ipFound = false;
        }, (SCAN_LOOKUP_TIMEOUT))
    }

    // **** **** **** CLIENT SEND **** **** **** 
    this.send = function(obj) {
        if (CONNECTED) {
            websocket.send(JSON.stringify(obj));
            return 1;
        } else return -1;
    }

    // **** **** **** CHECK BUFFER OVERFLOW **** **** ****          
    function checkBuffer() {
        if (!CONNECTED) {
            this.connect;
        }

        var size = sizeof(socketBuffer);
        if (size > MAX_BUFFER) {
            console.log("Buffer overflow " + (MAX_BUFFER));
            socketBuffer = [];
            websocket.send(JSON.stringify({
                "cmd": "buffer overflow",
                "size": size
            }))
            websocket.send(JSON.stringify({
                "cmd": 1
            }))
            return 0;
        } else return 1
    }

    // **** **** **** SERVER REQUEST LOOP **** **** **** 
    function serverRequest() {
        if (!CONNECTED) return;
        var d = new Date();
        var n = d.getTime();
        var gap = n - lastTime;
        // check time and if it's a big gap
        // assume GUI has been un-hooked for a while 
        // and request full update
        if (gap > REQUEST_LOOP_TIMEOUT) {
            console.log("gap: " + gap);
        }
        lastTime = n;

        // else, just send a normal request
        websocket.send(JSON.stringify({
            "cmd": "update"
        }))
    }

    // **** **** **** BUFFER UNLOAD **** **** **** 
    function bufferUnload() {
        while (socketBuffer.length > 0) {
            var packet = socketBuffer.shift();
            cmdTable(packet);
        }

    }

    // **** **** **** FIND SERVERS **** **** ****         
    function findServers(port, ipBase, ipLow, ipHigh, maxInFlight, timeout, cb) {
        var ipCurrent = +ipLow,
            numInFlight = 0,
            servers = [];
        var ipFull;
        ipHigh = +ipHigh;
        ipFound = false;
        console.log('Scanning local network...');

        function tryOne(ip) {
            ++numInFlight;
            var address = "ws://" + ipBase + ip + ":" + port;
            var socket = new WebSocket(address);
            var timer = setTimeout(function() {
                //    console.log(address + " timeout");
                var s = socket;
                socket = null;
                s.close();
                --numInFlight;
                next();
            }, timeout);
            socket.onopen = function() {
                if (socket) {
                    //    console.log(address + " success");
                    clearTimeout(timer);
                    servers.push(socket.url);
                    --numInFlight;
                    ipFull = ipBase + ip;
                    socket.close();
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
                if (ipFull)
                    cb(ipFull);
            }
        }
        next();
    }


    // **** **** **** COMMAND TABLE **** **** ****  

    function cmdTable(wsObject) {

        var cmd = wsObject.cmd;

        if (cmd === "heartbeat") {
            console.log("Heartbeat");
            return;
        }
        if (cmd === "server info") {
            events.fire(cmd, wsObject);
        }
        if (cmd === "fileDirty") {
            events.fire(cmd, wsObject);
        }

        if (cmd === 0x4) {
            console.log("Mode Change to: " + wsObject.mode);
            events.fire("setMode", wsObject);
            return;
        }

        if (cmd === 0x10) // MTC object
        {
            events.fire("mtc", wsObject);
            return;
        }
        if (cmd === 0x20) {
            events.fire("sessionData", wsObject);
            return;
        }
        if (cmd === 0x21) {
            events.fire("autoTrack", wsObject);
            return;
        }
        if (cmd === 0x22) {
            events.fire("addPoint", wsObject);
            return;
        }
        if (cmd === 0x23) {
            events.fire("deletePoint", wsObject);
            return;
        }
        if (cmd === 0x51) {
            events.fire("fileObj", wsObject);
            return;
        }
        if (cmd === 0x81) {
            events.fire("title", wsObject);
            return;
        }
        if (cmd === 0x82) {
            events.fire("version", wsObject);
            return;
        }
        if (properties.state.activeMode === "automation") {
            if (cmd === 0x31) {
                properties.sessionState.faders[wsObject.chn].status = wsObject.status;
                events.fire("trackStatus", wsObject);
                return;
            }
            if (cmd === 0x33) {
                events.fire("trackTouch", wsObject);
                return;
            }
            if (cmd === 0x34) {
                events.fire("trackLevel", wsObject);
                return;
            }
            if (cmd === 0x30) {
                events.fire("autoRealTime", wsObject);
                return;
            }
            if (cmd === 0x36) {
                events.fire("switchBank", wsObject);
                return;
            }
            if (cmd === 0x41) {
                events.fire("huiStatus", wsObject);
                return;
            }
        }
        if (properties.state.activeMode === "recall") {
            if (cmd === 250) {
                events.fire("recallData", wsObject);
                return;
            }
        }
        if (properties.state.activeMode === "recall") {
            if (cmd === 251) {
                events.fire("recallDeltaData", wsObject);
                return;
            }
        }
        if (properties.state.activeMode === "recall") {
            if (cmd === 252) {
                events.fire("updatePage", wsObject);
                return;
            }
        }
        if (properties.state.activeMode === "recall") {
            if (cmd === 253) {
                events.fire("recallUpdates", wsObject);
                return;
            }
        }
        if (properties.state.activeMode === "mf08") {
            if (cmd === "mf08") {
                events.fire("mf08", wsObject);
                return;
            }
        }
    }

}