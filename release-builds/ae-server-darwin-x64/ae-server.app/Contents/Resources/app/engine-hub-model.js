var Cv96Module = require("./cv96-model.js");
var Automation = require("./automation-model.js");
var Faders = require("./fader-model.js");
var USBmodule = require("./hid-model.js");
var Remote = require("./remote.js");
var Files = require("./files.js");
var Hui = require("./hui-model.js");
var Conf = require("./conf.js");

var cv96 = new Cv96Module();
var automation = new Automation(96);
var faders = new Faders(96);
var usbModule = new USBmodule();
var hui = new Hui();
var remote = new Remote();
var confModule = new Conf();
var conf;

var qFrame = 0;

var settings;

module.exports = Engine;
console.log(remote.getIPAddress());

function Engine() {
    console.log("Home dir: " + process.env.HOME);
    process.chdir(process.env.HOME);
    console.log("The current working directory is " + process.cwd());
    Files.aeFilesCheck();

    // give remote access to modules
    remote.link({
        faders: faders,
        automation: automation,
        Files: Files
    });
    // give modules access to settings & remote
    faders.settings(settings);
    faders.remote(remote);
    faders.hui(hui);
    automation.settings(settings);
    automation.remote(remote);
    Files.remote(remote);

    // init HID module and give it a callback
    // function to parse usb buffer
    usbModule.init(parseCv96Data);
    /*
    simulator.on('data', function(data) {
        parseCv96Data(data);
    })
    */
    this.go = function(inBuf, outBuf) {
        parseCv96Data(inBuf, outBuf);
    }
    faders.bankSwitch = 1;
    //    faders.fader[0].hui = { mode: 2, port: 0, chn: 0 };
}

Engine.prototype.setConf = function(arg) {
    conf = arg;
    return Files.setConf(arg);
}
Engine.prototype.getConf = function() {
    conf = confModule.check(Files.getConf());
    return conf;
}
Engine.prototype.saveConf = function(conf) {
    return Files.saveConf(conf);
}

function parseCv96Data(inBuf, outBuf) {
    clearFlagBits(outBuf[qFrame]);
    // parse mtc
    var mtc = cv96.unPackMtcData(inBuf);
    qFrame = mtc.qFrame;
    // fill the fader array from incoming data
    for (var i = 0; i < 24; i++) {
        var chn = (mtc.qFrame * 24) + i;
        // vca level from fader
        faders.fader[chn].setIn(inBuf[8 + (i * 2)] + ((inBuf[9 + (i * 2)] & 3) << 8));
        // vca level from automation track
        faders.fader[chn].setAuto(automation.tracks[chn].sync(mtc));
        // Below functions will also switch state
        // status switch press / release
        faders.fader[chn].statusFlags((inBuf[9 + (i * 2)] >> 2) & 3);
        // mute switch press / release
        faders.fader[chn].muteFlags((inBuf[9 + (i * 2)] >> 6) & 3);
        // touch sense / release
        faders.fader[chn].touchFlags((inBuf[9 + (i * 2)] >> 4) & 3);
        // Route the cv values
        faders.fader[chn].relay(mtc, automation);
        // Do automation writes
        automation.tracks[chn].writeSync(mtc, faders.fader[chn]);
        // parse data to binary
        faders.fader[chn].parseToBinary(outBuf);
    }
    // do global things once a frame, at the roll over between last and first qFrame
    if (mtc.qFrame == 3) faders.globalRelay(outBuf, remote.broadcast);

    mtc.cmd = 0x10;
    mtc.guiPoints = [];
    /*
    mtc.redRegions = automation.getRedRegions(mtc.state);
    automation.clearRrStop();
    mtc.guiPoints = automation.getGuiPoints();
    */
    remote.broadcast(mtc);
    return outBuf[qFrame];
}

settings = {
    automation: {
        stopDropOut: 1,
        bankSwitchDropOut: 1
    }
}


function checkBit(byte, mask) {
    if ((byte & mask) === mask) return true
    return false;
}

function clearFlagBits(byteArray) {
    for (var n = 9; n < byteArray.length; n = n + 2) {
        if (byteArray[n]) byteArray[n] = byteArray[n] & 0xcf;
    }
    byteArray[0] = 0x01;
    byteArray[7] = 0x00;
    //    return byteArray;
}

remote.on("huiLink", function(data) {
    faders.fader[data.track].setHuiMode(data);
});

remote.on("guiStatus", function(data) {
    faders.fader[data.track].setStatus(data.status);
    //    setDirty(1);
});

remote.on("request", function(data) {
    // callback from remote GUI   
    /*
    if (data.request == "setMode") {
    }
    if (data.request == "setRecall") {
    }
    */
    if (data.request == "newFile") {

    }
    if (data.request == "saveFile") {
        if (data.path) Files.setPath(data.path);
        //      Files.packMtc(Mtc);
        Files.packFaderData(faders);
        Files.packAutomationData(automation);
        var result = Files.saveFile();
        if (result) {
            console.log("File saved successfully");
            var fileObj = Files.readdir('./aeFiles');
            var wsObj = {
                "cmd": 0x51,
                "fileObj": fileObj
            };
            remote.broadcast((wsObj));
            var wsObj = {};
            wsObj.cmd = 0x4
            wsObj.mode = "auto";
            remote.broadcast((wsObj));
            //    setDirty(0);
        }
    }
    if (data.request == "openFile") {
        Files.openFile(data.path, faders, automation, function() {
            remote.sendSessionData();
        })
    }
});