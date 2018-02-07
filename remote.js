/*

  Module - remote
  
  All requests checks here against a command-number and triggers appropriate
  callbacks in app.js

  Change: Get access to all needed modules from here.
    Maybe make sandboxed methods in these modules called remote...

  Data to the remote gui is done thru here as well

  wsserver.js does the WebSocket stuff

*/


var util = require("util")
var events = require("events")
var Server = require("./wsserver.js");

module.exports = Remote;
// Makes remote also an EventEmitter
util.inherits(Remote, events.EventEmitter);

// access to external modules
var files;
var faders;
var automation;
var recall;
var remote;
var conf;

function Remote() {
    var self = this;
    var server = new Server();
    remote = this;

    server.on("command", function(wsObject) {

            if (wsObject.cmd == "new") {
                var callback = {};
                callback.request = "newFile";
                callback.path = wsObject.path;
                self.emit("request", callback);
            }
            if (wsObject.cmd == 1) {
                var callback = {};
                callback.id = wsObject.id;
                callback.request = "sendSessionData";
                self.emit("request", callback);
            }
            if (wsObject.cmd == 2) {
                var callback = {};
                callback.request = "saveFile";
                callback.path = wsObject.path;
                self.emit("request", callback);
            }
            if (wsObject.cmd == 3) {
                var callback = {};
                callback.request = "openFile";
                callback.path = wsObject.path;
                self.emit("request", callback);
            }
            if (wsObject.cmd == 4) {
                var callback = {};
                callback.request = "setMode";
                callback.mode = wsObject.mode;
                callback.id = wsObject.id;
                self.emit("request", callback);
            }
            if (wsObject.cmd == 5) {
                self.emit("expandFileTree", wsObject);
            }
            if (wsObject.cmd == 6) {
                self.emit("renameFolder", wsObject);
            }
            if (wsObject.cmd == 7) {
                self.emit("newFolder", wsObject);
            }
            if (wsObject.cmd == 0x41) {
                console.log("set HUI link");
                self.emit("huiLink", wsObject);
            }
            if (wsObject.cmd == 0x42) {
                console.log("set track status");
                console.log(wsObject);
                self.emit("guiStatus", wsObject);
            }

            if (wsObject.cmd == 0x81) {
                self.emit("newTitle", wsObject);
            }
            if (wsObject.cmd == 0x82) {
                self.emit("newVersion", wsObject);
            }
            if (wsObject.cmd == "snapshot") {
                var callback = {};
                callback.request = "snapshot";
                self.emit("request", callback);
            }
            if (wsObject.cmd == 250) {
                var callback = {};
                callback.request = "setRecall";
                callback.mode = "recall";
                callback.bank = wsObject.bank;
                callback.region = wsObject.region;
                self.emit("request", callback);
            }
            if (wsObject.cmd == 254) {
                var remote96version = wsObject.versionHi + "." + wsObject.versionLo;
                console.log("SW96 version " + remote96version + " connected");
                remotes.push(conn);
                console.log("Added remote " + (remotes.length));
                var callback = {};
                callback.request = "sendSessionData";
                self.emit("request", callback);
                updateGui();
            }
            if (wsObject.cmd == "mf08") {
                self.emit("mf08", wsObject);
            }
        })
        // *** *** TRANSPARENT FUNCTIONS *** ***
    this.broadcast = function(msg) {
        server.broadcast(msg);
    }
    this.send = function(msg) {
        server.send(msg);
    }
    this.getIPAddress = function() {
        return server.getIPAddress();
    }

    this.on("request", function(data) {
        // callback from remote GUI   
        /*
                if (data.request == "setMode") {
                    var wsObj = {};
                    wsObj.cmd = 0x4
                    wsObj.mode = data.mode;
                    remote.broadcast((wsObj));
                }
                */
        if (data.request == "sendSessionData") {
            console.log("Client ID '" + data.id + "' requests full session data");
            this.sendSessionData(data.id);
        }
    });

}

Remote.prototype.link = function(obj) {
    if (obj.Files) Files = obj.Files;
    if (obj.faders) faders = obj.faders;
    if (obj.recall) recall = obj.recall;
    if (obj.automation) automation = obj.automation;
    if (obj.conf) conf = obj.conf;
}


Remote.prototype.newFile = function() {
    for (var n = 0; n < 96; n++) {
        faders.fader[n].status = 0;
        faders.fader[n].auto = 0;
        faders.fader[n].mute = 0;
        faders.fader[n].touch = 0;
        faders.fader[n].touchBlink = 0;
        faders.fader[n].motor = 0;
        faders.fader[n].write = 0;
        faders.fader[n].writeLevel = 0;
        faders.fader[n].hui = null;
        faders.fader[n].latch = 0;
    }
    Files.setFileLabel(Files.getPath().fileLabel + ".1");
}

Remote.prototype.sendSessionData = function(id) {

    var fileObj = Files.readdir('./aeFiles');
    var wsObj = {
        "cmd": 0x51,
        "id": id,
        "fileObj": fileObj
    };
    if (id) remote.send(wsObj);
    else remote.broadcast(wsObj);

    /*** Pack Session Data ***/
    var sessionData = Files.getCurrentSessionData();
    for (var n = 0; n < 96; n++) {
        sessionData.faders[n] = {
            "status": faders.fader[n].status,
            "level": faders.fader[n].gui,
            "hui": faders.fader[n].getHuiMode(),
            "autoPts": automation.getPts(n)
        };
        //   console.log("status chn: " + n + ", " + faders.fader[n].status);
    }

    sessionData.bank = faders.bank;
    sessionData.region = 0;
    sessionData.mode = "auto";
    sessionData.path = Files.getPath();

    var wsObj = {
        "cmd": 0x20,
        "id": id,
        "sessionData": sessionData
    };
    if (id) remote.send(wsObj);
    else remote.broadcast(wsObj);

}