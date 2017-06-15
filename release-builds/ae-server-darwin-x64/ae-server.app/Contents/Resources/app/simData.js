    var statusColor = [
        "#444",
        "#5DA014",
        "#ffcc00",
        "#DB3838"
    ];
    var statusTextColor = [
        "#ffcc00",
        "#444",
        "#444",
        "#ffcc00"
    ];
    var statusText = [
        "MAN",
        "AUTO",
        "TOUCH",
        "WRITE"
    ];

    var knobClasses = [
        "knobWhite",
        "knobRed",
        "knobGray"
    ];

    var properties = {
        state: {
            bank: 0,
            cBank: 11,
            bankPage: 0,
            vcaLevel: [],
            faderLevel: [],
            status: [],
            guiFaderTouch: -1,
            yLevelStart: 0
        },
        inBuf: [
            [],
            [],
            [],
            []
        ],
        mtc: {
            qFrame: 0,
            frame: 0,
            sec: 0,
            min: 0,
            hour: 0,
            fps: 2,
            fpsFrames: [24, 25, 30, 30],
            run: false,
            long: 0
        }
    }

    var knobWhite = new Image();
    var tickTimer;
    var mtcDisplay;


    for (var i = 0; i < 96; i++) {
        properties.state.vcaLevel[i] = 0;
        properties.state.faderLevel[i] = 0;
        properties.state.status[i] = 0;
    }


    for (var slot = 0; slot < 4; slot++) {
        for (var id = 0; id < 64; id++) {
            properties.inBuf[slot][id] = 0;
        }
        properties.inBuf[slot][1] = slot;
    }

    function loadSprite(src, callback) {
        var sprite = new Image();
        sprite.onload = callback;
        sprite.src = src;
        return sprite;
    }

    var playButtons = [];
    playButtons[0] = 'img/stop.png';
    playButtons[1] = 'img/play.png';
    playButtons[2] = 'img/pause.png';

    function parser(outBuf) {
        // parse 64 byte array
        var qFrame = outBuf[1] & 3;
        for (var i = 0; i < 24; i++) {
            var id = (qFrame * 24) + i;
            var bank = Math.floor(id / 8);
            var vca = outBuf[8 + (i * 2)] + ((outBuf[9 + (i * 2)] & 3) << 8);

            if (bank == properties.state.cBank) {
                //    console.log(outBuf[9 + (i * 2)])
                var idChange = checkBit(outBuf[9 + (i * 2)], 0x10);
                var blink = checkBit(outBuf[9 + (i * 2)], 0x20);
            }
            // blink
            if (blink) {
                var ind = 9 + (i * 2);
                //    console.log("blink array[" + qFrame + "][" + ind + "]");
                // blink sim displays
                mf08.blink(id);
            }
            // id change
            if (idChange) {
                var ind = 8 + (i * 2);
                // update sim displays
                mf08.setID(id, outBuf[ind]);
            }
            // fader level
            else if (properties.state.vcaLevel[id] != vca) {
                properties.state.vcaLevel[id] = vca;

                if (bank == properties.state.cBank)
                    mf08.setFader(id); // Does nothing
                else
                    sslFaders.update(id);
            }
            // status change
            var status = ((outBuf[9 + (i * 2)] & 0xc) >> 2);
            if (properties.state.status[id] != status) {
                properties.state.status[id] = status;
                sslFaders.setStatus(id, status);
                if (bank == properties.state.cBank) mf08.setStatus(id, status);
            }
        }
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
        return byteArray;
    }