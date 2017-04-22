function createMfPanel(w,h){

    // w = 1010, h = 480
    var faderContainer = document.createElement('div');
    faderContainer.id = "faders";
    faderContainer.style.width = "100%";
    faderContainer.style.height = "100%";
    faderContainer.style.margin = "0";
    faderContainer.style.backgroundColor = "#323232";

    for(var i=0;i<8;i++){
        var faderPanel = document.createElement('div');
        var knobTrack = document.createElement('div');
        var knob = document.createElement('div');
        var mute = document.createElement('div');
        var auto = document.createElement('div');
        var touch = document.createElement('div');
        var write = document.createElement('div');
        var display = document.createElement('div');
        
        // panel
        faderPanel.id = "faderPanel"+i;
        faderPanel.style.display = "inline-block";
        faderPanel.style.width = (w/8)+"px";
        faderPanel.style.height = h+"px";
        faderPanel.style.backgroundColor = "#323232";
        faderPanel.style.border = "1px #000";

        // knob track
        knobTrack.id = "knobTrack"+i;
        knobTrack.style.position = "absolute";
        knobTrack.style.width = "60px";
        knobTrack.style.height = (h-80)+"px";
        knobTrack.style.top = "80px";
        knobTrack.style.right = "0px";
        knobTrack.style.backgroundColor = "none";
        knobTrack.style.border = "1px #666";

        // knob
        knob.id = "knob"+i;
        knob.style.position = "absolute";
        knob.style.width = "60px";
        knob.style.height = "80px";
        knob.style.bottom = "0px";
        knob.style.left = "0px";
        knob.style.backgroundColor = "#ddd";
        knob.style.border = "none";

        // mute
        mute.id = "mute"+i;
        mute.style.position = "absolute";
        mute.style.width = "60px";
        mute.style.height = "80px";
        mute.style.top = "0px";
        mute.style.right = "0px";
        mute.style.backgroundColor = "#f00";
        mute.style.border = "none";

        // leds & buttons
        auto.id = "auto"+i;
        auto.style.position = "absolute";
        auto.style.width = "60px";
        auto.style.height = "80px";
        auto.style.bottom = "30px";
        auto.style.left = "0px";
        auto.style.backgroundColor = "#0f0";
        auto.style.border = "none";

        touch.id = "touch"+i;
        touch.style.position = "absolute";
        touch.style.width = "60px";
        touch.style.height = "80px";
        touch.style.top = "170px";
        touch.style.left = "0px";
        touch.style.backgroundColor = "#fc0";
        touch.style.border = "none";

        write.id = "write"+i;
        write.style.position = "absolute";
        write.style.width = "60px";
        write.style.height = "80px";
        write.style.top = "80px";
        write.style.left = "0px";
        write.style.backgroundColor = "#f00";
        write.style.border = "none";

        // display
        display.id = "display"+i;
        display.style.position = "absolute";
        display.style.width = "50px";
        display.style.height = "60px";
        display.style.top = "305px";
        display.style.left = "0px";
        display.style.backgroundColor = "#0f0";
        display.style.border = "none";

        knobTrack.appendChild(knob);
        faderPanel.appendChild(knobTrack);
        faderPanel.appendChild(mute);
        faderPanel.appendChild(auto);
        faderPanel.appendChild(touch);
        faderPanel.appendChild(write);
        faderPanel.appendChild(display);

        faderContainer.appendChild(faderPanel);
    }
    return faderContainer;
}
