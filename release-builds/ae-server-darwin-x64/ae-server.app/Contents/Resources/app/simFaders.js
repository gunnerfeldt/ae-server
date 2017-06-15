var sslFaders = new function() {
    var self = this;
    var statusSwitch = -1;

    this.init = function() {

        var faderBanksDiv = document.createElement('div');
        var faderBanks = document.createElement('canvas');

        faderBanksDiv.id = "faderBanksDiv";
        faderBanksDiv.style.width = "986px";
        faderBanksDiv.style.height = "162px";
        faderBanksDiv.style.zIndex = "2";

        faderBanks.id = "faderBanks";
        faderBanks.style.display = "inline-block";
        faderBanks.style.position = "absolute";
        faderBanks.style.left = "0px";
        faderBanks.style.top = "0px";
        faderBanks.style.zIndex = "4";
        faderBanks.setAttribute('width', 986);
        faderBanks.setAttribute('height', 162);

        faderBanksDiv.appendChild(faderBanks);
        document.getElementById("autoFaders").appendChild(faderBanksDiv);

        knobWhite.src = './img/knobWhite.png';
        knobWhite.onload = function() {
            for (var i = 0; i < 48; i++) {
                self.clearFaderStrip(i);
                self.setVcaLevel(i, 0);
                self.makeStatusButton(i, 0);
                self.setFaderLevel(i, 0);
                self.setStatus(i, 0);
            }
            self.setFaderNumbers();
        }


        document.getElementById("faderBanks").addEventListener('mousedown', function(e) {
            self.mouseTarget(e);
        }, false);
        document.addEventListener('mousemove', function(e) {
            e.stopPropagation();
            self.drag(e);
        }, false);
        document.addEventListener('mouseup', function(e) {
            self.dragStop();
        }, false);
        document.addEventListener('mouseleave', function(e) {
            self.dragStop();
        }, false);
    }


    // fader event handlers
    this.mouseTarget = function(e) {
        var bank = Math.floor((e.pageX - 1) / 164);
        var chn = Math.floor(((e.pageX - 4) - (bank * 164)) / 20) + (bank * 8) + 1;
        var xPos = (e.pageX - 4) - (bank * 164) - ((chn % 8) * 20) + 21;
        var yOffset = self.offsetTop(document.getElementById("faderBanks"));

        // fader
        var yLevel = 130 - (Math.round(properties.state.faderLevel[chn - 1] / 9.1));
        if (((e.pageY - yOffset) > yLevel) && ((e.pageY - yOffset) < (yLevel + 26))) {
            properties.state.guiFaderTouch = chn - 1;
            properties.state.yLevelStart = (e.pageY - yOffset);
        }

        if (((e.pageY - yOffset) > 38) && ((e.pageY - yOffset) < 54)) {
            if (xPos > 14) {
                var slot = Math.floor((chn - 1) / 24);
                var id = Math.floor((chn - 1) % 24);
                properties.inBuf[slot][9 + (id * 2)] += 0x04;
                statusSwitch = (chn - 1);
            }
        }


    }

    this.offsetTop = function(el) {
        var rect = el.getBoundingClientRect();
        var yOffset = rect.top;
        return yOffset;
    }

    this.drag = function(e) {
        var chn = properties.state.guiFaderTouch;
        if (chn != -1) {
            var yOffset = self.offsetTop(document.getElementById("faderBanks"));
            var travel = properties.state.yLevelStart - (e.pageY - yOffset);
            var level = properties.state.faderLevel[chn] + (Math.round(travel * 9.1));
            if (level < 0) level = 0;
            if (level > 1023) level = 1023;
            self.clearFaderStrip(chn);
            self.setVcaLevel(chn, properties.state.vcaLevel[chn]);
            self.makeStatusButton(chn);
            self.setFaderLevel(chn, level);
            properties.state.faderLevel[chn] = level;
            properties.state.yLevelStart = (e.pageY - yOffset);

            // load buffer
            var slot = Math.floor(chn / 24);
            var id = Math.floor(chn % 24);
            properties.inBuf[slot][8 + (id * 2)] = level & 0xff;
            properties.inBuf[slot][9 + (id * 2)] = (properties.inBuf[slot][9 + (id * 2)] & 0xFC) + ((level >> 8) & 3);
        }
    }

    this.dragStop = function() {
        if (properties.state.guiFaderTouch != -1) {
            properties.state.guiFaderTouch = -1;
        }
        if (statusSwitch > -1) {
            var slot = Math.floor((statusSwitch) / 24);
            var id = Math.floor((statusSwitch) % 24);
            properties.inBuf[slot][9 + (id * 2)] += 0x08;
            statusSwitch = -1;
        }

    }


    // fader bank controls

    this.update = function(chn) {
        if (chn > 87) console.log("mf");
        self.clearFaderStrip(chn);
        self.setVcaLevel(chn, properties.state.vcaLevel[chn]);
        self.makeStatusButton(chn);
        self.setFaderLevel(chn, properties.state.faderLevel[chn]);
    }

    this.clearFaderStrip = function(chn) {
        if (chn > -1 && chn < 48) {
            var bankTmp = Math.floor(chn / 8);
            var faderBanks = document.getElementById("faderBanks");
            var xpos = (chn * 20) + (bankTmp * 4) + 4;
            var ctx = faderBanks.getContext('2d');
            ctx.clearRect(xpos, 22, 16, 150);
            ctx.fillStyle = "#222";
            ctx.beginPath();
            ctx.fillRect(xpos + 7, 34, 2, 116);
        }
    }

    this.setFaderLevel = function(chn, level) {
        if (chn > -1 && chn < 48) {
            var bankTmp = Math.floor(chn / 8);
            var faderBanks = document.getElementById("faderBanks");
            var pos = 136 - (Math.round((level / 9.1) + 1));
            var xpos = (chn * 20) + (bankTmp * 4) + 2;
            var ctx = faderBanks.getContext('2d');
            ctx.drawImage(knobWhite, 4 + xpos, pos);
        }
    }

    this.setVcaLevel = function(chn, level) {
        if (chn > -1 && chn < 48) {
            var bankTmp = Math.floor(chn / 8);
            var faderBanks = document.getElementById("faderBanks");
            var pos = 136 - (Math.round((level / 9.1) + 1));
            var xpos = (chn * 20) + (bankTmp * 4) + 2;
            var ctx = faderBanks.getContext('2d');
            ctx.fillStyle = "#f00";
            ctx.beginPath();
            ctx.fillRect(xpos + 9, 12 + pos, 2, 138 - pos);
            ctx.fillRect(xpos + 2, 11 + pos, 16, 2);
        }
    }

    this.setStatus = function(chn, status) {
        if (chn > -1 && chn < 96) {
            var bankPage = Math.floor(chn / 48);
            var faderBankOffset = chn - (bankPage * 48);
            var bankTmp = Math.floor(faderBankOffset / 8);

            if (bankPage === 0) {
                var faderBanks = document.getElementById("faderBanks");
                var ctx = faderBanks.getContext('2d');
                var xpos = (faderBankOffset * 20) + (bankTmp * 4) + 3;
                ctx.fillStyle = statusColor[status];
                ctx.beginPath();
                ctx.fillRect(xpos, 20, 18, 2);
                ctx.stroke();
            }
        }
    }

    this.setFaderNumbers = function() {
        var faderBanks = document.getElementById("faderBanks");
        var ctx = faderBanks.getContext('2d');
        ctx.clearRect(0, 0, 1000, 18);
        for (var i = 0; i < 48; i++) {
            var no = (properties.state.bankPage * 48) + i + 1;
            var bankTmp = Math.floor(i / 8);
            var xpos = (i * 20) + (bankTmp * 4) + 12;
            ctx.font = "900 13px Arial";
            ctx.fillStyle = "#999";
            ctx.textAlign = "center";
            ctx.fillText("" + no + "", xpos, 15);
            ctx.stroke();
        }
    }

    this.makeStatusButton = function(chn) {
        if (chn > -1 && chn < 96) {
            var bankPage = Math.floor(chn / 48);
            var faderBankOffset = chn - (bankPage * 48);
            var bankTmp = Math.floor(faderBankOffset / 8);

            if (bankPage === 0) {
                var faderBanks = document.getElementById("faderBanks");
                var ctx = faderBanks.getContext('2d');
                var xpos = (faderBankOffset * 20) + (bankTmp * 4) + 18;
                ctx.fillStyle = "#bbb";
                ctx.beginPath();
                ctx.fillRect(xpos, 40, 6, 12);
                ctx.stroke();
            }
        }
    }


}