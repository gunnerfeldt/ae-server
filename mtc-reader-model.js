var midi = require('midi');

var timecode = {
    hh: 0,
    mm: 0,
    ss: 0,
    ff: 0,
    qf: 0,
    fpsID: 0,
    fps: 0,
    qFrame: 0,
    position: 0,
    lastPosition: 0,
    fpsEnum: [24, 25, 30, 30],
    locked: 0,
    event: 0,
    state: 0,
    sender: 2
}
var lastEvents = 0;
var automationSync;

module.exports = MtcReader;
// Sysex, timing, and active sensing messages are ignored
// by default. To enable these message types, pass false for
// the appropriate type in the function below.
// Order: (Sysex, Timing, Active Sensing)
// For example if you want to receive only MIDI Clock beats
// you should use
// input.ignoreTypes(true, false, true)
/*
        'fps': FPS_ENUM[(buffer[1] & 0xC) >> 2],
        'qFrame': buffer[1] & 3,
        'lastPosition': this.lastPosition,
        'position': buffer[2] + (buffer[3] << 8) + (buffer[4] << 16) + (buffer[5] << 24),
        'state': this.currentState,
        'stateFlag': 0
*/

function MtcReader() {
    var self = this;
    var midiInput;
    var watchdog;

    midiInput = new midi.input();
    midiInput.openVirtualPort("AE MTC in ");
    midiInput.ignoreTypes(true, false, true)
    console.log("Opening MTC input port ")

    // Configure callbacks.
    midiInput.on('message', function(deltaTime, message) { newDAWdata(message); });

    function newDAWdata(message) {

        var sysEx = message[0];
        var qFrame = message[1] >> 4;
        var value = message[1] & 0b00001111;

        if (message[0] == 0xF1) {

            // frame
            if ((qFrame & 0b110) == 0b000) {
                if ((qFrame & 1) == 0) {
                    timecode.position = timecode.position + 1;
                    timecode.ff = (timecode.ff & 0b10000) + value;
                    automationSync(timecode);
                } else {
                    timecode.ff = (timecode.ff & 0b1111) + ((value & 0b1) << 4);
                }
                // sec
            } else if ((qFrame & 0b110) == 0b010) {
                if ((qFrame & 1) == 0) {
                    timecode.ss = (timecode.ss & 0b110000) + value;
                } else {
                    timecode.ss = (timecode.ss & 0b1111) + ((value & 0b11) << 4);
                }
                // min
            } else if ((qFrame & 0b110) == 0b100) {
                if ((qFrame & 1) == 0) {
                    timecode.position = timecode.position + 1;
                    timecode.mm = (timecode.mm & 0b110000) + value;
                    automationSync(timecode);
                } else {
                    timecode.mm = (timecode.mm & 0b1111) + ((value & 0b11) << 4);
                }
                // hour
            } else if ((qFrame & 0b110) == 0b110) {
                if ((qFrame & 1) == 0) {
                    timecode.hh = (timecode.hh & 0b10000) + value;
                } else {
                    timecode.hh = (timecode.hh & 0b1111) + ((value & 0b1) << 4);
                    timecode.fpsID = ((value & 0b110) >> 1);
                    timecode.fps = timecode.fpsEnum[timecode.fpsID]
                    var fullFrame = (timecode.hh * 3600) * timecode.fps + (timecode.mm * 60) * timecode.fps + timecode.ss * timecode.fps + timecode.ff;

                    if (timecode.locked === 0) {
                        timecode.locked = 1;
                        timecode.event = 1;
                        //    automationSync(timecode);
                        //    console.log("running");
                    } else if (timecode.position != fullFrame) {
                        timecode.locked = 2;
                        timecode.event = 4;
                        //    automationSync(timecode);
                        //    console.log("jump");
                    };
                    timecode.position = fullFrame;
                    clearTimeout(watchdog);
                    watchdog = setTimeout(function isRunning() {
                        timecode.locked = 0;
                        timecode.event = 2;
                        automationSync(timecode);
                        //    console.log("Stopped");
                    }, 100);
                }
            }
        }
    }
}

MtcReader.prototype.setCallback = function(automationSyncFunc) {
    automationSync = automationSyncFunc;
}

MtcReader.prototype.getEventFlags = function() {
    // 3 flags
    // 01 - start
    // 10 - stop
    // 11 - jump
    return timecode.eventFlags;
}
MtcReader.prototype.getMtc = function getMtc() {
    return timecode;
}
MtcReader.prototype.setState = function(state) {
    timecode.state = state
}
MtcReader.prototype.inject = function inject(buf) {
    if ((buf[1] & 0x03) == 0) {
        buf[1] = (buf[1] & 0xC3) + (timecode.event << 4) + (timecode.fpsID << 2);
        timecode.event = 0;
    } else {
        buf[1] = (buf[1] & 0xF3) + (timecode.fpsID << 2);
    }
    return;
}