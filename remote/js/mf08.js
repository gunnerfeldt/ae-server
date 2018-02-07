var ledPalatte = new Image();
var mf08panel = new Image();
var mf08knob = new Image();
var mf08mute = new Image();
var autoOff = new Image();
var touchOff = new Image();
var writeOff = new Image();
var autoOn = new Image();
var touchOn = new Image();
var writeOn = new Image();
var dsplDb = new Image();
var dsplId = new Image();
ledPalatte.src = "img/led/ledPalette.png";
mf08panel.src = "img/touch/faderPanel.png";
mf08knob.src = "img/touch/whiteKnob.png";
mf08mute.src = "img/led/mf08mute.png";
autoOff.src = "img/touch/autoOff.png";
touchOff.src = "img/touch/touchOff.png";
writeOff.src = "img/touch/writeOff.png";
autoOn.src = "img/touch/autoOn.png";
touchOn.src = "img/touch/touchOn.png";
writeOn.src = "img/touch/writeOn.png";
dsplId.src = "img/touch/dsplId.png";
dsplDb.src = "img/touch/dsplDb.png";

var levels = [];

function MF08() {
    this.self = this;
    this.on = function(name, callback) {
        events.addListener(name, callback);
    };
    this.touchFaders = [];
    this.bank = 0;
    this.run = 0;
}
// Animation Loop
function animate() {
    if (properties.state.activeMode == "mf08") {
        requestAnimationFrame(animate);
        for (var i = 0; i < 8; i++) {
            var knob = document.getElementById("knob" + i);
            var knobPos = parseInt(knob.style.bottom);
            var yPos = (levels[i] + (knobPos * 3)) / 4;
            if (yPos < knob.aeMin) yPos = knob.aeMin;
            if (yPos > knob.aeMax) yPos = knob.aeMax;
            knob.style.bottom = yPos + "px";
            knob.ani.doAni();
            document.getElementById("auto" + i).ani.doAni();
            document.getElementById("touch" + i).ani.doAni();
            document.getElementById("write" + i).ani.doAni();
        }
    }
}

var ani = function(me) {
    var tick = -1;
    this.doAni = function(go) {
        if (go) {
            tick = 20;
            me.style.zIndex = 100;
        }
        if (tick >= 0) {
            var scale;
            if (!me.grow) scale = 1 + ((10 - Math.abs(10 - tick)) * me.growSize);
            else scale = 1 + ((Math.abs(10 - tick)) * me.growSize);

            var scaleStr = "scale(" + scale + "," + scale + ")";
            tick = tick - 1;
            me.style.transform = scaleStr;
            if (tick == -1 && me.grow) {
                me.style.zIndex = 1;
            }
        }
    }
    this.doAniGrow = function(go) {
        if (go) {
            tick = 10;
            me.style.zIndex = 100;
            me.grow = 1;
        }
    }
    this.doAniShrink = function(go) {
        if (go) {
            tick = 10;
            me.style.zIndex = 100;
            me.grow = 0;
        }
    }
}

/*
MF08.prototype.setActive = function(val) {
    this.active = val;
}
MF08.prototype.getActive = function() {
    return this.active;
}
*/

MF08.prototype.startFetchLoop = function() {
    setTimeout(function() {
        animate();
    }, 200)

    setInterval(function() {}, 30)
}

MF08.prototype.setBank = function(data) {
    this.bank = data.bank;
}

MF08.prototype.setStatus = function(data) {
    var bank = Math.floor(data.chn / 8);
    if (this.bank !== bank && bank !== 11) {
        return;
    }

    var ctrlBankID = (data.chn % 8);
    if (document.getElementById("faderPanel" + ctrlBankID)) {
        var panel = document.getElementById("faderPanel" + ctrlBankID);
        var knob = document.getElementById("knob" + ctrlBankID);
        if (data.status != 3 && !panel.latch) {
            knob.setLevel(panel.aePos);
        }
        panel.latch = 0;
        panel.aeStatus = data.status;
        setMF08Status(panel);
    }
}
MF08.prototype.setLevel = function(data) {
    if (data.chn < 88) return;
    var ctrlBankID = (data.chn % 8);
    if (document.getElementById("faderPanel" + ctrlBankID)) {
        var panel = document.getElementById("faderPanel" + ctrlBankID);
        var knob = document.getElementById("knob" + ctrlBankID);
        panel.aePos = data.status;
        var yPos = Math.round(data.status * (knob.aeMax / 1023));
        if (yPos < knob.aeMin) yPos = knob.aeMin;
        if (yPos > knob.aeMax) yPos = knob.aeMax;
        if (!knob.aeTouch && panel.aeStatus != 3) levels[ctrlBankID] = yPos;
    }
}
MF08.prototype.update = function(data) {
    //    console.log("ststus "+data.fader[0].status);
    for (var i = 0; i < 8; i++) {
        var knob = document.getElementById("knob" + i);
        var panel = document.getElementById("faderPanel" + i);
        panel.aePos = data.fader[88 + i].pos;
        var oldPos = parseInt(knob.style.bottom);
        var pos = Math.round(data.fader[88 + i].pos * (knob.aeMax / 1023));
        var pos = Math.round((pos + oldPos) / 2);
        if (!knob.aeTouch) knob.style.bottom = pos + "px";

        if (panel.aeStatus != data.fader[88 + i].status) {
            panel.aeStatus = data.fader[88 + i].status;
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

MF08.prototype.createMfPanel = function(w, h) {

    // w = 1010, h = 480
    var faderContainer = document.createElement('div');
    faderContainer.id = "defaultWrapper";
    faderContainer.aeKnobTouchId = -1;
    faderContainer.aeBank = 0;

    for (var i = 0; i < 8; i++) {
        var faderPanel = document.createElement('div');
        var knobTrack = document.createElement('div');
        var dspl = document.createElement('div');
        var knob = document.createElement('div');
        var mute = document.createElement('canvas');
        var auto = document.createElement('div');
        var touch = document.createElement('div');
        var write = document.createElement('div');
        var display = document.createElement('canvas');

        // panel
        faderPanel.id = "faderPanel" + i;
        faderPanel.style.position = "relative";
        faderPanel.style.display = "inline-block";
        faderPanel.style.width = Math.floor(w / 8) + "px";
        faderPanel.style.top = "60px";
        faderPanel.style.height = h + "px";
        faderPanel.style.backgroundImage = "url(" + mf08panel.src + ")";
        faderPanel.style.border = "0px #000";
        faderPanel.aeStatus = 0;
        faderPanel.aeId = i;
        faderPanel.aePos = 0;
        faderPanel.latch = 0;

        // knob track
        knobTrack.id = "knobTrack" + i;
        knobTrack.style.position = "absolute";
        knobTrack.style.width = "60px";
        knobTrack.style.height = (h - 3) + "px";
        knobTrack.style.top = "0px";
        knobTrack.style.right = "0px";
        knobTrack.style.backgroundColor = "none";
        knobTrack.style.border = "none";

        // display panel
        dspl.id = "dspl" + i;
        dspl.style.position = "absolute";
        dspl.style.width = "44px";
        dspl.style.height = "78px";
        dspl.style.top = "299px";
        dspl.style.left = "10px";
        dspl.style.backgroundImage = "url(" + dsplId.src + ")";
        dspl.style.border = "none";

        // knob
        knob.id = "knob" + i;
        knob.aeId = i;
        knob.aeTouch = 0;
        knob.aePos = 0;
        knob.aeMin = 0;
        knob.aeMax = h - 116;
        knob.style.position = "absolute";
        knob.style.width = "50px";
        knob.style.height = "100px";
        knob.style.bottom = "0px";
        knob.style.left = "4px";
        knob.style.backgroundImage = "url(" + mf08knob.src + ")";
        knob.style.border = "none";
        knob.growSize = 0.02;
        knob.grow = 1;
        knob.ani = new ani(knob);

        knob.setLevel = function(level) {
            var panel = document.getElementById("faderPanel" + this.aeId);
            this.aePos = level;
            var yPos = Math.round(level * (this.aeMax / 1023));
            if (yPos < this.aeMin) yPos = this.aeMin;
            if (yPos > this.aeMax) yPos = this.aeMax;
            levels[this.aeId] = yPos;
        }

        // touch events
        knob.addEventListener("touchstart", (function(e) {
            e.preventDefault();
            var touch = e.targetTouches[0]
            this.aeTouch = 1;
            this.aeTouchId = e.changedTouches[0].identifier;
            this.aePos = touch.pageY;
            this.aeKnobPos = parseInt(this.style.bottom);
            events.fire("change", {
                "type": "touch",
                "chnId": this.aeId,
                "touch": 0x01
            });
            moveKnob(e, this, this.aeKnobPos + (this.aePos - e.pageY));
            this.ani.doAniGrow(true);
        }));
        knob.addEventListener("touchmove", (function(e) {
            var yPos = this.aeKnobPos + (this.aePos - e.targetTouches[0].pageY);
            moveKnob(e, this, yPos);
        }));
        knob.addEventListener("touchend", (function(e) {
            e.preventDefault();
            this.aeTouch = 0;
            events.fire("change", {
                "type": "touch",
                "chnId": this.aeId,
                "touch": 0x10
            });
            var panel = document.getElementById("faderPanel" + this.aeId);
            if (panel.aeStatus !== 3) {
                this.setLevel(panel.aePos);
            }
            this.ani.doAniShrink(true);
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
            document.getElementById("defaultWrapper").aeKnobTouchId = this.aeId;
            events.fire("change", {
                "type": "touch",
                "chnId": this.aeId,
                "touch": 0x01
            });
            this.ani.doAniGrow(true);
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
            events.fire("change", {
                "type": "mute",
                "chnId": this.aeId
            });
        })
        mute.addEventListener("touchstart", function(e) {
                e.preventDefault();
                events.fire("change", {
                    "type": "mute",
                    "chnId": this.aeId
                });
            })
            // leds & buttons
        auto.id = "auto" + i;
        auto.style.position = "absolute";
        auto.style.width = "44px";
        auto.style.height = "100px";
        auto.style.top = "388px";
        auto.style.left = "10px";
        auto.style.border = "none";
        auto.aeId = i;
        auto.val = 0x1;
        auto.statusSwitch = new statusSwitch(auto);

        touch.id = "touch" + i;
        touch.style.position = "absolute";
        touch.style.width = "44px";
        touch.style.height = "100px";
        touch.style.top = "186px";
        touch.style.left = "10px";
        touch.style.border = "none";
        touch.aeId = i;
        touch.val = 0x2;
        touch.statusSwitch = new statusSwitch(touch);

        write.id = "write" + i;
        write.style.position = "absolute";
        write.style.width = "44px";
        write.style.height = "100px";
        write.style.top = "84px";
        write.style.left = "10px";
        write.style.border = "none";
        write.aeId = i;
        write.val = 0x3;
        write.statusSwitch = new statusSwitch(write);

        // display
        display.id = "display" + i;
        display.style.position = "absolute";
        display.style.width = "46px";
        display.style.height = "30px";
        display.style.top = "319px";
        display.style.left = "7px";
        display.style.border = "none";
        display.aeDisplayId = -1;

        knobTrack.appendChild(knob);
        faderPanel.appendChild(knobTrack);
        faderPanel.appendChild(dspl);
        faderPanel.appendChild(mute);
        faderPanel.appendChild(auto);
        faderPanel.appendChild(touch);
        faderPanel.appendChild(write);
        faderPanel.appendChild(display);

        faderContainer.appendChild(faderPanel);

    }

    faderContainer.addEventListener("mousemove", (function(e) {
        if (this.aeKnobTouchId > -1) {
            var knob = document.getElementById("knob" + this.aeKnobTouchId);
            moveKnob(e, knob, knob.aeKnobPos + (knob.aePos - e.pageY));
        }
    }));
    faderContainer.addEventListener("mouseup", (function(e) {

        if (this.aeKnobTouchId > -1) {
            events.fire("change", {
                "type": "touch",
                "chnId": this.aeKnobTouchId,
                "touch": 0x10
            });
            var panel = document.getElementById("faderPanel" + this.aeKnobTouchId);
            var knob = document.getElementById("knob" + this.aeKnobTouchId);
            knob.aeTouch = 0;
            if (panel.aeStatus !== 3) {
                knob.setLevel(panel.aePos);
            }
            knob.ani.doAniShrink(true);
            this.aeKnobTouchId = -1;
        }
    }));
    return faderContainer;
}

var statusSwitch = function(parent) {

    parent.growSize = 0.05;
    parent.grow = 0;
    parent.ani = new ani(parent);

    parent.addEventListener("mousedown", function(e) {
        press(parent);
    })
    parent.addEventListener("mouseup", function(e) {
        this.ani.doAniShrink(true);
    })
    parent.addEventListener("touchstart", function(e) {
        if (e.stopPropagation) e.stopPropagation();
        e.preventDefault();
        press(parent);
    })
    parent.addEventListener("touchend", (function(e) {
        e.preventDefault();
        this.ani.doAniShrink(true);
    }));

    function press(elem) {
        events.fire("change", {
            "type": "statusSwitch",
            "chnId": elem.aeId,
            "status": elem.val
        });
        elem.ani.doAniGrow(true);
        var panel = document.getElementById("faderPanel" + elem.aeId);
        // check if latch is done
        if (panel.aeStatus == 3 && elem.val == 1) {
            if (mf08.run) {
                panel.latch = 1;
            }
        }
    }

    function release(elem) {
        events.fire("change", {
            "type": "statusSwitch",
            "chnId": elem.aeId,
            "status": elem.val
        });
        elem.ani.doAniShrink(true);
    }
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
    levels[knob.aeId] = yPos;
    var scaledPos = Math.round(yPos * (1023 / knob.aeMax));
    events.fire("change", {
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
        auto.style.backgroundImage = "url(" + autoOff.src + ")";
        touch.style.backgroundImage = "url(" + touchOff.src + ")";
        write.style.backgroundImage = "url(" + writeOff.src + ")";
    } else if (panel.aeStatus == 1) {
        auto.style.backgroundImage = "url(" + autoOn.src + ")";
        touch.style.backgroundImage = "url(" + touchOff.src + ")";
        write.style.backgroundImage = "url(" + writeOff.src + ")";
    } else if (panel.aeStatus == 2) {
        auto.style.backgroundImage = "url(" + autoOn.src + ")";
        touch.style.backgroundImage = "url(" + touchOn.src + ")";
        write.style.backgroundImage = "url(" + writeOff.src + ")";
    } else if (panel.aeStatus == 3) {
        auto.style.backgroundImage = "url(" + autoOn.src + ")";
        touch.style.backgroundImage = "url(" + touchOff.src + ")";
        write.style.backgroundImage = "url(" + writeOn.src + ")";
    }
}

function setMF08Display(display) {
    var ctx = display.getContext("2d");
    var dig1place = 8;
    var dig2place = 164;

    var dig1 = Math.floor((display.aeDisplayId + 1) / 10);
    var dig2 = Math.floor((display.aeDisplayId + 1) % 10);

    if (dig1 == 0) dig1 = 16;

    var dig1Pick = dig1 * 34;
    var dig2Pick = dig2 * 34;
    ctx.drawImage(ledPalatte, dig1Pick, 0, 34, 50, dig1place, 0, 148, 150);
    ctx.drawImage(ledPalatte, dig2Pick, 0, 34, 50, dig2place, 0, 148, 150);
}