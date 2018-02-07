var Cv96Module = require("./cv96-model.js");
var Automation = require("./automation-model.js");
var Faders = require("./fader-model.js");
var USBmodule = require("./hid-model.js");
var Remote = require("./remote.js");
var Files = require("./files.js");
var Hui = require("./hui-model.js");
var MtcReader = require("./mtc-reader-model.js");
var Conf = require("./conf.js");

var cv96 = new Cv96Module();
var automation = new Automation(96);
var faders = new Faders(96);
var usbModule = new USBmodule();
var hui = new Hui();
var mtcReader = new MtcReader();
var remote = new Remote();
var confModule = new Conf();
var conf;
var mtcSource = 0;

const CV96_MTC = 1;
const INTERNAL_MTC = 2;

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
    // init internal MTC reader
    cv96.setCallback(automationSync);
    mtcReader.setCallback(automationSync);

    this.go = function(inBuf, outBuf) {
        parseCv96Data(inBuf, outBuf);
    }
    faders.bankSwitch = 1;
    //    faders.fader[0].hui = { mode: 2, port: 0, chn: 0 };
}

Engine.prototype.setConf = function(arg) {
    conf = arg;
    remote.link({
        conf: conf
    });
    return Files.setConf(arg);
}
Engine.prototype.getConf = function() {
    conf = confModule.check(Files.getConf());
    remote.link({
        conf: conf
    });
    return conf;
}
Engine.prototype.saveConf = function(conf) {
        return Files.saveConf(conf);
    }
    /*
            'fps': FPS_ENUM[(buffer[1] & 0xC) >> 2],
            'qFrame': buffer[1] & 3,
            'lastPosition': this.lastPosition,
            'position': buffer[2] + (buffer[3] << 8) + (buffer[4] << 16) + (buffer[5] << 24),
            'state': this.currentState,
            'stateFlag': 0

        var STATE_IDLE = 0;
        var STATE_START = 1;
        var STATE_RUN = 2;
        var STATE_STOP = 3;
        var STATE_JUMP = 4;
    */

function parseCv96Data(inBuf, outBuf) {
    // qFrame holds the valur from last call
    clearFlagBits(outBuf[qFrame]);

    if (mtcSource == INTERNAL_MTC) mtcReader.inject(inBuf);

    var qPacket = cv96.unPackMtcData(inBuf);
    qFrame = qPacket.qFrame;

    mtcReader.setState(qPacket.state);
    if (qPacket.stateFlag) console.log("State change: " + qPacket.state);

    // fill the fader array from incoming data
    for (var i = 0; i < 24; i++) {
        var chn = (qPacket.qFrame * 24) + i;
        // vca level from fader
        faders.fader[chn].setIn(inBuf[8 + (i * 2)] + ((inBuf[9 + (i * 2)] & 3) << 8));
        // Below functions will also switch state
        // status switch press / release
        faders.fader[chn].statusFlags((inBuf[9 + (i * 2)] >> 2) & 3);
        // mute switch press / release
        faders.fader[chn].muteFlags((inBuf[9 + (i * 2)] >> 6) & 3);
        // touch sense / release
        faders.fader[chn].touchFlags((inBuf[9 + (i * 2)] >> 4) & 3);
        // Route the cv values (no position info is needed)
        faders.fader[chn].relay(qPacket, automation);
        // parse data to binary
        faders.fader[chn].parseToBinary(outBuf);
    }
    // do global things once a frame, at the roll over between last and first qFrame
    if (qPacket.qFrame == 3) faders.globalRelay(outBuf, remote.broadcast);

    // varför blinkar Frans statuslampor?
    //if (qFrame == 0) console.log("buf id 9: " + outBuf[0][9]);

    return outBuf[qFrame];
}


// this is called from both mtc readers every running frame + one stop frame
function automationSync(timecode) {
    //    console.log("auto sync at " + timecode.position)
    // fill the fader array from incoming data
    for (var qFrame = 0; qFrame < 4; qFrame++) {
        for (var i = 0; i < 24; i++) {
            var chn = (qFrame * 24) + i;
            // vca level from automation track
            /*
            setAuto(int)
            .sync(object) & .writeSync(object)
                state:
                position:
            */
            faders.fader[chn].setAuto(automation.tracks[chn].sync(timecode));
            // Do automation writes
            automation.tracks[chn].writeSync(timecode, faders.fader[chn]);
            //    if (faders.fader[chn].latch) faders.fader[chn].latch = 0;
        }
    }
    mtcSource = timecode.sender;
    timecode.cmd = 0x10;
    timecode.guiPoints = [];
    remote.broadcast(timecode);
    //    console.log(timecode);
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

    if (data.request == "setMode") {
        if (data.request == "setMode") {
            var wsObj = {};
            wsObj.cmd = 0x4
            wsObj.mode = data.mode;
            wsObj.id = data.id;

            if (data.mode == "mf08") {
                console.log(wsObj);
                remote.send(wsObj);
                faders.mf08remote(true);
                faders.updateMf08();
            } else {
                faders.mf08remote(false);
                remote.broadcast((wsObj));
            }
        }

    }
    if (data.request == "setRecall") {}

    if (data.request == "newFile") {
        // faders = new Faders(96);
        //    automation = new Automation(96);
        // hui = new Hui();
        automation.newFile();
        faders.newFile();
        hui.reset();
        //    Files.packFaderData(faders);
        //    Files.packAutomationData(automation)
        remote.newFile();
        remote.sendSessionData();
        //   console.log("autoPts 0");
        //    console.log(automation.tracks[0].autoPts);


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
            console.log("autoPts 0");
            console.log(automation.tracks[0].autoPts);
        })
    }
    if (data.request == "snapshot") {
        /*
        loop thru tracks
        if manual - write pos(0) = current vca
        set state to read
        */
        //   faders.snapshot(automation);
        automation.snapshot(faders);
        faders.snapshot();
        remote.sendSessionData();
    }
});

remote.on("mf08", function(data) {
    faders.mf08(data);
});