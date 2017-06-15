var mtc = new function() {
    var self = this;

    this.init = function() {
        document.getElementById("upperStrip").innerHTML = mtc.makeMtcDisplay();
        self.makeTransport();
        self.startTimer();
    }

    this.mtcDisplay = new function() {
        this.fps = function(value) {
            document.getElementById("FPS").innerHTML = value;
        };
        this.hour = function(value) {
            document.getElementById("HH1").innerHTML = Math.floor(value / 10);
            document.getElementById("HH0").innerHTML = value % 10;
        };
        this.min = function(value) {
            document.getElementById("MM1").innerHTML = Math.floor(value / 10);
            document.getElementById("MM0").innerHTML = value % 10;
            //     rotateAnimation("clockMin",value*(6));
        };
        this.sec = function(value) {
            document.getElementById("SS1").innerHTML = Math.floor(value / 10);
            document.getElementById("SS0").innerHTML = value % 10;
            //     rotateAnimation("clockSec",value*(6));
        };
        this.frame = function(value) {
            document.getElementById("FF1").innerHTML = Math.floor(value / 10);
            document.getElementById("FF0").innerHTML = value % 10;
            //     rotateAnimation("clockFrame",value*(360/(timeCode.fps)));
        };
    };

    this.startTimer = function() {
        mSec = Math.round((1000 / properties.mtc.fpsFrames[properties.mtc.fps]) / 4);
        tickTimer = setInterval(function() {
            self.tick();
        }, mSec);
        console.log("timer tick: " + mSec)
    }

    this.tick = function() {
        properties.mtc.qFrame++;
        properties.mtc.qFrame &= 3;

        if (properties.mtc.run) {
            if (properties.mtc.qFrame == 0) {
                properties.mtc.frame++;
                self.mtcDisplay.frame(properties.mtc.frame);
                self.mtcDisplay.fps(properties.mtc.fpsFrames[properties.mtc.fps]);
                if (properties.mtc.frame > (properties.mtc.fpsFrames[properties.mtc.fps] - 1)) {
                    properties.mtc.frame = 0;
                    properties.mtc.sec++;
                    self.mtcDisplay.sec(properties.mtc.sec);
                    if (properties.mtc.sec > 59) {
                        properties.mtc.sec = 0;
                        properties.mtc.min++;
                        self.mtcDisplay.min(properties.mtc.min);
                        if (properties.mtc.min > 59) {
                            properties.mtc.min = 0;
                            properties.mtc.hour++;
                            self.mtcDisplay.hour(properties.mtc.hour);
                            if (properties.mtc.hour > 23) {
                                properties.mtc.hour = 0;
                            }
                        }
                    }
                }
            }
            self.makeLong();
        }

        properties.inBuf[properties.mtc.qFrame][1] = properties.mtc.qFrame;
        properties.inBuf[properties.mtc.qFrame][1] += 0x8;
        if (properties.mtc.qFrame == 0) {
            if (properties.mtc.start) {
                properties.inBuf[0][1] += 0x10;
                properties.mtc.start = 0;
            }
            if (properties.mtc.stop) {
                properties.inBuf[0][1] += 0x20;
                properties.mtc.stop = 0;
            }
        }
        properties.inBuf[properties.mtc.qFrame][2] = properties.mtc.long & 0xFF;
        properties.inBuf[properties.mtc.qFrame][3] = (properties.mtc.long >> 8) & 0xFF;
        properties.inBuf[properties.mtc.qFrame][4] = (properties.mtc.long >> 16) & 0xFF;
        properties.inBuf[properties.mtc.qFrame][5] = (properties.mtc.long >> 24) & 0xFF;

        main.call({
            cmd: "buffer",
            inBuf: properties.inBuf[properties.mtc.qFrame]
        })

        for (var i = 0; i < 24; i++) {
            properties.inBuf[properties.mtc.qFrame][9 + (i * 2)] &= 0x3;
        }

        for (var i = 0; i < 8; i++) {
            var id = (properties.state.cBank * 8) + i;
            mf08.motorLoop(id);
        }
    }

    this.makeLong = function() {
        properties.mtc.long = properties.mtc.hour * 3600 * properties.mtc.fpsFrames[properties.mtc.fps];
        properties.mtc.long += properties.mtc.min * 60 * properties.mtc.fpsFrames[properties.mtc.fps];
        properties.mtc.long += properties.mtc.sec * properties.mtc.fpsFrames[properties.mtc.fps];
        properties.mtc.long += properties.mtc.frame;
    }


    this.makeMtcDisplay = function() {
        var html = '<div class="container" id="transport" style="left: 0; top: 0; width: 990px; height: 100%;">';
        html += '<div id="mtcPanel">';
        html += '<div class="AEtext" style="font-size: 14px; text-align: center; font-weight: 500; top: 4px; left: 0px; width: 58px; color: #FFCC00">FPS</div>';
        html += '<div class="AEtext" id="FPS" style="font-size: 20px; text-align: center; font-weight: 600; top: 20px; left: 0px; width: 58px; color: #FFCC00">25</div>';
        html += '<td id="mtcData"><table id="mtcCells">';
        html += '<tr>';
        html += '<td class="mtcDigit" id="HH1">0</td>';
        html += '<td class="mtcDigit"  id="HH0">0</td>';
        html += '<td class="separator">:</td>';
        html += '<td class="mtcDigit"  id="MM1">0</td>';
        html += '<td class="mtcDigit"  id="MM0">0</td>';
        html += '<td class="separator">:</td>';
        html += '<td class="mtcDigit"  id="SS1">0</td>';
        html += '<td class="mtcDigit"  id="SS0">0</td>';
        html += '<td class="separator">:</td>';
        html += '<td class="mtcDigit"  id="FF1">0</td>';
        html += '<td class="mtcDigit"  id="FF0">0</td>';
        html += '</tr>';
        html += '</table></td>';
        html += '</div>';
        html += '</div>';
        return html;
    }

    this.makeTransport = function() {
        var div = document.getElementById("upperStrip");
        var playButton = document.createElement("div");

        playButton.className = "transportButton";
        playButton.style.width = "90px";
        playButton.style.left = "270px";

        var playSymbol1 = document.createElement("img");
        playSymbol1.id = "stop";
        playSymbol1.style.position = "absolute";
        playSymbol1.style.left = "6px";
        playSymbol1.style.top = "6px";
        playSymbol1.src = playButtons[0];
        playSymbol1.addEventListener('click', function(e) {
            document.getElementById("play").imgId = 0;
            document.getElementById("play").src = playButtons[1];
            properties.mtc.frame = 0;
            properties.mtc.sec = 0;
            properties.mtc.min = 0;
            properties.mtc.hour = 0;

            self.mtcDisplay.frame(properties.mtc.frame);
            self.mtcDisplay.sec(properties.mtc.sec);
            self.mtcDisplay.min(properties.mtc.min);
            self.mtcDisplay.hour(properties.mtc.hour);
            properties.mtc.run = false;
            properties.mtc.stop = true;
            self.makeLong();
        })

        var playSymbol2 = document.createElement("img");
        playSymbol2.id = "play";
        playSymbol2.style.position = "absolute";
        playSymbol2.style.left = "50px";
        playSymbol2.style.top = "6px";
        playSymbol2.src = playButtons[1];
        playSymbol2.imgId = 0;
        playSymbol2.addEventListener('click', function(e) {
            this.imgId = !this.imgId;
            this.src = playButtons[(this.imgId + 1)];
            properties.mtc.run = (this.imgId == 1);
            if (properties.mtc.run) properties.mtc.start = true;
            else properties.mtc.stop = true;
        })

        playButton.appendChild(playSymbol1);
        playButton.appendChild(playSymbol2);
        div.appendChild(playButton);
    }
}