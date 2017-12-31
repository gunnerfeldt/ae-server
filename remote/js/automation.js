var timeCode = {
    "position": 0,
    "fps": 25,
    "state": 0
};

var timeLine = {
    "startOfScopeX": 0,
    "startOfScopeY": 0,
    "width": 0,
    "height": 0,
    "trackHeight": 0,
    "trackScope": 0,
    "zoomRatio": 0,
    "scaleHeightRatio": 0,
    "rePaintFlag": 0,
    "bank": 0
};

var automation = {
    "autoPts": [],
    "redRegions": [],
    "trackPoints": []
};
var animateQueue = [];
var animationPool = [];
var animateTime = 2;

var lastPos;
var timelineCanvasBase = {};
var timelineCanvasWithPaths = {};
var timelinePaths = [];
var timelineSlidePaths = [];
var slideFlag = 0;
var filterVal = 1.01;

var statusColDragInhibit = 0;
var dragStartX = 0;
var dragOffsetX = 0;
var dragStartY = 0;
var dragOffsetY = 0;
var pageFlipInhibit = 0;
var chnOffset = 0;

// var guiFader = [];

var canvasBuffers = [];
var trackBackground = {};

var transport;

var faderKnob = [];
var knobWhite;
var knobRed;

var tlBuf = null;

function goTl() {
    tlBuf.width = timeLine.width;
    tlBuf.height = timeLine.trackHeight;
    var tlctx = tlBuf.getContext('2d');

    tlctx.beginPath();
    tlctx.fillStyle = '#888';
    tlctx.fillRect(0, 0, timeLine.width, timeLine.trackHeight);
    tlctx.stroke();

    tlctx.beginPath();
    tlctx.lineWidth = "1";
    tlctx.strokeStyle = '#323232';
    tlctx.moveTo(0, 0);
    tlctx.lineTo(timeLine.width - 1, 0);
    tlctx.stroke();

    tlctx.beginPath();
    tlctx.lineWidth = "1";
    tlctx.strokeStyle = '#aaa';
    tlctx.moveTo(0, timeLine.trackHeight - 1);
    tlctx.lineTo(timeLine.width - 1, timeLine.trackHeight - 1);
    tlctx.stroke();
}

knobWhite = loadSprite('img/knobWhite.png',
    console.log("knob loaded")
);
knobRed = loadSprite('img/knobRed.png',
    console.log("knob loaded")
);

for (var i = 0; i < 96; i++) {
    faderKnob[i] = knobWhite;
}

function loadSprite(src, callback) {
    var sprite = new Image();
    sprite.onload = callback;
    sprite.src = src;
    return sprite;
}


function initAutomation() {
    trackBackground = drawTrackBackground();
    window.requestAnimationFrame(paintWorkerXXX);
}

function drawTimeline() {

    var canvas = document.getElementById("c1");
    var context = canvas.getContext("2d");

    //   context.clearRect(0, 0, timeLine.width, timeLine.height);
    context.beginPath();

    for (var n = 0; n < cv96.numOfTracks; n++) {
        context.drawImage(trackBackground, 0, n * timeLine.trackHeight);
    }
    context.stroke();

}


var buffer;

function drawTrackBackground() {
    if (buffer == null) {
        buffer = document.createElement('canvas');
        buffer.width = timeLine.width;
        buffer.height = timeLine.trackHeight;
        var ctx = buffer.getContext('2d');

        ctx.beginPath();
        ctx.fillStyle = '#888';
        ctx.fillRect(0, 0, timeLine.width, timeLine.trackHeight);
        ctx.stroke();

        ctx.beginPath();
        ctx.lineWidth = "1";
        ctx.strokeStyle = '#323232';
        ctx.moveTo(0, 0);
        ctx.lineTo(timeLine.width - 1, 0);
        ctx.stroke();

        ctx.beginPath();
        ctx.lineWidth = "1";
        ctx.strokeStyle = '#aaa';
        ctx.moveTo(0, timeLine.trackHeight - 1);
        ctx.lineTo(timeLine.width - 1, timeLine.trackHeight - 1);
        ctx.stroke();
    }
    return buffer;
}

function drawRuler() {
    var canvas = document.getElementById("autoRuler");
    var context = canvas.getContext("2d");
    var buffer = document.createElement('canvas');
    var lastN = 0;

    var bColor = "#323232";
    var fColor = "#999";


    buffer.width = timeLine.width - 1;
    buffer.height = 17;
    var ctx = buffer.getContext('2d');

    ctx.beginPath();
    ctx.lineWidth = "1";
    ctx.strokeStyle = fColor;


    for (n = 0; n < timeLine.width; n++) {
        // kolla med scope & zoom
        // sätt ut streck
        var drawMarker = 0;
        var drawText = 0;
        var remain = (Math.round((timeLine.startOfScopeX + n + 1) / timeLine.zoomRatio) % timeCode.fps);

        if ((remain === 0) && ((n - lastN) > 15)) {
            var min = Math.floor((((timeLine.startOfScopeX + n) / timeLine.zoomRatio) / timeCode.fps) / 60);
            var sec = (Math.round(((timeLine.startOfScopeX + n) / timeLine.zoomRatio) / timeCode.fps) % 60);

            if (timeLine.zoomRatio === 2 || timeLine.zoomRatio === 5) {
                drawMarker = 1;
                drawText = 1;
            }

            if (timeLine.zoomRatio === 1) drawMarker = 1;
            if (timeLine.zoomRatio === 1 && (sec % 2) === 0) drawText = 1;

            if (timeLine.zoomRatio === 0.5 && (sec % 2) === 0) drawMarker = 1;
            if (timeLine.zoomRatio === 0.5 && (sec % 5) === 0) drawText = 1;

            if (timeLine.zoomRatio === 0.1 && ((sec % 5) === 0)) drawMarker = 1;
            if (timeLine.zoomRatio === 0.1 && ((sec % 15) === 0)) drawText = 1;
            lastN = n;

        }

        if (drawMarker) {
            if (sec < 10) sec = "0" + sec;
            if (drawText) {
                ctx.moveTo(n + 1, 5);
                ctx.lineTo(n + 1, 18);
                ctx.font = "900 11px Arial";
                ctx.fillStyle = fColor;
                ctx.textAlign = "right";
                ctx.fillText(min, n - 1, 15);
                ctx.textAlign = "left";
                ctx.fillText(sec, n + 3, 15);
            } else {
                ctx.moveTo(n + 1, 12);
                ctx.lineTo(n + 1, 18);
            }
            ctx.stroke();
        }
        // sätt ut text
    }
    context.fillStyle = bColor;
    context.beginPath();
    context.fillRect(0, 0, timeLine.width, 19);
    context.drawImage(buffer, 0, 0);
    context.stroke();
}


function buildTimeline() {
    var canvas = document.createElement('canvas');
    canvas.id = "c1";
    canvas.width = timeLine.width;
    canvas.height = timeLine.trackHeight * cv96.numOfTracks;
    //      canvas.height = timeLine.height;
    canvas.style.zIndex = 9;
    canvas.style.position = "relative";
    canvas.style.border = "none";
    return canvas;
}

function buildTimelineOverlay() {
    var canvas = document.createElement('canvas');
    canvas.id = "overlay";
    canvas.width = timeLine.width;
    canvas.height = timeLine.height;
    canvas.style.zIndex = 10;
    canvas.style.position = "absolute";
    canvas.style.left = "0px";
    canvas.style.top = "0px";
    canvas.style.border = "none";
    canvas.style.cursor = "pointer";
    return canvas;
}

function setHuiStatus(chn, status) {
    var statusBox = document.getElementById("statusBox" + chn);
    if (!statusBox) {
        //    console.log("No -statusBox"+chn+"-");
        return;
    }
    var children = statusBox.getElementsByTagName('img');
    var isThere = 0;

    for (var i = 0; i < children.length; i++) {
        if (children[i].getAttribute('id') === "rightPointer" + chn) {
            isThere = 1;
            break;
        }
    }

    if (status) {
        // add arrow
        if (!isThere) {
            var rightPointer = document.createElement("img");
            rightPointer.id = "rightPointer" + chn;
            rightPointer.src = "img/rightPointerYellow.png";
            rightPointer.style.position = "absolute";
            rightPointer.style.top = "4px";
            rightPointer.style.left = "1px";
            rightPointer.style.zIndex = "250";
            statusBox.appendChild(rightPointer);
            console.log("Add HUI reminder chn " + chn);
        }
    } else {
        if (isThere) {
            // remove arrow
            var rightPointer = document.getElementById("rightPointer" + chn);
            statusBox.removeChild(rightPointer);
            console.log("Remove HUI reminder chn " + chn);
        }
    }
}

function setStatus(chn, status) {
    // timeline status box
    document.getElementById("statusTrackStatus" + (chn)).style.backgroundColor = statusColor[status];
    document.getElementById("statusTrackStatus" + (chn)).style.color = statusTextColor[status];
    document.getElementById("statusTrackStatus" + (chn)).innerHTML = statusText[status];
    cv96.localStates.tracks[chn].status = status;

    if (chn > -1 && chn < 96) {
        var bankPage = Math.floor(chn / 48);
        var faderBankOffset = chn - (bankPage * 48);
        var bankTmp = Math.floor(faderBankOffset / 8);

        if (bankPage === properties.state.bankPage) {
            var faderBanks = document.getElementById("faderBanks");
            var ctx = faderBanks.getContext('2d');
            var xpos = (faderBankOffset * 20) + (bankTmp * 4) + 2;
            ctx.fillStyle = statusColor[status];
            ctx.beginPath();
            ctx.fillRect(xpos, 19, 20, 3);
            //    ctx.stroke();
        }
        //        document.getElementById("statusLine"+(chn-(bankPage*48))).style.backgroundColor = statusColor[status];
    }
}

function setFaderLevel(chn, level) {
    if (chn > -1 && chn < 48) {
        var bankTmp = Math.floor(chn / 8);
        var faderBanks = document.getElementById("faderBanks");
        var pos = 136 - (Math.round((level / 9.1) + 1));
        //    var buffer = document.createElement('canvas');
        //    buffer.width = 20;
        //    buffer.height = 130;
        var xpos = (chn * 20) + (bankTmp * 4) + 2;
        var ctx = faderBanks.getContext('2d');
        ctx.clearRect(xpos, 22, 20, 150);
        ctx.fillStyle = "#222";
        ctx.beginPath();
        ctx.fillRect(xpos + 9, 34, 2, 116);
        //    ctx.stroke();

        ctx.drawImage(faderKnob[chn], 4 + xpos, pos);
    }
}

function setTouchSense(chn, touchSense, level) {
    if (chn > -1 && chn < 48) {
        var bankTmp = Math.floor(chn / 8);
        var faderBanks = document.getElementById("faderBanks");
        var pos = 136 - (Math.round((level / 9.1) + 1));
        var xpos = (chn * 20) + (bankTmp * 4) + 2;
        var ctx = faderBanks.getContext('2d');
        ctx.clearRect(xpos, 22, 20, 150);
        ctx.fillStyle = "#222";
        ctx.beginPath();
        ctx.fillRect(xpos + 9, 34, 2, 116);

        if (touchSense) faderKnob[chn] = knobRed;
        else faderKnob[chn] = knobWhite;

        ctx.drawImage(faderKnob[chn], 4 + xpos, pos);
    }
}

function setBank(bank) {
    // var bankPage = bank - (Math.floor(bank/6)*6);
    var bankPage;

    if (bank < 6) bankPage = 0;
    else bankPage = 1;

    var hiLiteOffset = bank - (Math.floor(bank / 6) * 6);
    var hiLitePos = (hiLiteOffset * 164);

    /*   
       animateQueue.push({
           "element": document.getElementById("faderBankHighLite"),
           "anchor": "left",
           "from": parseInt(document.getElementById("faderBankHighLite").style.left),
           "to": (2+((hiLiteOffset)*164))
       });
    */
    var buffer = document.getElementById("bankHighLite");
    var xpos = hiLitePos + 2;
    var ypos = 22;
    var ctx = buffer.getContext('2d');
    ctx.clearRect(0, 0, 1000, 162);
    ctx.fillStyle = "#777";
    ctx.beginPath();
    ctx.fillRect(xpos, ypos, 160, 138);
    ctx.stroke();

    animateQueue.push({
        "element": document.getElementById("autoTracks"),
        "anchor": "top",
        "from": -timeLine.startOfScopeY,
        "to": (bank * -440)
    });
    animateQueue.push({
        "element": document.getElementById("autoStatuses"),
        "anchor": "top",
        "from": -timeLine.startOfScopeY,
        "to": (bank * -440) - 1
    });
    /*
        document.getElementById("autoTracks").style.top = ""+(-bank*440)+"px";
        document.getElementById("autoStatuses").style.top = ""+((-bank*440)-1)+"px";
    */
    timeLine.bank = bank;
    cv96.bank = bank;

    if (properties.state.bankPage != bankPage) {
        properties.state.bankPage = bankPage;
        setFaderNumbers();
        console.log("switch page");
    }

    chnOffset = ((bank) * 8);
    timeLine.startOfScopeY = (chnOffset * timeLine.trackHeight);
}

function setFaderNumbers() {
    var faderBanks = document.getElementById("faderBanks");
    var ctx = faderBanks.getContext('2d');
    ctx.clearRect(0, 0, 1000, 15);
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

function setZoom(val) {

    var hlBGR = "#ffcc00";
    var hlFGR = "#323232";
    var BGR = "#323232";
    var FGR = "#ffcc00";

    var zoom1 = document.getElementById("zoom1");
    var zoom2 = document.getElementById("zoom2");
    var zoom3 = document.getElementById("zoom3");
    var zoom4 = document.getElementById("zoom4");
    var zoom5 = document.getElementById("zoom5");

    zoom1.style.backgroundColor = BGR;
    zoom1.style.color = FGR;
    zoom2.style.backgroundColor = BGR;
    zoom2.style.color = FGR;
    zoom3.style.backgroundColor = BGR;
    zoom3.style.color = FGR;
    zoom4.style.backgroundColor = BGR;
    zoom4.style.color = FGR;
    zoom5.style.backgroundColor = BGR;
    zoom5.style.color = FGR;

    timeLine.zoomRatio = val;
    timeLine.rePaintFlag = 1;

    switch (val) {
        case 0.1:
            zoom1.style.backgroundColor = hlBGR;
            zoom1.style.color = hlFGR;
            break;
        case 0.5:
            zoom2.style.backgroundColor = hlBGR;
            zoom2.style.color = hlFGR;
            break;
        case 1.0:
            zoom3.style.backgroundColor = hlBGR;
            zoom3.style.color = hlFGR;
            break;
        case 2.0:
            zoom4.style.backgroundColor = hlBGR;
            zoom4.style.color = hlFGR;
            break;
        case 5.0:
            zoom5.style.backgroundColor = hlBGR;
            zoom5.style.color = hlFGR;
            break;
    }
    drawRuler();
    updateTimeLine();
}


function trackPointsToImage(points, chn) {
    if (!points) return;
    points.sort;
    var keys = Object.keys(points);
    var length = keys.length;
    var buffer = document.createElement('canvas');
    buffer.width = timeLine.width;
    buffer.height = timeLine.trackHeight;
    var ctx = buffer.getContext('2d');



    if (automation.redRegions[chn]) {
        if (!automation.redRegions[chn].active) {
            ctx.fillStyle = '#D1A728'; // sealed
        } else {
            ctx.fillStyle = '#B25C5C'; // open
        }

        var start, len;
        start = (Math.round(automation.redRegions[chn].start + 2) * timeLine.zoomRatio) - timeLine.startOfScopeX;
        len = (Math.round(automation.redRegions[chn].length) * timeLine.zoomRatio);

        if (start < 1) {
            len = len + start;
            start = 1;
        }
        if (len > timeLine.width) len = timeLine.width;
        if ((start + len) > 0) {
            ctx.fillRect(start, 1, len + 2, timeLine.trackHeight - 3);
            if (!automation.redRegions[chn].active) {
                ctx.lineWidth = "1";
                ctx.strokeStyle = '#aaa';
                ctx.beginPath();
                ctx.rect(start - 1, 1, len + 4, timeLine.trackHeight - 3);
                ctx.stroke();
            }
        }

    }

    ctx.lineWidth = "2";
    ctx.strokeStyle = '#000';
    ctx.beginPath();


    var lastLevel = null;

    if (length > 1) {
        for (var n = 0; n < length - 0; n++) {
            var level = timeLine.trackHeight - (Math.floor(points[keys[n]] / timeLine.scaleHeightRatio)) - 3;
            var zoomedTime = Math.round((keys[n]) * timeLine.zoomRatio);

            // when a point found inside scope
            if ((zoomedTime) > (timeLine.startOfScopeX + 1)) {
                // if point is not exceeding right scope
                if (zoomedTime < ((timeLine.startOfScopeX + timeLine.width) + 0)) {
                    if (lastLevel === null) lastLevel = level;
                    ctx.lineTo(zoomedTime - (timeLine.startOfScopeX) + 1, lastLevel);
                    ctx.lineTo(zoomedTime - (timeLine.startOfScopeX) + (timeLine.zoomRatio) + 1, level);
                }
                // if exceeding - break loop
                else {
                    break;
                }
                // if point is not in scope
            } else {
                ctx.moveTo(1, level);
            }
            lastLevel = level;
        }
    }
    ctx.lineTo(timeLine.width, lastLevel);
    ctx.stroke();
    return buffer;
}



var lastPosition;
var lastTransport;

function paintWorkerXXX() {


    // loop thru canvasBuffers and look for "rePaintFlags"
    // do other animations
    var timelineCanvas = document.getElementById("c1");

    if (timelineCanvas) {
        var ctx = timelineCanvas.getContext("2d");
        for (var i = 0; i < 10; i++) {
            var chn = i + (chnOffset) - 1;
            if (chn > -1 && chn < cv96.numOfTracks) {
                if (canvasBuffers[chn]) {
                    ctx.drawImage(drawTrackBackground(), 0, ((chn) * timeLine.trackHeight));
                    ctx.drawImage(canvasBuffers[chn], 0, ((chn) * timeLine.trackHeight));
                    canvasBuffers[chn] = null;
                }
            }
        }
    }

    if (lastPosition !== timeCode.position) {
        mtcDisplay.fps(timeCode.fps);
        mtcDisplay.hour(timeCode.hour);
        mtcDisplay.min(timeCode.min);
        mtcDisplay.sec(timeCode.sec);
        mtcDisplay.frame(timeCode.frame);
        lastPosition = timeCode.position;
    }

    if (transport !== lastTransport) {
        // overlay for transport line
        var overlay = document.getElementById("overlay");
        if (overlay) {
            var context = overlay.getContext("2d");
            context.beginPath();
            context.clearRect(0, 0, timeLine.width, timeLine.height);
            if (transport > -1) {
                context.moveTo(transport + 2, 0);
                context.strokeStyle = '#ff0000';
                context.lineTo(transport + 2, timeLine.height);
                context.stroke();
            }
        }
        lastTransport = transport;
    }

    /*
     * 
     * ******* ANIMATE ********
     * 
     */

    for (var n = 0; n < animateQueue.length; n++) {
        animateQueue[n].from = Math.floor(((animateQueue[n].from * animateTime) + (animateQueue[n].to)) / (animateTime + 1));
        animateQueue[n].element.style[animateQueue[n].anchor] = animateQueue[n].from + "px";

        if ((Math.abs(animateQueue[n].to - animateQueue[n].from)) < 5) {
            animateQueue[n].element.style[animateQueue[n].anchor] = animateQueue[n].to + "px";
            animateQueue.splice(n, 1);
        } else {}
    }

    // this will run thru at least half of the pool
    //  var poolSize = animationPool.length;
    //   while(animationPool.length > (poolSize/2))

    while (animationPool.length) {
        if (animationPool[0]) {
            var func = animationPool[0].function;
            func(animationPool[0].arg1, animationPool[0].arg2);
        }
        animationPool.splice(0, 1);
    }

    requestAnimationFrame(paintWorkerXXX);
}


function timeLineDragStart(xVal) {
    dragStartX = 1;
    dragOffsetX = xVal;
};

function statusColumnDragStart(yVal) {
    if (!statusColDragInhibit) {
        dragStartY = 1;
        dragOffsetY = yVal;
    }
};

function statusColumnDragStop() {
    if (dragStartY) {
        document.getElementById("autoStatuses").style.top = '-' + ((chnOffset * timeLine.trackHeight) + 1) + 'px';
        document.getElementById("autoTracks").style.top = '-' + ((chnOffset * timeLine.trackHeight)) + 'px';
        /*
         var tempBank = Math.floor(chnOffset/8)+1;
         if(tempBank<1)tempBank=1;
         faderBank.switch(tempBank);
         */
    }
    // startOfScopeY = (chnOffset*trackHeight);
    dragStartX = 0;
    dragStartY = 0;
};

function drag(xVal, yVal) {
    if (dragStartX) {
        if (xVal - dragOffsetX) {
            timeLine.startOfScopeX -= (xVal - dragOffsetX);
            dragOffsetX = xVal;
            if (timeLine.startOfScopeX < 0) {
                timeLine.startOfScopeX = 0;
                dragOffsetX = 0;
            }
            timeLine.rePaintFlag = 1;
            timeLine.rulerRePaint = 1;
            transport = (timeCode.position * timeLine.zoomRatio) - timeLine.startOfScopeX;
        }
        updateTimeLine();
        drawRuler();
    }
    if (dragStartY) {
        if (yVal - dragOffsetY) {
            timeLine.startOfScopeY -= (yVal - dragOffsetY);
            chnOffset = (Math.round(timeLine.startOfScopeY / timeLine.trackHeight));
            timeLine.rePaintFlag = 1;
            if ((yVal - dragOffsetY) !== 0) {
                document.getElementById("autoStatuses").style.top = '-' + timeLine.startOfScopeY + 'px';
                document.getElementById("autoTracks").style.top = '-' + timeLine.startOfScopeY + 'px';
            }
            dragOffsetY = yVal;
            //    chnOffset = (Math.round(startOfScopeY/trackHeight));
            if (timeLine.startOfScopeY < 0) {
                timeLine.startOfScopeY = 0;
                chnOffset = 0;
            }
        }
        //    updateTimeLine();
    }
}

function adjustTimeline() {

    transport = (timeCode.position * timeLine.zoomRatio) - timeLine.startOfScopeX;
    // if transport goes outside of canvas
    if (transport > timeLine.width || transport < 0) {
        // if a drag has started, inhibit page flip
        if (dragStartX) {
            pageFlipInhibit = 1;
        }
        // chase transport
        if (!pageFlipInhibit) {
            while (transport > timeLine.width) {
                timeLine.startOfScopeX += timeLine.width;
                transport = (timeCode.position * timeLine.zoomRatio) - timeLine.startOfScopeX;
                updateTimeLine();
                drawRuler();
            }
            while (transport < 0) {
                timeLine.startOfScopeX -= timeLine.width;
                if (timeLine.startOfScopeX < 0) {
                    timeLine.startOfScopeX = 0;
                    dragOffsetX = 0;
                }
                transport = (timeCode.position * timeLine.zoomRatio) - timeLine.startOfScopeX;
                updateTimeLine();
                drawRuler();
            }
        }
    }
    // always release inhibit when transport is visible
    else {
        pageFlipInhibit = 0;
    }
}

function updateTimeLine() {
    for (var i = 0; i < 10; i++) {
        var chn = i + (chnOffset) - 1;
        if (chn > -1 && chn < cv96.numOfTracks) {
            var track = {};
            track.track = chn;
            track.points = automation.autoPts[chn];
            drawTrackBuffer(track);
        }
    }

}

function drawTrackBuffer(data) {
    if (!data.points) return;
    data.points.sort;
    var keys = Object.keys(data.points);
    var length = keys.length;

    canvasBuffers[data.track] = document.createElement('canvas');
    canvasBuffers[data.track].width = timeLine.width;
    canvasBuffers[data.track].height = timeLine.trackHeight;
    canvasBuffers[data.track].fresh = 0;

    var ctx = canvasBuffers[data.track].getContext('2d');
    /*
        if (automation.redRegions[data.track]) {
            if (!automation.redRegions[data.track].active) {
                ctx.fillStyle = '#D1A728'; // sealed
            } else {
                ctx.fillStyle = '#B25C5C'; // open
            }

            var start, len;
            start = (Math.round(automation.redRegions[data.track].start + 2) * timeLine.zoomRatio) - timeLine.startOfScopeX;
            len = (Math.round(automation.redRegions[data.track].length) * timeLine.zoomRatio);

            if (start < 1) {
                len = len + start;
                start = 1;
            }
            if (len > timeLine.width) len = timeLine.width;
            if ((start + len) > 0) {
                ctx.fillRect(start, 1, len + 2, timeLine.trackHeight - 3);
                if (!automation.redRegions[data.track].active) {
                    ctx.lineWidth = "1";
                    ctx.strokeStyle = '#aaa';
                    ctx.beginPath();
                    ctx.rect(start - 1, 1, len + 4, timeLine.trackHeight - 3);
                    ctx.stroke();
                }
            }
        }
    */


    ctx.lineWidth = "2";
    ctx.strokeStyle = '#000';
    ctx.beginPath();

    var lastLevel = null;

    if (length > 1) {
        for (var n = 0; n < length - 0; n++) {
            var level = timeLine.trackHeight - (Math.floor(data.points[keys[n]] / timeLine.scaleHeightRatio)) - 3;
            var zoomedTime = Math.round((keys[n]) * timeLine.zoomRatio);

            // when a point found inside scope
            if ((zoomedTime) > (timeLine.startOfScopeX + 1)) {
                // if point is not exceeding right scope
                if (zoomedTime < ((timeLine.startOfScopeX + timeLine.width) + 0)) {
                    if (lastLevel === null) lastLevel = level;
                    ctx.lineTo(zoomedTime - (timeLine.startOfScopeX) + 1, lastLevel);
                    ctx.lineTo(zoomedTime - (timeLine.startOfScopeX) + (timeLine.zoomRatio) + 1, level);
                }
                // if exceeding - break loop
                else {
                    break;
                }
                // if point is not in scope
            } else {
                ctx.moveTo(1, level);
            }
            lastLevel = level;
            canvasBuffers[data.track].fresh = 1;
        }
    }
    ctx.lineTo(timeLine.width, lastLevel);
    ctx.stroke();

}