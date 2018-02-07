var util = require("util")
var events = require("events")

module.exports = Cv96object;
// Makes Faders also an EventEmitter
util.inherits(Cv96object, events.EventEmitter)

/*
    This object map states of incomming data from Cv96
    and the outgoing data.

    It also copy flags for CV96 event flags. Needs to be cleared from outside.

    The states can be changed from external calls thru a few methods
*/
var MTC_EVENT = 0x70;
var FPS_ENUM = [24, 25, 30, 30];
var STATE_IDLE = 0;
var STATE_START = 1;
var STATE_RUN = 2;
var STATE_STOP = 3;
var STATE_JUMP = 4;
var timecode = {
    'fps': 0,
    'qFrame': 0,
    'lastPosition': 0,
    'position': 0,
    'state': 0,
    'stateFlag': 0,
    sender: 1,
    locked: 0
};
var cv96midiCheck = false;
var automationSync;

function Cv96object() {
    var self = this;
    this.previousState = STATE_IDLE;
    this.currentState = STATE_IDLE;
    this.stateFlag = 0;
    this.lastPosition = 0;
}

Cv96object.prototype.setCallback = function(automationSyncFunc) {
    automationSync = automationSyncFunc;
}

Cv96object.prototype.unPackMtcData = function unPackMtcData(buffer) {
    // 3 flags
    // 01 - start
    // 10 - stop
    // 11 - jump
    var eventFlags = (buffer[1] & MTC_EVENT) >> 4;
    timecode.fps = FPS_ENUM[(buffer[1] & 0xC) >> 2];
    timecode.qFrame = buffer[1] & 3;
    timecode.lastPosition = timecode.position;
    timecode.position = buffer[2] + (buffer[3] << 8) + (buffer[4] << 16) + (buffer[5] << 24);
    timecode.stateFlag = 0;

    if (timecode.qFrame == 0) {
        let cState = timecode.state;
        if (timecode.state == STATE_IDLE) {
            if (eventFlags == 1) { // run
                timecode.state = STATE_START;
            }
        } else if (timecode.state == STATE_START) {
            timecode.state = STATE_RUN;
        } else if (timecode.state == STATE_RUN) {
            if (eventFlags == 2) { // stop
                timecode.state = STATE_STOP;
            } else if (eventFlags == 4) {
                timecode.state = STATE_JUMP;
            }
        } else if (timecode.state == STATE_STOP) {
            timecode.state = STATE_IDLE;
        } else if (timecode.state == STATE_JUMP) {
            timecode.state = STATE_RUN;
        }
        if (cState != timecode.state) {
            timecode.stateFlag = 1;
        }
        if (timecode.lastPosition != timecode.position) automationSync(timecode);

    }
    return timecode;
}

Cv96object.prototype.checkForMtc = function(buffer) {
    // 3 flags
    // 01 - start
    // 10 - stop
    // 11 - jump

    var eventFlags = (buffer[1] & MTC_EVENT) >> 4;
    var fps = FPS_ENUM[(buffer[1] & 0xC) >> 2];
    if (eventFlags > 0 && eventFlags != 0x2) {
        cv96midiCheck = true;
        return true;
        console.log("ef: " + eventFlags)
    }
    cv96midiCheck = false;
    return false;
}