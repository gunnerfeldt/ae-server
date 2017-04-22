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

var STATE_IDLE = 0;
var STATE_START = 1;
var STATE_RUN = 2;
var STATE_STOP = 3;
var STATE_JUMP = 4;


function Cv96object() {
    var self = this;
    this.previousState = STATE_IDLE;
    this.currentState = STATE_IDLE;
    this.stateFlag = 0;
    this.lastPosition = 0;
}

Cv96object.prototype.unPackMtcData = function unPackMtcData(buffer) {

    // 3 flags
    // 01 - start
    // 10 - stop
    // 11 - jump
    var eventFlags = (buffer[1] & MTC_EVENT) >> 4;
    var mtc = {
        'fps': FPS_ENUM[(buffer[1] & 0xC) >> 2],
        'qFrame': buffer[1] & 3,
        'lastPosition': this.lastPosition,
        'position': buffer[2] + (buffer[3] << 8) + (buffer[4] << 16) + (buffer[5] << 24),
        'state': this.currentState,
        'stateFlag': 0
    };

    // Determine this frame's state (only if it's qFrame 0)
    // Because state must maintain thru all qframes
    if (mtc.qFrame == 0) {
        // there must be a buffer of the last position before dropout if caused by mtc jump or stop
        this.lastPosition = mtc.position;
        var newState = this.currentState;
        if (eventFlags !== 0) {
            if (eventFlags == 1) {
                newState = STATE_START;
            };
            if (eventFlags == 2) {
                newState = STATE_STOP;
            };
            if (eventFlags == 4) {
                this.previousState = this.currentState;
                newState = STATE_JUMP
            };
        } else {
            // rollover state from start, stop & jump
            if (this.currentState == STATE_START) {
                newState = STATE_RUN;
            }
            if (this.currentState == STATE_STOP) {
                newState = STATE_IDLE;
            }
            if (this.currentState == STATE_JUMP) {
                newState = this.previousState;
            }
        }
        if (newState != this.currentState) {
            this.currentState = newState;
            mtc.stateFlag = 1;
            this.stateFlag = 1;
        } else {
            mtc.stateFlag = 0;
            this.stateFlag = 0;
        }
        mtc.state = this.currentState;
    }
    mtc.stateFlag = this.stateFlag;
    return mtc;

}