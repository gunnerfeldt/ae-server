var ledPalatte = new Image();
var mf08panel = new Image();
var mf08knob = new Image();
var mf08mute = new Image();
var mf08auto = new Image();
var mf08touch = new Image();
var mf08write = new Image();
ledPalatte.src = "img/led/ledPalette.png";
mf08panel.src = "img/led/mf08panel.png";
mf08knob.src = "img/led/mf08knob.png";
mf08mute.src = "img/led/mf08mute.png";
mf08auto.src = "img/led/mf08auto.png";
mf08touch.src = "img/led/mf08touch.png";
mf08write.src = "img/led/mf08write.png";

var FILTER = 4;

function MF08() {

    this.bufferPos = [];
    this.self = this;
    this.bank = properties.state.cBank;
    this.on = function(name, callback) {
        events.addListener(name, callback);
    };
}

MF08.prototype.startFetchLoop = function() {
    setInterval(function() {
        parseObj({
            "type": "fetch"
        });
    }, 30)
}

MF08.prototype.setFader = function(id) {}

MF08.prototype.setStatus = function(id, status) {
    var autoLed = document.getElementById("autoLed" + id);
    var touchLed = document.getElementById("touchLed" + id);
    var writeLed = document.getElementById("writeLed" + id);

    if (status == 0) {
        autoLed.style.backgroundColor = "#070";
        touchLed.style.backgroundColor = "#830";
        writeLed.style.backgroundColor = "#700";
    } else if (status == 1) {
        autoLed.style.backgroundColor = "#5f5";
        touchLed.style.backgroundColor = "#830";
        writeLed.style.backgroundColor = "#700";
    } else if (status == 2) {
        autoLed.style.backgroundColor = "#5f5";
        touchLed.style.backgroundColor = "#fd2";
        writeLed.style.backgroundColor = "#700";
    } else if (status == 3) {
        autoLed.style.backgroundColor = "#5f5";
        touchLed.style.backgroundColor = "#830";
        writeLed.style.backgroundColor = "#f33";
    }
}

MF08.prototype.setID = function(id, ledID) {
    var display = document.getElementById("display" + id);
    display.aeDisplayId = ledID;
    setMF08Display(display);
}

MF08.prototype.blink = function(id) {
    var display = document.getElementById("display" + id);
    var i = 8;

    function toggle() {
        display.toggle = i & 1;
        setMF08Display(display);
        setTimeout(function() {
            i--;
            if (i > 0) toggle();
        }, 300)
    }
    toggle();
}

MF08.prototype.motorLoop = function(id) {
    var knob = document.getElementById("knob" + id);

    if (knob.aeTouch || (properties.state.status[id] == 3)) {
        properties.state.vcaLevel[id] = Math.round((parseInt(knob.style.bottom)) * (1023 / knob.aeMax));
    } else {
        var val = properties.state.vcaLevel[id];
        knob.slow = ((knob.slow * (FILTER - 1)) + val) / FILTER;
        var pos = Math.round(knob.slow * (knob.aeMax / 1023));
        knob.style.bottom = pos + "px";
        parseObj({
            "type": "move",
            "chnId": knob.aeId,
            "pos": val
        });
    }
}

MF08.prototype.update = function(data) {
    //    console.log("ststus "+data.fader[0].status);
    for (var i = 0; i < 8; i++) {
        var knob = document.getElementById("knob" + i);
        var oldPos = parseInt(knob.style.bottom);
        var pos = Math.round(data.fader[i].pos * (knob.aeMax / 1023));
        var pos = Math.round((pos + oldPos) / 2);
        if (!knob.aeTouch) knob.style.bottom = pos + "px";

        var panel = document.getElementById("faderPanel" + i);
        if (panel.aeStatus != data.fader[i].status) {
            panel.aeStatus = data.fader[i].status;
            setMF08Status(panel);
        }
        var display = document.getElementById("display" + i);
        if (display.aeDisplayId != ((data.bank * 8) + i)) {
            display.aeDisplayId = ((data.bank * 8) + i);
            console.log("new digits=" + display.aeDisplayId);
            setMF08Display(display);
        }
    }
}

MF08.prototype.createMfPanel = function(w) {

    // w = 890, h = 534
    var guiApp = document.getElementById('guiApp');
    var faderContainer = document.createElement('div');
    faderContainer.id = "MF08Wrapper";
    faderContainer.aeKnobTouchId = -1;
    faderContainer.aeBank = 0;
    faderContainer.style.top = "16px";
    faderContainer.style.right = "14px";
    faderContainer.style.width = (w + 16) + "px";
    faderContainer.style.height = (h + 2) + "px";
    faderContainer.style.position = "absolute";

    var h = w / 1.6667;

    for (var i = (this.bank * 8); i < ((this.bank * 8) + 8); i++) {
        var faderPanel = document.createElement('div');
        var knobTrack = document.createElement('div');
        var knobSlot = document.createElement('div');
        var knob = document.createElement('div');
        var mute = document.createElement('canvas');
        var auto = document.createElement('div');
        var touch = document.createElement('div');
        var write = document.createElement('div');
        var autoSw = document.createElement('div');
        var touchSw = document.createElement('div');
        var writeSw = document.createElement('div');
        var autoLed = document.createElement('div');
        var touchLed = document.createElement('div');
        var writeLed = document.createElement('div');
        var display = document.createElement('canvas');

        // panel
        faderPanel.id = "faderPanel" + i;
        faderPanel.style.position = "relative";
        faderPanel.style.display = "inline-block";
        faderPanel.style.width = Math.floor(w / 8) + "px";
        faderPanel.style.height = h + "px";
        //     faderPanel.style.backgroundImage = "url(" + mf08panel.src + ")";
        faderPanel.style.backgroundColor = "#323232";
        faderPanel.style.border = "2px #ccc";
        faderPanel.style.margin = "1px";
        faderPanel.aeStatus = 0;
        faderPanel.aeId = i;

        // knob track
        knobTrack.id = "knobTrack" + i;
        knobTrack.style.position = "absolute";
        knobTrack.style.width = "" + (w / 14.8333) + "px";
        knobTrack.style.height = (h - (h / 6.7)) + "px";
        knobTrack.style.top = "" + (h / 12.5) + "px";
        knobTrack.style.right = "0px";
        knobTrack.style.backgroundColor = "#323232";
        knobTrack.style.border = "2px #ccc";
        // knob slot
        knobSlot.id = "knobSlot" + i;
        knobSlot.style.position = "absolute";
        knobSlot.style.width = "4px";
        knobSlot.style.height = (h - (h / 3.6)) + "px";
        knobSlot.style.top = "" + (h / 13) + "px";
        knobSlot.style.left = ((w / 30) - 2) + "px";
        knobSlot.style.backgroundColor = "#000";
        knobTrack.appendChild(knobSlot);

        // knob
        knob.id = "knob" + i;
        knob.aeId = i;
        knob.aeTouch = 0;
        knob.aePos = 0;
        knob.aeMin = 0;
        knob.aeMax = h - (h / 3.33);
        knob.slow = 0;
        knob.style.position = "absolute";
        knob.style.width = "" + (w / 16) + "px";
        knob.style.height = "" + (h / 6.675) + "px";
        knob.style.bottom = "0px";
        knob.style.left = "" + (w / 110) + "px";
        knob.style.backgroundImage = "url(" + mf08knob.src + ")";
        knob.style.backgroundSize = (w / 16) + "px " + (h / 6.675) + "px";
        knob.style.border = "none";

        // touch events
        knob.addEventListener("touchstart", (function(e) {
            e.preventDefault();
            var touch = e.targetTouches[0]
            this.aeTouch = 1;
            this.aeTouchId = e.changedTouches[0].identifier;
            this.aePos = touch.pageY;
            this.aeKnobPos = parseInt(this.style.bottom);
            parseObj({
                "type": "touch",
                "chnId": this.aeId,
                "touch": true
            });
            moveKnob(e, this, this.aeKnobPos + (this.aePos - e.pageY));
        }));
        knob.addEventListener("touchmove", (function(e) {
            var yPos = this.aeKnobPos + (this.aePos - e.targetTouches[0].pageY);
            moveKnob(e, this, yPos);
        }));
        knob.addEventListener("touchend", (function(e) {
            e.preventDefault();
            this.aeTouch = 0;
            parseObj({
                "type": "touch",
                "chnId": this.aeId,
                "touch": false
            });
        }));

        // mouse events
        knob.addEventListener("mousedown", (function(e) {
            if (e.stopPropagation) e.stopPropagation();
            if (e.preventDefault) e.preventDefault();
            e.cancelBubble = true;
            e.returnValue = false;
            this.aeTouch = 1;
            this.aePos = e.pageY;
            this.aeKnobPos = parseInt(this.style.bottom);
            document.getElementById("MF08Wrapper").aeKnobTouchId = this.aeId;
            parseObj({
                "type": "touch",
                "chnId": this.aeId,
                "touch": true
            });
            moveKnob(e, this, this.aeKnobPos + (this.aePos - e.pageY));
        }));

        // mute
        mute.id = "mute" + i;
        mute.style.position = "absolute";
        mute.style.width = "60px";
        mute.style.height = "80px";
        mute.style.top = "26px";
        mute.style.left = "0px";
        mute.style.border = "none";
        mute.aeId = i;
        mute.addEventListener("click", function(e) {
            parseObj({
                "type": "mute",
                "chnId": this.aeId
            });
        })
        mute.addEventListener("touchstart", function(e) {
            e.preventDefault();
            parseObj({
                "type": "mute",
                "chnId": this.aeId
            });
        })

        // leds & buttons
        auto.id = "auto" + i;
        auto.style.position = "absolute";
        auto.style.width = (w / 18.8333) + "px";
        auto.style.height = (h / 6.675) + "px";
        auto.style.top = (h / 1.3185) + "px";
        auto.style.left = "0px";
        auto.style.border = "none";
        auto.aeId = i;
        auto.appendChild(makeStSw(autoSw, w, i, "auto"));
        auto.appendChild(makeStLed(autoLed, w, i, "auto"));

        auto.addEventListener("click", function(e) {
            parseObj({
                "type": "statusSwitch",
                "chnId": this.aeId,
                "status": 0x1
            });

        })
        auto.addEventListener("touchstart", function(e) {
            e.preventDefault();
            parseObj({
                "type": "statusSwitch",
                "chnId": this.aeId,
                "status": 0x1
            });
        })

        touch.id = "touch" + i;
        touch.style.position = "absolute";
        touch.style.width = (w / 18.8333) + "px";
        touch.style.height = (h / 6.675) + "px";
        touch.style.top = (h / 2.8864) + "px";
        touch.style.left = "0px";
        touch.style.border = "none";
        touch.aeId = i;
        touch.appendChild(makeStSw(touchSw, w, i, "touch"));
        touch.appendChild(makeStLed(touchLed, w, i, "touch"));
        touch.addEventListener("click", function(e) {
            parseObj({
                "type": "statusSwitch",
                "chnId": this.aeId,
                "status": 0x2
            });
        })
        touch.addEventListener("touchstart", function(e) {
            e.preventDefault();
            parseObj({
                "type": "statusSwitch",
                "chnId": this.aeId,
                "status": 0x2
            });
        })

        write.id = "write" + i;
        write.style.position = "absolute";
        write.style.width = (w / 18.8333) + "px";
        write.style.height = (h / 6.675) + "px";
        write.style.top = (h / 5.0857) + "px";
        write.style.left = "0px";
        write.style.border = "none";
        write.aeId = i;
        write.appendChild(makeStSw(writeSw, w, i, "write"));
        write.appendChild(makeStLed(writeLed, w, i, "write"));
        write.addEventListener("click", function(e) {
            parseObj({
                "type": "statusSwitch",
                "chnId": this.aeId,
                "status": 0x3
            });
        })
        write.addEventListener("touchstart", function(e) {
            e.preventDefault();
            parseObj({
                "type": "statusSwitch",
                "chnId": this.aeId,
                "status": 0x3
            });
        })

        // display
        display.id = "display" + i;
        display.style.position = "absolute";
        display.style.width = (w / 19.3478) + "px";
        display.style.height = (h / 17.8) + "px";
        display.style.top = (h / 1.6739) + "px";
        display.style.left = (w / 100) + "px";
        display.style.border = "none";
        display.aeDisplayId = i;
        display.toggle = 1;

        setMF08Display(display);

        knobTrack.appendChild(knob);
        faderPanel.appendChild(knobTrack);
        //       faderPanel.appendChild(mute);
        faderPanel.appendChild(auto);
        faderPanel.appendChild(touch);
        faderPanel.appendChild(write);
        faderPanel.appendChild(display);
        faderContainer.appendChild(faderPanel);
    }

    guiApp.addEventListener("mousemove", (function(e) {

        if (faderContainer.aeKnobTouchId > -1) {
            var knob = document.getElementById("knob" + faderContainer.aeKnobTouchId);
            moveKnob(e, knob, knob.aeKnobPos + (knob.aePos - e.pageY));
        }
    }));
    guiApp.addEventListener("mouseup", (function(e) {
        if (faderContainer.aeKnobTouchId > -1) {
            parseObj({
                "type": "touch",
                "chnId": faderContainer.aeKnobTouchId,
                "touch": false
            });
            document.getElementById("knob" + faderContainer.aeKnobTouchId).aeTouch = 0;
            faderContainer.aeKnobTouchId = -1;
        }
    }));
    return faderContainer;
}

function calcId(x) {
    var appX = document.getElementById("app");
    var channelWidth = parseInt(document.getElementById("faderPanel0").style.width) + 1;
    var id = Math.floor((x - appX.offsetLeft - 10) / channelWidth);
    return id;
}

function moveKnob(e, knob, yPos) {

    if (e.stopPropagation) e.stopPropagation();
    if (e.preventDefault) e.preventDefault();
    e.cancelBubble = true;
    e.returnValue = false;

    if (yPos < knob.aeMin) yPos = knob.aeMin;
    if (yPos > knob.aeMax) yPos = knob.aeMax;
    knob.style.bottom = yPos + "px";

    var scaledPos = Math.round(yPos * (1023 / knob.aeMax));
    parseObj({
        "type": "move",
        "chnId": knob.aeId,
        "pos": scaledPos
    });
}

function setMF08Status(panel) {
    var auto = document.getElementById("auto" + panel.aeId);
    var touch = document.getElementById("touch" + panel.aeId);
    var write = document.getElementById("write" + panel.aeId);
    if (panel.aeStatus == 0) {
        auto.style.backgroundImage = null;
        touch.style.backgroundImage = null;
        write.style.backgroundImage = null;
    } else if (panel.aeStatus == 1) {
        auto.style.backgroundImage = "url(" + mf08auto.src + ")";
        touch.style.backgroundImage = null;
        write.style.backgroundImage = null;
    } else if (panel.aeStatus == 2) {
        auto.style.backgroundImage = "url(" + mf08auto.src + ")";
        touch.style.backgroundImage = "url(" + mf08touch.src + ")";
        write.style.backgroundImage = null;
    } else if (panel.aeStatus == 3) {
        auto.style.backgroundImage = "url(" + mf08auto.src + ")";
        touch.style.backgroundImage = null;
        write.style.backgroundImage = "url(" + mf08write.src + ")";
    }
}

function setMF08Display(display) {
    var ctx = display.getContext("2d");
    var dig1place = 8;
    var dig2place = 164;
    var dig1;
    var dig2;

    if (display.toggle == 0) {
        dig1 = 16;
        dig2 = 16;
    } else {
        dig1 = Math.floor((display.aeDisplayId + 1) / 10);
        dig2 = Math.floor((display.aeDisplayId + 1) % 10);
    }

    if (dig1 == 0) dig1 = 16;

    var dig1Pick = dig1 * 34;
    var dig2Pick = dig2 * 34;
    ctx.drawImage(ledPalatte, dig1Pick, 0, 34, 50, dig1place, 0, 148, 150);
    ctx.drawImage(ledPalatte, dig2Pick, 0, 34, 50, dig2place, 0, 148, 150);
}

function makeStSw(div, w, i, type) {
    var wh = w / 50;
    div.id = type + "Sw" + i;
    div.style.position = "absolute";
    div.style.width = (wh) + "px";
    div.style.height = (wh) + "px";
    div.style.top = (w / 20) + "px";
    div.style.left = (w / 41) + "px";
    div.style.border = "none";
    div.style.borderRadius = "50%"
    div.style.backgroundColor = "#000";
    div.aeId = i;
    return div;
}

function makeStLed(div, w, i, type) {
    var wh = w / 100;
    div.id = type + "Led" + i;
    div.style.position = "absolute";
    div.style.width = (wh) + "px";
    div.style.height = (wh) + "px";
    div.style.top = (w / 50) + "px";
    div.style.left = (w / 34.5) + "px";
    div.style.border = "none";
    div.style.borderRadius = "50%"
    if (type == "auto") div.style.backgroundColor = "#070";
    if (type == "touch") div.style.backgroundColor = "#830";
    if (type == "write") div.style.backgroundColor = "#700";
    div.aeId = i;
    return div;
}

function parseObj(e) {
    var slot = Math.floor(e.chnId / 24);
    var id = e.chnId % 24;
    if (e.type == "touch") {
        if (e.touch) properties.inBuf[slot][9 + (id * 2)] = setBit(properties.inBuf[slot][9 + (id * 2)], 0x10)
        else properties.inBuf[slot][9 + (id * 2)] = setBit(properties.inBuf[slot][9 + (id * 2)], 0x20)
    } else if (e.type == "move") {
        properties.inBuf[slot][8 + (id * 2)] = e.pos & 0xff;
        properties.inBuf[slot][9 + (id * 2)] = (properties.inBuf[slot][9 + (id * 2)] & 0xFC) + ((e.pos >> 8) & 0x3);
    } else if (e.type == "statusSwitch") {
        properties.inBuf[slot][9 + (id * 2)] = (properties.inBuf[slot][9 + (id * 2)] & 0xF3) + (e.status << 2);
    }
}