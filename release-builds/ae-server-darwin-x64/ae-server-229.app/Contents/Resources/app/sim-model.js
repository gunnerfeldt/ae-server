var WebSocketServer = require('ws').Server,
    ws = new WebSocketServer({ port: 8002 });

var position = 0;
var timer = 0;
var position = 1;
var running = 0;
var fps = 1;
var fpsMs = [10, 10, 8, 8];
var fpsList = [24, 25, 30, 30];
var state = 0;
var qFrame = 0;
var run = 0;
var stop = 0;
var jump = 0;
var callback;
var sslMode = 'auto';


var usbIn = [
    [],
    [],
    [],
    []
];
var usbOut = [
    [],
    [],
    [],
    []
];

var vcaOut = [];
var statusOut = [];
var muteOut = [];

var faderVal = 0;
var id = 0;

var faderSim = [];
var simSim = 0;

if (simSim == 1) {
    fillFaderSim();
}

for (var n = 0; n < 64; n++) {
    usbIn[0][n] = 0;
    usbIn[1][n] = 0;
    usbIn[2][n] = 0;
    usbIn[3][n] = 0;
    usbOut[0][n] = 0;
    usbOut[1][n] = 0;
    usbOut[2][n] = 0;
    usbOut[3][n] = 0;
}
for (var n = 0; n < 96; n++) {
    vcaOut[n] = -1;
}

var tick = function() {
    // Quarter Frame
    qFrame = (qFrame + 1) & 3;
    localTick();


    if (simSim == 1) {
        for (var i = 0; i < 24; i++) {
            var ch = i + (qFrame * 24);
            faderSim[ch] = ((faderSim[ch] + 10) & 0x3ff);
            setVca(ch, faderSim[ch]);
        }
    }

    if (sslMode == 'auto') {
        callback({
            'callback': "qFrame",
            'qFrame': qFrame,
            'data': usbIn[qFrame]
        });
    }

    if (sslMode == 'recall') {
        callback({
            'callback': "recall",
            'qFrame': 0,
            'data': usbIn[0]
        });
    }


    // Frame
    if (qFrame === 0 && state === 1) {
        position++;
        /*
        callback({
          'callback'  : "frame",
          'position'  : position
        });
        */
    }

    for (var n = 0; n < 24; n++) {
        usbIn[qFrame][9 + (n * 2)] = (usbIn[qFrame][9 + (n * 2)]) & 3;
    }

};

var rollOver = 0;
module.exports = {
    'start': function() {
        console.log("Start Simulator");
        running = 1;
        if (!timer) {
            timer = setInterval(tick, fpsMs[fps]);
        }
    },
    'stop': function() {
        console.log("Stop Simulator");
        running = 0;
        if (timer) {
            clearInterval(timer);
            timer = 0;
        }
    },
    'setFps': function(index) {
        fps = index;
        this.stop();
        this.start();
    },
    'callback': function(callbackMethod) {
        callback = callbackMethod;
    },
    'feed': function(buffer) {
        var slot = buffer[1] & 3;
        var mode = buffer[7];
        if ((mode && 0x0F) == 0x00) {
            sslMode = 'auto';
            if (mode == 0xF0) {
                // send to gui sim
                broadcast(JSON.stringify({
                    'cmd': 'mode',
                    'mode': 'auto'
                }));
            }

            for (var n = 0; n < 24; n++) {
                var chn = (slot * 24) + n;
                var vca = buffer[8 + (n * 2)];
                vca += ((buffer[9 + (n * 2)] & 3) << 8);
                var status = ((buffer[9 + (n * 2)] & 0x0C) >> 2);
                var mute = ((buffer[9 + (n * 2)] & 0x80) >> 7);
                var idChangeFlag = ((buffer[9 + (n * 2)] & 0x10) >> 4);
                var blinkFlag = ((buffer[9 + (n * 2)] & 0x20) >> 5);

                if (idChangeFlag) {
                    console.log("id change " + chn);
                    buffer[9 + (n * 2)] = buffer[9 + (n * 2)] & 0xef;
                    // send to gui sim
                    broadcast(JSON.stringify({
                        'cmd': 0x10,
                        'chn': chn,
                        'id': buffer[8 + (n * 2)]
                    }));
                    rollOver = 1;
                }
                if (blinkFlag) {
                    console.log("id blink " + chn);
                    buffer[9 + (n * 2)] = buffer[9 + (n * 2)] & 0xdf;
                    // send to gui sim
                    broadcast(JSON.stringify({
                        'cmd': 0x11,
                        'chn': chn
                    }));
                    rollOver = 1;
                }


                if (vca != vcaOut[chn] && rollOver == 0) {
                    // send to gui sim
                    broadcast(JSON.stringify({
                        'cmd': 0x02,
                        'chn': chn,
                        'val': vca
                    }));
                    vcaOut[chn] = vca;
                    console.log("vca to sim on ID: " + chn + ", pos: " + vca);
                }
                if (rollOver) {
                    status = statusOut[chn];
                    rollOver = 0;
                }
                if (status != statusOut[chn] && rollOver == 0) {
                    // send to gui sim
                    statusOut[chn] = status;
                    broadcast(JSON.stringify({
                        'cmd': 0x03,
                        'chn': chn,
                        'status': status
                    }));
                }
                muteOut[chn] = mute;
            }
        }
        if (mode == 0xF1) {
            sslMode = 'recall';
            //  console.log("recall simulator Here!!!");
            // send to gui sim
            broadcast(JSON.stringify({
                'cmd': 'mode',
                'mode': 'recall'
            }));
        }
        if (mode == 0xF2) {
            sslMode = 'recall';
            //     console.log("before sending to sim ws buf 57 "+buffer[57]);
            // send to gui sim
            broadcast(JSON.stringify({
                'cmd': 'recall',
                'mode': 'recall',
                'bank': buffer[56],
                'id': buffer[57]
            }));
        }
    },
    'recall': function() {

        usbIn[0][7] = 0xF2;
        usbIn[0][56] = 0;
        usbIn[0][57] = id;

        for (n = 0; n < 16; n = n + 2) {
            usbIn[0][8 + n] = faderVal & 0xff;
            usbIn[0][9 + n] = (faderVal >> 8) & 0x3;
        }
        console.log("sim recall");
        /*
          callback({
            'callback'  : "recall",
            'data'  : usbIn[0]
          });
        */

    },
    'running': function() {
        return this.running;
    }
};

function localTick() {
    var mtcByte = 0;
    mtcByte += qFrame;
    mtcByte += fps << 2;
    if (qFrame == 0) {
        mtcByte += run << 4;
        mtcByte += stop << 5;
        mtcByte += jump << 6;


        // always reset the flags
        run = 0;
        stop = 0;
        jump = 0;
    }


    usbIn[qFrame][1] = mtcByte;
    usbIn[qFrame][2] = position & 0xFF;
    usbIn[qFrame][3] = (position >> 8) & 0xFF;
    usbIn[qFrame][4] = (position >> 16) & 0xFF;
    usbIn[qFrame][5] = (position >> 24) & 0xFF;
}


ws.on('connection', function connection(conn) {
    // **** **** **** SERVER CONNECTION **** **** ****
    console.log("Simulator connected");

    // **** **** **** INCOMING MESSAGE **** **** ****
    conn.on("message", function(str) {
            if (isJsonString(str)) {
                var wsObject = JSON.parse(str);
                if (wsObject.cmd == 1) // simulator trigger
                {}
            } else {
                console.log("not a JSON message");
            }
        })
        // **** **** **** SERVER CONNECTION CLOSED **** **** ****
    conn.on("close", function(code, reason) {
            console.log(code);
            console.log(reason);
        })
        // **** **** **** SERVER CONNECTION ERROR **** **** ****   
    conn.on("error", function(err) {
        console.log(err);
        conn.close();
    });
})



var setVca = function(absChn, val) {
    var chn = Math.floor(absChn % 24);
    var slot = Math.floor(absChn / 24);
    usbIn[slot][8 + (chn * 2)] = val & 0xff;
    usbIn[slot][9 + (chn * 2)] = (usbIn[slot][9 + (chn * 2)] & 0xfc) + (val >> 8) & 0x3;
};
var setStatus = function(chn, val) {
    var mfChn = chn % 24;
    var slot = Math.floor(chn / 24);
    usbIn[slot][9 + (mfChn * 2)] = (usbIn[slot][9 + (mfChn * 2)] & 0xf3) + ((val & 3) << 2);
};
var setMute = function(absChn, val) {
    var chn = Math.floor(absChn % 24);
    var slot = Math.floor(absChn / 24);
    usbIn[slot][9 + (chn * 2)] = (usbIn[slot][9 + (chn * 2)] & 0x3f) + (0x80 >> val);
};

var setMfVca = function(chn, val) {
    //    console.log(chn + " " + val);
    var mfChn = chn % 24;
    var slot = Math.floor(chn / 24);
    usbIn[slot][8 + (mfChn * 2)] = val & 0xff;
    usbIn[slot][9 + (mfChn * 2)] = (usbIn[slot][9 + (mfChn * 2)] & 0xfc) + ((val >> 8) & 0x3);
};
var setMfTouch = function(chn, val) {
    var mfChn = chn % 24;
    var slot = Math.floor(chn / 24);
    usbIn[slot][9 + (mfChn * 2)] = (usbIn[slot][9 + (mfChn * 2)] & 0xcf) + (0x20 >> val);
};
var setSslStatus = function(absChn) {
    console.log("Simulator Bank Switch: " + absChn);
    var chn = Math.floor(absChn % 24);
    var slot = Math.floor(absChn / 24);
    usbIn[slot][9 + (chn * 2)] = (usbIn[slot][9 + (chn * 2)] & 0xf3) + 0x4;
};


// **** **** **** CHECK IF JSON FORMAT **** **** **** 
function isJsonString(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}