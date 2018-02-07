/*

  Module - Automation
  
  Handles recording and playback of automation data

*/
module.exports = Automation;

var STATE_IDLE = 0;
var STATE_START = 1;
var STATE_RUN = 2;
var STATE_STOP = 3;
var STATE_JUMP = 4;

var REC_STATE_IDLE = 0;
var REC_STATE_DROP_IN = 1;
var REC_STATE_WRITE = 2;
var REC_STATE_DROP_OUT = 3;
var REC_STATE_LATCH = 4;

var settings;
var remote;

// Automation module
// constructor
function Automation(numOfTracks) {
    this.numOfTracks = numOfTracks;
    this.tracks = [];
    for (var i = 0; i < numOfTracks; i++) {
        this.tracks[i] = new TrackClass(this, i);
    }
}

// PUBLIC PROTOTYPES PUBLIC PROTOTYPES PUBLIC PROTOTYPES PUBLIC PROTOTYPES 
// PUBLIC PROTOTYPES PUBLIC PROTOTYPES PUBLIC PROTOTYPES PUBLIC PROTOTYPES 
// PUBLIC PROTOTYPES PUBLIC PROTOTYPES PUBLIC PROTOTYPES PUBLIC PROTOTYPES 

Automation.prototype.settings = function(link) {
    settings = link;
}
Automation.prototype.remote = function(link) {
    remote = link;
}
Automation.prototype.newFile = function sync() {
    for (var i = 0; i < this.numOfTracks; i++) {
        this.tracks[i].autoPts = {};
        this.tracks[i].syncVca = -1;
        this.tracks[i].autoPtsKeys = [];
        this.tracks[i].lastWrittenVca = -1;
        this.tracks[i].dropOutVca = -1;
    }
};

Automation.prototype.setPoint = function setPoint(trackID, position, value) {
    var track = this.tracks[trackID];
    track.setPoint(position, value);
};
Automation.prototype.setPts = function setPts(trackID, pts) {
    var track = this.tracks[trackID];
    track.autoPts = pts;
};
Automation.prototype.getPts = function getPts(trackID) {
    var track = this.tracks[trackID];
    return track.autoPts;
};
Automation.prototype.snapshot = function(fdrs) {
    for (var i = 0; i < 96; i++) {
        if (fdrs.fader[i].status == 0) {
            // write auto point
            // automation.tracks[i].writePoint(0, this.fader[i].in);
            this.tracks[i].autoPts = null;
            this.tracks[i].autoPts = {};
            this.tracks[i].syncVca = -1;
            this.tracks[i].autoPtsKeys = [];
            this.tracks[i].lastWrittenVca = -1;
            this.tracks[i].dropOutVca = -1;
            this.tracks[i].autoPts[0] = fdrs.fader[i].in;
            this.tracks[i].autoPts[1] = fdrs.fader[i].in;
            //            this.tracks[i].autoPts[1] = fdrs.fader[i].in;
            this.tracks[i].sort();
            /*
            remote.broadcast({
                'cmd': 0x21,
                'id': i,
                'points': this.tracks[i].autoPts,
                'track': i
            });
            */
        }
    }
    console.log("autPts 0");
    console.log(this.tracks[0].autoPts);
}

// Constructor for the automation tracks
var TrackClass = function(base, id) {
    this.base = base;
    this.id = id;
    this.autoPts = {};
    this.autoPtsKeys = [];
    this.lastWrittenVca = -1;
    this.syncVca = -1;
    this.dropOutVca = -1;
    this.recState = REC_STATE_IDLE;
    this.syncMtc = -1;
    //    this.latchFlag = 0;
}

// READ POINT
TrackClass.prototype.sync = function(mtc) {
    // Check for frame step(s) - one frame since last sync
    if ((mtc.position == (this.syncMtc + 1))) {
        // Check if there's a point exactly here
        if (this.autoPts[mtc.position] != undefined) {
            // If then just copy that value
            this.syncVca = this.autoPts[mtc.position];
        }
        // Search backwards for the last point
    } else {
        this.syncVca = this.findPoint(mtc.position);
    }
    if (mtc.state == STATE_START || mtc.state == STATE_JUMP) {}
    this.syncMtc = mtc.position;
    return this.syncVca;
}

TrackClass.prototype.writeSync = function(mtc, fader) {
    var recState = this.recStateMachine(mtc, fader);
    /*
    if (this.id == 0) {
        console.log("rec state " + recState);
    }
    */
    if (recState == REC_STATE_DROP_IN) {
        // check empty track
        this.autoPtsKeys = Object.keys(this.autoPts);
        var entries = this.autoPtsKeys.length;
        if (entries == 0) {
            this.autoPts[0] = fader.in;
            this.syncVca = fader.in;
            this.lastWrittenVca = fader.in;
        } else {
            this.writePoint(mtc.position, fader.writeLevel);
        }
        sendGuiPoints(fader.id, this.autoPts);

    } else if (recState == REC_STATE_WRITE) {
        this.writePoint(mtc.position, fader.writeLevel);
        // must make a lighter real time gui draw
        // sendGuiPoints(fader.id, this.autoPts);
        addGuiPoint(fader.id, mtc.position, fader.writeLevel, fader.writeLevel);

    } else if (recState == REC_STATE_DROP_OUT) {
        this.writePoint(mtc.position, fader.writeLevel);
        sendGuiPoints(fader.id, this.autoPts);
    } else if (recState == REC_STATE_LATCH) {
        this.latch(mtc.position);
        this.syncVca = this.lastWrittenVca;
        fader.auto = this.lastWrittenVca;
        sendGuiPoints(fader.id, this.autoPts);
    }
}

// WRITE POINT
TrackClass.prototype.writePoint = function writePoint(position, value) {

    // if point is set already, store and delete
    if (this.autoPts[position] != undefined) {
        // point are synced so can be deleted
        delete this.autoPts[position];
        if (this.autoPts[position + 1] == undefined) {
            if (value != this.syncVca) this.autoPts[position + 1] = this.syncVca;
        }
    } else {
        if (value != this.syncVca) this.autoPts[position + 1] = this.syncVca;
    }
    // if point fader moved since last point, write!!
    if (this.lastWrittenVca != value) {
        // here we store the point
        this.autoPts[position] = value;
        // buffer the level
        this.lastWrittenVca = value;
        // sort the list
        this.sort();
    }
}

// Backward searching function
TrackClass.prototype.findPoint = function findPoint(mtc) {
    this.autoPtsKeys = Object.keys(this.autoPts);
    var entries = this.autoPtsKeys.length;
    if (entries > 0) {
        // make sure the point list is not empty
        //    if(this.id == 0) console.log("found entriy for ch 0");
        if (mtc > this.autoPtsKeys[entries - 1]) {
            // mtc is after last stored point
            // output last entry
            return this.autoPts[this.autoPtsKeys[entries - 1]];
        } else {
            // iterate thru entries
            for (var i = 0; i < entries; i++) {
                // look for an entry higher than the mtc position
                if (this.autoPtsKeys[i] > (mtc)) {
                    // if there's only one single entry, index must offset 1
                    if (i == 0) i = 1;
                    // put value in a var
                    return this.autoPts[this.autoPtsKeys[i - 1]];
                }
            }
        }
    } else {
        // no entries
        return -1;
    }
}

// erase points from..
TrackClass.prototype.latch = function latch(mtc) {
    this.autoPtsKeys = Object.keys(this.autoPts);
    var entries = this.autoPtsKeys.length;
    if (entries > 0) {
        // iterate thru entries
        for (var i = 0; i < entries; i++) {
            // look for an entry higher than the mtc position
            if (this.autoPtsKeys[i] > (mtc - 1)) {
                delete this.autoPts[this.autoPtsKeys[i]];
            }
        }
    }
}

// State machine for track WRITE STATE
TrackClass.prototype.recStateMachine = function(mtc, fader) {
    if ((this.recState == REC_STATE_DROP_IN) && (mtc.state == STATE_RUN)) this.recState = REC_STATE_WRITE;
    else if ((this.recState == REC_STATE_DROP_OUT) || (this.recState == REC_STATE_LATCH)) this.recState = REC_STATE_IDLE;
    else if ((this.recState == REC_STATE_IDLE) && (fader.write == 1) && (mtc.state == STATE_RUN)) this.recState = REC_STATE_DROP_IN;
    else if (this.recState == REC_STATE_WRITE && fader.write != 1) {
        if (fader.latch) {
            this.recState = REC_STATE_LATCH;
            fader.latch = 0;
        } else this.recState = REC_STATE_DROP_OUT;
    } else if (this.recState == REC_STATE_WRITE && mtc.state != STATE_RUN) this.recState = REC_STATE_DROP_OUT;
    return this.recState;
}

// Sorting Function
TrackClass.prototype.sort = function sort() {
    this.autoPtsKeys = Object.keys(this.autoPts);
    this.autoPtsKeys.sort(function(a, b) {
        return a - b;
    });
}


// this is heavy for the network so make it optional for now
// this is done/checked in wsserver.js
function addGuiPoint(id, position, value, dropOutVca) {
    remote.broadcast({
        "cmd": 0x22, // command for track points
        "id": id, // channel no
        "position": position, // ONE point
        "vca": value, // ONE point
        "dropOutVca": dropOutVca // ONE point
    });
}

function deleteGuiPoint(sender, id, position, dropOutVca) {
    remote.broadcast({
        "cmd": 0x23, // command for track points
        "id": id, // channel no
        "position": position, // ONE point
        "dropOutVca": dropOutVca
    });
}

function sendGuiPoints(id, newPoints) {
    remote.broadcast({
        'cmd': 0x21,
        'id': id,
        'points': newPoints,
        'track': id
    });
}