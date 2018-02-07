var midi = require('midi');

module.exports = Hui;

function Hui(inCnt, outCnt) {
    var self = this;
    var HUIin = [];
    var HUIinMute = [];
    var input = [];
    var output = [];

    for (var n = 0; n < 4; n++) {
        for (var i = 0; i < 8; i++) {
            HUIin[n] = [];
            HUIin[n][i] = 0;
            HUIinMute[n] = [];
            HUIinMute[n][i] = 0;
        }
        input[n] = new midi.input();
        output[n] = new midi.output();
        input[n].openVirtualPort("AE HUI in " + (n + 1));
        console.log("Opening midi input port " + n)
        output[n].openVirtualPort("AE HUI out " + (n + 1));
        console.log("Opening midi output port " + n)
    }
    // Configure callbacks.
    input[0].on('message', function(deltaTime, message) { newDAWdata(0, message); });
    input[1].on('message', function(deltaTime, message) { newDAWdata(1, message); });
    input[2].on('message', function(deltaTime, message) { newDAWdata(2, message); });
    input[3].on('message', function(deltaTime, message) { newDAWdata(3, message); });

    var ledRegion = 0;

    var chnRegion;

    function newDAWdata(HUIport, message) {
        var sysEx = message[0];
        var region = message[1] & 0x0F;
        var byteNo = (message[1] & 0x20) >> 5;
        var chn = (message[1] & 0x07);

        console.log("mtc: " + message[0] + ", " + message[0] + ", " + message[0]);

        if (sysEx == 0xb0 && region < 0x8) {
            if (!byteNo) {
                HUIin[HUIport][chn] = (message[2] & 0xFE) << 3;
            } else {
                HUIin[HUIport][chn] += ((message[2] & 0x60) >> 5);
                var callback = {
                        "port": HUIport,
                        "chn": chn,
                        "value": HUIin[HUIport][chn]
                    }
                    //    self.emit("fader", callback);
            }
        }
        if (sysEx == 0xb0 && region == 0x0c) {
            if (!byteNo) {
                ledRegion = message[2];
                chnRegion = ledRegion;
            } else {
                var led = message[2] >> 5; // 0,1,2,3  2 is lit, 0 is off
                var id = message[2] & 0x0f;
                // id=2 is mute
                if (id == 2) {
                    if (led == 0) {
                        // unmute
                        console.log("unmute chn " + chnRegion);
                        HUIinMute[HUIport][chnRegion] = 0;
                    } else {
                        // mute
                        console.log("mute chn " + chnRegion);
                        HUIinMute[HUIport][chnRegion] = 1;
                    }
                    var callback = {
                            "port": HUIport,
                            "chn": chnRegion,
                            "value": HUIinMute[HUIport][chnRegion]
                        }
                        //    self.emit("mute", callback);
                }
            }
        }

        if (sysEx == [0x90]) {
            output[HUIport].sendMessage([0x90, 0x00, 0x7f]);
        }
    }

    Hui.prototype.getValue = function(port, chn) {
        return HUIin[port][chn];
    }
    Hui.prototype.reset = function() {
        for (var n = 0; n < 4; n++) {
            for (var i = 0; i < 8; i++) {
                HUIin[n] = [];
                HUIin[n][i] = 0;
                HUIinMute[n] = [];
                HUIinMute[n][i] = 0;
            }
        }
    }



    /*
              // takes channels in full range. 0-95.
              function pushFaderEvent(chn, event)
              {
                var message = [3];
                message[0] = 0xB0;
                message[1] = 0x0F;
                message[2] = chn;
                output1.sendMessage(message);
                message[0] = 0xB0;
                message[1] = 0x2F;
                message[2] = event;
                output1.sendMessage(message);
              }

              // Short Events
              function pushShortEvent(byte1, byte2)
              {
                var message = [3];
                message[0] = 0xB0;
                message[1] = byte1;
                message[2] = byte2;
                output1.sendMessage(message);
              }
              // Region Events
              function pushRegionEvent(region, id)
              {
                var message = [3];
                message[0] = 0xB0;
                message[1] = 0x0F;
                message[2] = region;
                output1.sendMessage(message);
                message[0] = 0xB0;
                message[1] = 0x2F;
                message[2] = 0x40+id;
                output1.sendMessage(message);
              }
              function pushFaderPosition(chn, level)
              {
                var message = [3];
                var lobyte  = (( level<<4 ) & 0x70); // 3 lsbits into b6,b5,b4 of lobyte
                var hibyte  = (( level>>3 ) & 0x7F); // 7 msbits into <b6..b0> of hibyte
                message[0] = 0xB0;
                message[1] = 0x00+chn;
                message[2] = hibyte;
                output1.sendMessage(message);

                message[0] = 0xB0;
                message[1] = 0x20+chn;
                message[2] = lobyte >> 1;
                output1.sendMessage(message);
              }

              function heartbeat()
              {
                var message = [3];
                message[0] = 0x90;
                message[1] = 0x00;
                message[2] = 0x7f;
                output1.sendMessage(message);
                output2.sendMessage(message);
              };

    */
}