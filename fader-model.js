/**
 * AutomanFaders - module
 * Contains fader objects for all fader states and values.
 * GUI updates will be sent directly from this module
 */
module.exports = AutomanFaders;

var FILTER = 2;

var STATUS_BITS = 0x0C;
var STATUS_MAN = 0x00;
var STATUS_AUTO = 0x01;
var STATUS_TOUCH = 0x02;
var STATUS_WRITE = 0x03;
var TOUCH_PRESS = 0x10;
var TOUCH_RELEASE = 0x20;
var MUTE_PRESS = 0x40;
var MUTE_RELEASE = 0x80;
var VCA_LO = 0xFF;
var VCA_HI = 0x03;

var STATE_IDLE = 0;
var STATE_START = 1;
var STATE_RUN = 2;
var STATE_STOP = 3;
var STATE_JUMP = 4;

var settings;
var remote;
var hui;

function AutomanFaders(max) {
    this.systemMode = 1;
    this.mtc;
    this.fader = [];
    this.cBank = 11;
    this.bank = 0;
    this.bankSwitch = 0;
    this.blink = 0;
    this.blinkID = 0;

    for (var i = 0; i < max; i++) {
        this.fader[i] = new fader(i);
        this.fader[i].id = i;
        this.fader[i].base = this;
        this.fader[i].bank = Math.floor(i / 8);
    }
}
AutomanFaders.prototype.globalRelay = function(outBuf, broadcast) {

    if (this.bankSwitch == 1) {
        // what qframe slot is the control bank on?
        var q = Math.floor(this.cBank / 3);
        var idOffset = ((this.cBank * 8) % 24) * 2;
        for (var i = 0; i < 8; i++) {
            // update IDs on the cBank
            outBuf[q][8 + (i * 2) + idOffset] = (this.bank * 8) + i + 1;
            // set ID bit
            var id = 9 + (i * 2) + idOffset;
            outBuf[q][id] = 0x10;
        }
        broadcast({
            "cmd": 0x36,
            "bank": this.bank
        })
        this.bankSwitch = 0;
    }
    if (this.blink == 1) {
        // what qframe slot is the control bank on?
        var q = Math.floor(this.cBank / 3);
        var id = ((((this.cBank * 8) % 24) + (this.blinkID % 8)) * 2);
        // set blink bit
        // Apparently IDs need to be set for blink as well
        outBuf[q][id + 8] = this.blinkID + 1;
        outBuf[q][id + 9] = 0x30;
        // clear flag
        this.blink = 0;
    }
}
AutomanFaders.prototype.settings = function(link) {
    settings = link;
}
AutomanFaders.prototype.remote = function(link) {
    remote = link;
}
AutomanFaders.prototype.hui = function(link) {
    hui = link;
}

function fader(id) {
    var me = this;
    this.base;
    this.id = 0;
    this.in = 0;
    this.out = 0;
    this.gui = 0;
    this.auto = 0;
    this.status = 0;
    this.mute = 0;
    this.touch = 0;
    this.touchBlink = 0;
    this.motor = 0;
    this.write = 0;
    this.writeLevel = 0;
    this.hui = null;
}

// this will route ins/outs/auto to the right places
fader.prototype.relay = function(mtc, automation) {

    var auto = (this.status > STATUS_MAN);
    var run = (mtc.state > 0);
    var hlBank = (this.bank == this.base.bank);
    var cBank = (this.bank == this.base.cBank);
    this.write = 0;

    // Is this part of the hilighted bank ?
    if (hlBank) {
        // then find out the ID of the fader in the control bank
        var ctrlBankID = (this.base.cBank * 8) + (this.id % 8);

        // drop out of write status when mtc stop or jump
        if ((mtc.state == STATE_STOP || mtc.state == STATE_JUMP) &&
            (this.status == STATUS_WRITE) &&
            (settings.automation.stopDropOut == 1)) {
            this.status = STATUS_TOUCH;
            remote.broadcast({
                "cmd": 0x31, // command for status change - real time data
                "chn": this.id, // channel no
                "status": this.status // 0, 1, 2 or 3
            });
        }

        var touch = (auto && this.base.fader[ctrlBankID].touch);
        if ((touch && auto) || (this.status == STATUS_WRITE)) {
            this.out = this.base.fader[ctrlBankID].in;
            this.writeLevel = this.base.fader[ctrlBankID].in;
            if (this.status > STATUS_AUTO) this.write = 1;
        } else if (run && auto && !touch)
            this.out = this.auto;
        else
            this.out = this.in;


    }
    // Is this part of the control bank ?
    if (cBank) {
        // then find out the ID of the fader in the hi-lighted bank
        var hlBankID = (this.base.bank * 8) + (this.id % 8);
        var hlFader = this.base.fader[hlBankID];
        this.status = hlFader.status;
        if (run && (hlFader.status > STATUS_MAN)) {
            this.out = hlFader.auto;
        } else {
            this.out = hlFader.in;
        }
        // hui injection not used - make writes weird in HUI modes
        /*
        if (hlFader.hui != null) {
            if (hlFader.hui.mode == 1) {
                this.out = hui.getValue(hlFader.hui.port, hlFader.hui.chn);
            } else if (hlFader.hui.mode == 2) {
                this.out = getDelta(hui.getValue(hlFader.hui.port, hlFader.hui.chn), this.out);
            }
        }
        */
        // cBank touch should set a touch flag for the SSL fader
    }
    // The rest of the faders
    if (!hlBank && !cBank) {
        if (run && auto)
            this.out = this.auto;
        if (!run || !auto)
            this.out = this.in;
    }


    // hui injection
    if (!cBank && (this.hui != null)) {
        if (this.hui.mode == 1) {
            this.out = hui.getValue(this.hui.port, this.hui.chn);
        } else if (this.hui.mode == 2) {
            this.out = getDelta(hui.getValue(this.hui.port, this.hui.chn), this.out);
        }
    }


    // prepare for GUI update
    if (this.out != this.gui) {
        //    var val = Math.round(((this.gui * (FILTER - 1) + this.out) / FILTER));
        this.gui = this.out;
        remote.broadcast({
            "cmd": 0x34, // command for vca change - real time data
            "chn": this.id, // channel no
            "status": this.gui // 10 bit value
        });
    }
}


fader.prototype.setIn = function(val) {
    //    val = Math.round(((this.in * (FILTER - 1) + val) / FILTER));
    if (val != this.in) {
        this.in = val;
    }
}

fader.prototype.setTouch = function(val) {
    if (this.touch != val) {
        this.touch = val;
    }
}

fader.prototype.setStatus = function(val) {
    this.status = val;
}

fader.prototype.setAuto = function(val) {
    if (val > -1) this.auto = val;
    else this.auto = this.in;
}

fader.prototype.muteFlags = function(flags) {
    if (flags != 0) {
        var hlFader;
        var cBank = (this.bank == this.base.cBank);
        // Is this part of the control bank ?
        if (cBank) {
            // then find out the ID of the fader in the hi-lighted bank
            var hlBankID = (this.base.bank * 8) + (this.id % 8);
            hlFader = this.base.fader[hlBankID];
        }
        // The rest of the faders
        if (!cBank) {
            hlFader = this;
        }
        hlFader.mute = !(flags >> 1);
    }
}

fader.prototype.touchFlags = function(flags) {
    if (flags != 0) {
        this.touch = !(flags >> 1);
        var hlBankID = (this.base.bank * 8) + (this.id % 8);
        this.base.fader[hlBankID].touchBlink = this.touch;
        remote.broadcast({
            "cmd": 0x33,
            "chn": hlBankID,
            "status": this.touch
        });
    }
}

fader.prototype.statusFlags = function(bits) {
    if (bits != 0) {
        var cBank = (this.bank == this.base.cBank);
        var hlBankID;
        var hlFader;

        // Is this part of the control bank ?
        if (cBank) {
            // then find out the ID of the fader in the hi-lighted bank
            hlBankID = (this.base.bank * 8) + (this.id % 8);
            // make changes to the hilited fader
            hlFader = this.base.fader[hlBankID];
        }
        // if not in control bank. SSL status switch was pressed
        else if (bits == 1) {
            // what to do with other faders
            // change bank
            var thisBank = Math.floor(this.id / 8);
            if (this.base.bank != thisBank) {
                // drop out all write statuses when bank switches
                for (var i = 0; i < 8; i++) {
                    var chId = (this.base.bank * 8) + i;
                    hlFader = this.base.fader[chId];
                    if ((hlFader.status == STATUS_WRITE) &&
                        (settings.automation.bankSwitchDropOut == 1)) {
                        hlFader.status = STATUS_TOUCH;
                        remote.broadcast({
                            "cmd": 0x31, // command for status change - real time data
                            "chn": chId, // channel no
                            "status": hlFader.status // 0, 1, 2 or 3
                        });
                    }
                }
                this.base.bank = thisBank;
                this.base.bankSwitch = 1;
            }
            this.base.blinkID = this.id;
            this.base.blink = 1;
        }

        if (this.base.systemMode == 1 && cBank) {
            var newStatus = STATUS_MAN;
            if (bits === STATUS_AUTO) {
                if (hlFader.status === STATUS_MAN) newStatus = STATUS_AUTO;
                else if (hlFader.status === STATUS_AUTO) newStatus = STATUS_MAN;
                else if (hlFader.status === STATUS_TOUCH) newStatus = STATUS_AUTO;
                else if (hlFader.status === STATUS_WRITE) {
                    newStatus = STATUS_TOUCH;
                    // latch
                }
            }
            if (bits === STATUS_TOUCH) {
                if (hlFader.status === STATUS_AUTO) newStatus = STATUS_TOUCH;
                else if (hlFader.status === STATUS_TOUCH) newStatus = STATUS_AUTO;
                else if (hlFader.status === STATUS_WRITE) newStatus = STATUS_TOUCH;
            }
            if (bits === STATUS_WRITE) {
                if (hlFader.status === STATUS_AUTO) newStatus = STATUS_WRITE;
                else if (hlFader.status === STATUS_TOUCH) newStatus = STATUS_WRITE;
                else if (hlFader.status === STATUS_WRITE) newStatus = STATUS_TOUCH;
            }
            if (hlFader != newStatus) {
                hlFader.setStatus(newStatus);
                /*
                hlFader.status = newStatus;
                remote.broadcast({
                    "cmd": 0x31, // command for status change - real time data
                    "chn": hlBankID, // channel no
                    "status": hlFader.status // 0, 1, 2 or 3
                });
                */
            }
        }
    }
}

fader.prototype.parseToBinary = function(outBuf) {
    var q = Math.floor(this.id / 24);
    var i = Math.floor(this.id % 24);
    // safety for not overwriting of flags
    if (checkBit(outBuf[q][9 + (i * 2)], 0x10)) return;
    // vca Out
    outBuf[q][8 + (i * 2)] = this.out & 0xff;
    outBuf[q][9 + (i * 2)] = (outBuf[q][9 + (i * 2)] & 0xFC) + ((this.out >> 8) & 3);
    // status
    outBuf[q][9 + (i * 2)] = (outBuf[q][9 + (i * 2)] & 0xF3) + ((this.status & 3) << 2);
    // mute
    outBuf[q][9 + (i * 2)] = (outBuf[q][9 + (i * 2)] & 0x7F) + ((this.mute & 1) << 7);

    if (this.touchBlink)
        outBuf[q][9 + (i * 2)] = setBit(outBuf[q][9 + (i * 2)], 0x40);
    else
        outBuf[q][9 + (i * 2)] = clearBit(outBuf[q][9 + (i * 2)], 0x40);

    outBuf[q][9 + (i * 2)] = (outBuf[q][9 + (i * 2)] & 0x7F) + ((this.mute & 1) << 7);
}

fader.prototype.setHuiMode = function(msg) {
    var wsObj = {
        "cmd": 0x41,
        "chn": msg.track
    };
    if (this.hui) {
        if (msg.mode == this.hui.mode &&
            msg.port == this.hui.port &&
            msg.chn == this.hui.chn) {
            this.hui = null;
            wsObj.huiMode = 0;
            remote.broadcast((wsObj));
            return;
        }
    }
    this.hui = {};
    this.hui.mode = msg.mode;
    this.hui.port = msg.port;
    this.hui.chn = msg.chn;
    wsObj.huiMode = msg.mode;
    wsObj.huiPort = msg.port;
    wsObj.huiChn = msg.chn;
    remote.broadcast((wsObj));
    //    setDirty(1);
}

fader.prototype.getHuiMode = function() {
    var huiObj = {
        "huiMode": 0
    };
    if (this.hui) {
        huiObj = {
            "huiPort": this.hui.port,
            "huiChn": this.hui.chn,
            "huiMode": this.hui.mode
        };
    }
    return huiObj;
}

fader.prototype.setStatus = function(status) {
    this.status = status;
    remote.broadcast({
        "cmd": 0x31, // command for status change - real time data
        "chn": this.id, // channel no
        "status": this.status // 0, 1, 2 or 3
    });
}

function getDelta(hui, vca) {
    var delta = Math.round((hui * 0.001385) * vca);
    if (delta < 0) delta = 0;
    if (delta > 1023) delta = 1023;
    return delta;
}

function setBit(byte, mask) {
    if ((byte & mask) !== mask) byte = byte + mask;
    return byte;
}

function clearBit(byte, mask) {
    byte = byte & (~mask);
    return byte;
}

function checkBit(byte, mask) {
    if ((byte & mask) === mask) return true
    return false;
}

function clearFlagBits(byteArray) {
    for (var n = 1; n < byteArray.length; n = n + 2) {
        if (byteArray[n]) byteArray[n] = byteArray[n] & 0xcf;
    }
    //    return byteArray;
}