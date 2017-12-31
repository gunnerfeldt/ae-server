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

function MF08(){

    this.self = this;

    this.on = function (name, callback){
        events.addListener(name, callback);
    };


}

MF08.prototype.startFetchLoop = function(){
    setInterval(function(){
        events.fire("change", {
            "type"          : "fetch"
        });        
    },30)
}

MF08.prototype.update = function(data){
//    console.log("ststus "+data.fader[0].status);
    for(var i=0;i<8;i++){
        var knob = document.getElementById("knob"+i);
        var oldPos = parseInt(knob.style.bottom);
        var pos = Math.round(data.fader[i].pos * (knob.aeMax/1023));
        var pos = Math.round((pos + oldPos)/2);
        if(!knob.aeTouch) knob.style.bottom = pos +"px";   

        var panel = document.getElementById("faderPanel"+i);
        if(panel.aeStatus != data.fader[i].status){
            panel.aeStatus = data.fader[i].status;
            setMF08Status(panel);
        }
        var display = document.getElementById("display"+i);
        if(display.aeDisplayId != ((data.bank*8) + i)){
            display.aeDisplayId = ((data.bank*8) + i);
            console.log("new digits="+display.aeDisplayId);
            setMF08Display(display);
        }
    }
}

MF08.prototype.createMfPanel = function(w,h){

        // w = 1010, h = 480
        var faderContainer = document.createElement('div');
        faderContainer.id = "defaultWrapper";
        faderContainer.aeKnobTouchId = -1;
        faderContainer.aeBank = 0;

        for(var i=0;i<8;i++){
            var faderPanel = document.createElement('div');
            var knobTrack = document.createElement('div');
            var knob = document.createElement('div');
            var mute = document.createElement('canvas');
            var auto = document.createElement('div');
            var touch = document.createElement('div');
            var write = document.createElement('div');
            var display = document.createElement('canvas');
            
            // panel
            faderPanel.id = "faderPanel"+i;
            faderPanel.style.position = "relative";
            faderPanel.style.display = "inline-block";
            faderPanel.style.width = Math.floor(w/8)+"px";
            faderPanel.style.height = h+"px";
            faderPanel.style.backgroundImage = "url(" + mf08panel.src + ")";
            faderPanel.style.border = "0px #000";
            faderPanel.aeStatus = 0;
            faderPanel.aeId = i;

            // knob track
            knobTrack.id = "knobTrack"+i;
            knobTrack.style.position = "absolute";
            knobTrack.style.width = "60px";
            knobTrack.style.height = (h-80)+"px";
            knobTrack.style.top = "80px";
            knobTrack.style.right = "0px";
            knobTrack.style.backgroundColor = "none";
            knobTrack.style.border = "none";

            // knob
            knob.id = "knob"+i;
            knob.aeId = i;
            knob.aeTouch = 0;
            knob.aePos = 0;
            knob.aeMin = 0;
            knob.aeMax = h-160;
            knob.style.position = "absolute";
            knob.style.width = "60px";
            knob.style.height = "80px";
            knob.style.bottom = "0px";
            knob.style.left = "0px";
            knob.style.backgroundImage = "url(" + mf08knob.src + ")";
            knob.style.border = "none";

            // touch events
            knob.addEventListener("touchstart", (function (e) {
                e.preventDefault();
                var touch = e.targetTouches[0]
                this.aeTouch = 1;
                this.aeTouchId = e.changedTouches[0].identifier;
                this.aePos = touch.pageY;
                this.aeKnobPos = parseInt(this.style.bottom);
                events.fire("change", {
                    "type"          : "touch",
                    "chnId"         : this.aeId,
                    "touch"         : true
                });
                moveKnob(e,this,this.aeKnobPos + (this.aePos - e.pageY));
            }));
            knob.addEventListener("touchmove", (function (e) {
                var yPos = this.aeKnobPos + (this.aePos - e.targetTouches[0].pageY);
                moveKnob(e,this,yPos);
            }));
            knob.addEventListener("touchend", (function (e) {
                e.preventDefault();
                this.aeTouch = 0;
                events.fire("change", {
                    "type"          : "touch",
                    "chnId"         : this.aeId,
                    "touch"         : false
                });
            }));

            // mouse events
            knob.addEventListener("mousedown", (function (e) {
                if(e.stopPropagation) e.stopPropagation();
                if(e.preventDefault) e.preventDefault();
                e.cancelBubble=true;
                e.returnValue=false;
                console.log("start "+this.aeId);
                this.aeTouch = 1;
                this.aePos = e.pageY;
                this.aeKnobPos = parseInt(this.style.bottom);
                document.getElementById("defaultWrapper").aeKnobTouchId = this.aeId;
                events.fire("change", {
                    "type"          : "touch",
                    "chnId"         : this.aeId,
                    "touch"         : true
                });
                moveKnob(e,this,this.aeKnobPos + (this.aePos - e.pageY));
            }));

            // mute
            mute.id = "mute"+i;
            mute.style.position = "absolute";
            mute.style.width = "60px";
            mute.style.height = "80px";
            mute.style.top = "26px";
            mute.style.left = "0px";
            mute.style.border = "none";
            mute.aeId = i;
            mute.addEventListener("click", function(e){
                events.fire("change", {
                    "type"          : "mute",
                    "chnId"         : this.aeId
                });
            })
            mute.addEventListener("touchstart", function(e){
                e.preventDefault();
                events.fire("change", {
                    "type"          : "mute",
                    "chnId"         : this.aeId
                });
            })

            // leds & buttons
            auto.id = "auto"+i;
            auto.style.position = "absolute";
            auto.style.width = "60px";
            auto.style.height = "80px";
            auto.style.top = "405px";
            auto.style.left = "0px";
            auto.style.border = "none";
            auto.aeId = i;
            auto.addEventListener("click", function(e){
                events.fire("change", {
                    "type"          : "statusSwitch",
                    "chnId"         : this.aeId,
                    "status"        : 0x1
                });
            })
            auto.addEventListener("touchstart", function(e){
                e.preventDefault();
                events.fire("change", {
                    "type"          : "statusSwitch",
                    "chnId"         : this.aeId,
                    "status"        : 0x1
                });
            })

            touch.id = "touch"+i;
            touch.style.position = "absolute";
            touch.style.width = "60px";
            touch.style.height = "80px";
            touch.style.top = "185px";
            touch.style.left = "0px";
            touch.style.border = "none";
            touch.aeId = i;
            touch.addEventListener("click", function(e){
                events.fire("change", {
                    "type"          : "statusSwitch",
                    "chnId"         : this.aeId,
                    "status"        : 0x2
                });
            })
            touch.addEventListener("touchstart", function(e){
                e.preventDefault();
                events.fire("change", {
                    "type"          : "statusSwitch",
                    "chnId"         : this.aeId,
                    "status"        : 0x2
                });
            })

            write.id = "write"+i;
            write.style.position = "absolute";
            write.style.width = "60px";
            write.style.height = "80px";
            write.style.top = "105px";
            write.style.left = "0px";
            write.style.border = "none";
            write.aeId = i;
            write.addEventListener("click", function(e){
                events.fire("change", {
                    "type"          : "statusSwitch",
                    "chnId"         : this.aeId,
                    "status"        : 0x3
                });
            })
            write.addEventListener("touchstart", function(e){
                e.preventDefault();
                events.fire("change", {
                    "type"          : "statusSwitch",
                    "chnId"         : this.aeId,
                    "status"        : 0x3
                });
            })

            // display
            display.id = "display"+i;
            display.style.position = "absolute";
            display.style.width = "46px";
            display.style.height = "30px";
            display.style.top = "319px";
            display.style.left = "7px";
            display.style.border = "none";
            display.aeDisplayId = -1;

            knobTrack.appendChild(knob);
            faderPanel.appendChild(knobTrack);
            faderPanel.appendChild(mute);
            faderPanel.appendChild(auto);
            faderPanel.appendChild(touch);
            faderPanel.appendChild(write);
            faderPanel.appendChild(display);

            faderContainer.appendChild(faderPanel);
        }

        faderContainer.addEventListener("mousemove", (function (e) {
            if(this.aeKnobTouchId > -1){
                var knob = document.getElementById("knob"+this.aeKnobTouchId);
                moveKnob(e,knob,knob.aeKnobPos + (knob.aePos - e.pageY));
            }
        }));
        faderContainer.addEventListener("mouseup", (function (e) {
            if(this.aeKnobTouchId > -1){
                events.fire("change", {
                    "type"          : "touch",
                    "chnId"         : this.aeKnobTouchId,
                    "touch"         : false
                });
                document.getElementById("knob"+this.aeKnobTouchId).aeTouch = 0;
                this.aeKnobTouchId = -1;
            }
        }));
        return faderContainer;
    }

    function calcId(x){
        var appX = document.getElementById("app");
        var channelWidth = parseInt(document.getElementById("faderPanel0").style.width) + 1;
        var id = Math.floor((x - appX.offsetLeft - 10) / channelWidth);
        return id ;
    }

    function moveKnob(e, knob, yPos){

        if(e.stopPropagation) e.stopPropagation();
        if(e.preventDefault) e.preventDefault();
        e.cancelBubble=true;
        e.returnValue=false;

        if(yPos < knob.aeMin) yPos = knob.aeMin;
        if(yPos > knob.aeMax) yPos = knob.aeMax;
        knob.style.bottom = yPos + "px";

        var scaledPos = Math.round(yPos * (1023/knob.aeMax));
        events.fire("change", {
            "type"          : "move",
            "chnId"         : knob.aeId,
            "pos"           : scaledPos
        });
    }

    function setMF08Status(panel){
        var auto = document.getElementById("auto"+panel.aeId);
        var touch = document.getElementById("touch"+panel.aeId);
        var write = document.getElementById("write"+panel.aeId);
        if(panel.aeStatus == 0){
            auto.style.backgroundImage = null;
            touch.style.backgroundImage = null;
            write.style.backgroundImage = null;
        }
        else if(panel.aeStatus == 1){
            auto.style.backgroundImage = "url(" + mf08auto.src + ")";
            touch.style.backgroundImage = null;
            write.style.backgroundImage = null;
        }
        else if(panel.aeStatus == 2){
            auto.style.backgroundImage = "url(" + mf08auto.src + ")";
            touch.style.backgroundImage = "url(" + mf08touch.src + ")";
            write.style.backgroundImage = null;
        }
        else if(panel.aeStatus == 3){
            auto.style.backgroundImage = "url(" + mf08auto.src + ")";
            touch.style.backgroundImage = null;
            write.style.backgroundImage = "url(" + mf08write.src + ")";
        }
    }

    function setMF08Display(display){
        var ctx=display.getContext("2d");
        var dig1place = 8;
        var dig2place = 164;

        var dig1 = Math.floor((display.aeDisplayId+1)/10);
        var dig2 = Math.floor((display.aeDisplayId+1)%10);

        if(dig1 == 0) dig1 = 16;

        var dig1Pick = dig1*34;
        var dig2Pick = dig2*34;
        ctx.drawImage(ledPalatte,dig1Pick,0,34,50,dig1place,0,148,150);
        ctx.drawImage(ledPalatte,dig2Pick,0,34,50,dig2place,0,148,150);
    }