var app = {
    "wrapper": {
        "width" : 986
    }
};

var faderImage = new Image();
faderImage.src = 'img/smallFaderKnob.png';

var aeLogoImg = new Image();
var aeLogoBrokenImg = new Image();

aeLogoImg.src = 'img/AE-logo.png';
aeLogoBrokenImg.src = 'img/AE-logo-broken.png';
console.log("Images loaded");

var logoBroken = "url('img/logoAll.png') 28px 0;";
var logo = "url('img/logoAll.png') 0px 0;";

var leftFlag = 0;
var rightFlag = 0;

var chnWidth = 123;


setElementCoords();


function automanAlert(arg, callback){

    // make a window from arg

    var w = 500;
    var h = 200;
    var alertDiv = document.createElement('div');
    var spanDiv = document.createElement('div');
    
    alertDiv.id = "alertDiv";
    alertDiv.style.position = "absolute";
    alertDiv.style.width = w+"px";
    alertDiv.style.height = h+"px";
    alertDiv.style.left = "50%";
    alertDiv.style.top = "50%";
    alertDiv.style.margin = "-"+(h/1.5)+"px 0 0 -"+(w/2)+"px";
    alertDiv.style.zIndex = "100";
    alertDiv.style.backgroundColor = "#323232";
    alertDiv.style.boxShadow = "3px 3px 3px #323232";

    spanDiv.style.margin = "auto";
    spanDiv.textContent = arg.text;

    alertDiv.appendChild(spanDiv);

    for(var i = 0;i<arg.options.length;i++){
        var option = document.createElement('div');
        option.style.position = "relative";
        option.id = "optionDiv"+i;
        option.className = "alertButton";
        option.style.height = "46px";
        option.style.bottom = "12px";
        option.textContent = arg.options[i];
        option.addEventListener("click", function(){
            callback(this.textContent);
        })
        alertDiv.appendChild(option);
    }

    document.getElementById("app").appendChild(alertDiv);

    // bind click and callback

    /******* remove bubble *********/
    // removeBubble();
}


function buildMainGUI (){
    var versionHi = 0;
    var versionLo = 0;
    var build = 1;
    var appSpace = document.getElementById("app");
    
    var versionText = '' + versionHi + '.' + versionLo + '.' + build;
    var html = '';
    html += '<header>';
    html += '<div id="logo"></div>';
    html += '<div class="container" style="left: 44px; top: 0px; width: 180px; height: 100%;">';
    html += '<div class="AEline" style="left: 0px; top: 14px; width: 180px;"></div>';
    html += '<div class="AEtext" style="font-size: 14px; text-align: center; font-weight: 600; top: 18px; width:180px;">AUTOMAN SW96 REMOTE</div>';
    html += '<div class="AEbuttonA" id="fileButton" style="left: 0px; top: 36px; height: 24px; width: 44px; z-index: 100;">';
    html += '<span style="position:relative;top:4px;left:6px;">File</span><div class="AEcorner"></div></div>';
    html += '<div class="AEbuttonA" id="modeButton" style="left: 48px; top: 36px; height: 24px; width: 57px; z-index: 100;">';
    html += '<span style="position:relative;top:4px;left:6px;">Mode</span><div class="AEcorner"></div></div>';
    html += '<div class="AEbuttonA" id="optionsButton" style="left: 109px; top: 36px; height: 24px; width: 71px; z-index: 100;">';
    html += '<span style="position:relative;top:4px;left:6px;">Options</span><div class="AEcorner"></div></div>';
    html += '</div>';
    
    html += '<div class="container" style="left: 224px; right: 323px; top: 0; height: 100%;">';
    html += '<div class="AEline" style="left: 8px; right: 8px; top: 14px;"></div>';
    html += '<div class="container" style="left: 0px; top: 0; height: 100%; width: 50%">';
    html += '<div class="AEtext" style="font-size: 14px; text-align: left; font-weight: 500; left: 12px; top: 19px;">Reel</div>';
    html += '<div class="AEbuttonB" id="titleBox" style="left: 8px; right: 0;  top: 36px; height: 24px;">';
    html += '<span id="titleName" style="position:relative;top:4px;left:6px;">Reel name</span></div>';
    html += '</div>';
    html += '<div class="container" style="right: 0px; top: 0; height: 100%; width: 50%">';
    html += '<div class="AEtext" style="font-size: 14px; text-align: left; font-weight: 500; left: 8px;  top: 19px;">Mix</div>';
    html += '<div class="AEbuttonB" id="versionBox" style="left: 4px; right: 8px; top: 36px; height: 24px;">';
    html += '<span id="versionName" style="position:relative;top:4px;left:6px;">Mix name</span></div>';
    html += '</div>';
    html += '</div>';
    html += '</div>';
    html += '<div class="container" style="right: 0; top: 0; width: 323px; height: 100%;">';
    html +=             '<div id="mtcPanel">';
    html +=             '<div class="AEtext" style="font-size: 14px; text-align: center; font-weight: 500; top: 4px; left: 0px; width: 58px; color: #FFCC00">FPS</div>';
    html +=             '<div class="AEtext" id="FPS" style="font-size: 20px; text-align: center; font-weight: 600; top: 20px; left: 0px; width: 58px; color: #FFCC00">25</div>';
    html +=         '<td id="mtcData"><table id="mtcCells">';
    html +=             '<tr>';
    html +=                 '<td class="mtcDigit" id="HH1">0</td>';
    html +=                 '<td class="mtcDigit"  id="HH0">0</td>';
    html +=                 '<td class="separator">:</td>';
    html +=                 '<td class="mtcDigit"  id="MM1">0</td>';
    html +=                 '<td class="mtcDigit"  id="MM0">0</td>';
    html +=                 '<td class="separator">:</td>';
    html +=                 '<td class="mtcDigit"  id="SS1">0</td>';
    html +=                 '<td class="mtcDigit"  id="SS0">0</td>';
    html +=                 '<td class="separator">:</td>';
    html +=                 '<td class="mtcDigit"  id="FF1">0</td>';
    html +=                 '<td class="mtcDigit"  id="FF0">0</td>';
    html +=             '</tr>';
    html +=         '</table></td>';
    html +=             '</div>';
    html +=             '<div id="clock">';
    html +=                 '<div class="clockPointers" id="clockFrame"></div>';
    html +=                 '<div class="clockPointers" id="clockSec"></div>';
    html +=                 '<div class="clockPointers" id="clockMin"></div>';
    html +=             '</div>';
    html += '</div>';
    html += '</header>';
    html += '<div id="mainGUI"></div>';
    html += '<footer id="footer">';   
    html += '</footer>'; 
    appSpace.innerHTML = html;
}

function buildNetworkPrefs (option, callback){   

    var appSpace = document.getElementById("mainGUI");
    var wrapper = document.createElement('div');
    var header1 = document.createElement('div');
    var label1 = document.createElement('span');
    var label2 = document.createElement('span');
    var label3 = document.createElement('span');
    var label4 = document.createElement('span');
    var inputBox1 = document.createElement('input');
    var inputBox2 = document.createElement('input');
    var inputBox3 = document.createElement('input');
    var inputBox4 = document.createElement('input');
    var button1 = document.createElement('button');
    var button2 = document.createElement('button');
    var button3 = document.createElement('button');
    
    wrapper.id = "defaultWrapper";
    
    header1.className = "defaultHeader";
    header1.style.left = "20px";
    header1.style.top= "10px";
    header1.innerHTML = "Network Preferences";
    
    label1.className = "defaultLabel";
    label1.style.left= "0px";
    label1.style.width= "290px";
    label1.style.top= "100px";
    label1.innerHTML = "Server IP address";
    
    inputBox1.className = "defaultInput";
    inputBox1.style.left = "300px";
    inputBox1.style.top = "100px";
    inputBox1.style.width = "220px";
    inputBox1.value = option.serverIP;
    
    button1.className = "defaultButton";
    button1.innerHTML = "Connect";
    button1.style.top = "100px";
    button1.style.left = "540px";
    button1.addEventListener('click', function(){
        callback("tryConnect", inputBox1.value);
    }, false);
    
    label2.className = "defaultLabel";
    label2.style.left= "0px";
    label2.style.width= "290px";
    label2.style.top= "160px";
    label2.innerHTML = "IP Base";
    
    inputBox2.className = "defaultInput";
    inputBox2.style.left = "300px";
    inputBox2.style.top= "160px";
    inputBox2.style.width = "220px";
    
    button2.className = "defaultButton";
    button2.innerHTML = "Scan Network";
    button2.style.top = "160px";
    button2.style.left = "540px";

    // Login

    label3.className = "defaultLabel";
    label3.style.left= "0px";
    label3.style.width= "290px";
    label3.style.top= "260px";
    label3.innerHTML = "Username";
    
    inputBox3.className = "defaultInput";
    inputBox3.style.left = "300px";
    inputBox3.style.top= "260px";
    inputBox3.style.width = "220px";
    inputBox3.value = option.name;

    label4.className = "defaultLabel";
    label4.style.left= "0px";
    label4.style.width= "290px";
    label4.style.top= "320px";
    label4.innerHTML = "Password";
    
    inputBox4.className = "defaultInput";
    inputBox4.style.left = "300px";
    inputBox4.style.top= "320px";
    inputBox4.style.width = "220px";
    inputBox4.value = option.password;
    
    button3.className = "defaultButton";
    button3.innerHTML = "Login";
    button3.style.top = "320px";
    button3.style.left = "540px";
    button3.addEventListener('click', function(){
        callback("login", {
            "name"      : inputBox3.value,
            "password"  : inputBox4.value
        });
    }, false);
    
    wrapper.appendChild(header1);
    wrapper.appendChild(label1);
    wrapper.appendChild(inputBox1);
    wrapper.appendChild(button1);
    wrapper.appendChild(label2);
    wrapper.appendChild(inputBox2);
    wrapper.appendChild(button2);

    wrapper.appendChild(label3);
    wrapper.appendChild(inputBox3);
    wrapper.appendChild(label4);
    wrapper.appendChild(inputBox4);
    wrapper.appendChild(button3);
    
    appSpace.appendChild(wrapper);
}
    
function buildMainGUI_old (autoMode){
    var versionHi = 0;
    var versionLo = 0;
    var build = 1;
    
    var versionText = '' + versionHi + '.' + versionLo + '.' + build;
    var html = '';
    html += '<header>';
    
    html += '<div id="logo"></div>';
    
    html += '<div class="container" style="left: 44px; top: 0px; width: 180px; height: 100%;">';
    html += '<div class="AEline" style="left: 0px; top: 14px; width: 180px;"></div>';
    html += '<div class="AEtext" style="font-size: 14px; text-align: center; font-weight: 600; top: 18px; width:180px;">AUTOMAN SW96 REMOTE</div>';
    html += '<div class="AEbuttonA" id="fileButton" style="left: 0px; top: 36px; height: 24px; width: 44px; z-index: 100;">';
    html += '<span style="position:relative;top:4px;left:6px;">File</span><div class="AEcorner"></div></div>';
    html += '<div class="AEbuttonA" id="modeButton" style="left: 48px; top: 36px; height: 24px; width: 57px; z-index: 100;">';
    html += '<span style="position:relative;top:4px;left:6px;">Mode</span><div class="AEcorner"></div></div>';
    html += '<div class="AEbuttonA" id="optionsButton" style="left: 109px; top: 36px; height: 24px; width: 71px; z-index: 100;">';
    html += '<span style="position:relative;top:4px;left:6px;">Options</span><div class="AEcorner"></div></div>';
    html += '</div>';
    
    html += '<div class="container" style="left: 224px; right: 323px; top: 0; height: 100%;">';
    html += '<div class="AEline" style="left: 8px; right: 8px; top: 14px;"></div>';
    html += '<div class="container" style="left: 0px; top: 0; height: 100%; width: 50%">';
    html += '<div class="AEtext" style="font-size: 14px; text-align: left; font-weight: 500; left: 12px; top: 19px;">Reel</div>';
    html += '<div class="AEbuttonB" id="titleBox" style="left: 8px; right: 0;  top: 36px; height: 24px;">';
    html += '<span id="titleName" style="position:relative;top:4px;left:6px;">Reel name</span></div>';
    html += '</div>';
    html += '<div class="container" style="right: 0px; top: 0; height: 100%; width: 50%">';
    html += '<div class="AEtext" style="font-size: 14px; text-align: left; font-weight: 500; left: 8px;  top: 19px;">Mix</div>';
    html += '<div class="AEbuttonB" id="versionBox" style="left: 4px; right: 8px; top: 36px; height: 24px;">';
    html += '<span id="versionName" style="position:relative;top:4px;left:6px;">Mix name</span></div>';
    html += '</div>';
    html += '</div>';
    html += '</div>';
    html += '<div class="container" style="right: 0; top: 0; width: 323px; height: 100%;">';
    html +=             '<div id="mtcPanel">';
    html +=             '<div class="AEtext" style="font-size: 14px; text-align: center; font-weight: 500; top: 4px; left: 0px; width: 58px; color: #FFCC00">FPS</div>';
    html +=             '<div class="AEtext" id="FPS" style="font-size: 20px; text-align: center; font-weight: 600; top: 20px; left: 0px; width: 58px; color: #FFCC00">25</div>';
    html +=         '<td id="mtcData"><table id="mtcCells">';
    html +=             '<tr>';
    html +=                 '<td class="mtcDigit" id="HH1">0</td>';
    html +=                 '<td class="mtcDigit"  id="HH0">0</td>';
    html +=                 '<td class="separator">:</td>';
    html +=                 '<td class="mtcDigit"  id="MM1">0</td>';
    html +=                 '<td class="mtcDigit"  id="MM0">0</td>';
    html +=                 '<td class="separator">:</td>';
    html +=                 '<td class="mtcDigit"  id="SS1">0</td>';
    html +=                 '<td class="mtcDigit"  id="SS0">0</td>';
    html +=                 '<td class="separator">:</td>';
    html +=                 '<td class="mtcDigit"  id="FF1">0</td>';
    html +=                 '<td class="mtcDigit"  id="FF0">0</td>';
    html +=             '</tr>';
    html +=         '</table></td>';
    html +=             '</div>';
    html +=             '<div id="clock">';
    html +=                 '<div class="clockPointers" id="clockFrame"></div>';
    html +=                 '<div class="clockPointers" id="clockSec"></div>';
    html +=                 '<div class="clockPointers" id="clockMin"></div>';
    html +=             '</div>';
    html += '</div>';
    html += '</header>';
    html += '<div id="mainGUI"></div>';
    html += '<footer id="footer">';   
    html += '</footer>';     
    return html;
}

function buildAutomationWindow (){
    
    var html = '';
    html += '<div id="autoWrapper" style="width: '+app.wrapper.width+'px">';
    html +=     '<div id="autoStatusWrapper">';
    html +=         '<div id="autoStatusHeader">';
    html +=         '<div id="zoom1" class="zoomButton" onclick="setZoom(0.1);">0.1</div>';
    html +=         '<div id="zoom2" class="zoomButton" onclick="setZoom(0.5);">0.5</div>';
    html +=         '<div id="zoom3" class="zoomButton" onclick="setZoom(1.0);">1x</div>';
    html +=         '<div id="zoom4" class="zoomButton" onclick="setZoom(2.0);">2x</div>';
    html +=         '<div id="zoom5" class="zoomButton" onclick="setZoom(5.0);">5x</div>';
    html +=         '</div>';
    html +=         '<div id="autoStatusCrop">';
    html +=         '   <div id="autoStatuses"></div>';
    html +=         '</div>';
    html +=     '</div>';
    
    html +=     '<div id="autoTimelineWrapper">';
    html +=         '<canvas id="autoRuler" width="'+timeLine.width+'" height="17"></canvas>';
    html +=         '<div id="autoTracksCrop" style="width: '+timeLine.width+'px">';
    html +=         '   <div id="autoTracks" style="width: '+timeLine.width+'px"></div>';
    html +=         '</div>';
    html +=     '</div>';
    html +=     '<div id="autoFaders"  style="width: '+app.wrapper.width+'px"></div>';
    html += '</div>';
    

    return html;
}

function buildStatuses (){
    var html = '';
    for(n=0;n<cv96.numOfTracks;n++){
        var trackNo = (n+1);
        var trackNoSize = timeLine.trackHeight-2;
        var statusWidth = 130-timeLine.trackHeight-2;
        var statusHeight = (timeLine.trackHeight/2)-2;
        var statusTop = (timeLine.trackHeight/2);
        html += '<div id="statusBox'+n+'" class="statusBox" style="width:130px; height:'+(timeLine.trackHeight)+'px;">';
        html += '<div id="statusTrackNo'+n+'" class="statusTrackNo" style="right:0px; width:'+(trackNoSize)+'px; height:'+(trackNoSize)+'px;"  onselectstart="return false">'+trackNo+'</div>';
        html += '<div id="statusTrackStatus'+n+'" class="statusTrackStatus" style="cursor:pointer; width:'+(statusWidth)+'px; height:'+(statusHeight)+'px;"></div>';
        html += '<div id="statusTrackLevel'+n+'" class="statusTrackLevel" style="top:'+(statusTop)+'px; width:'+(statusWidth)+'px; height:'+(statusHeight)+'px;"></div>';
        html += '</div>';
    }
    return html;
}

function buildFaderBanks (){
    
    var html = '';
 //   html += '<div id="faderBankHighLite" style="position: absolute; width:160px; height:138px; left:2px; top:22px; z-index:1;"></div>';
    html += '<div id="faderBanksDiv"width="'+app.wrapper.width+'" height="162"style="z-index:2;">';
    html += '<canvas id="bankHighLite" style="position: absolute; left:0px; top:0px;"  width="'+app.wrapper.width+'" height="162"style="z-index:3;"></canvas>';
    html += '<canvas id="faderBanks" style="position: absolute; left:0px; top:0px;"  width="'+app.wrapper.width+'" height="162"style="z-index:4;"></canvas>';
    html += '</div>';
    return html;
}

function autoTabs(){
        var html = '';
        html += '<div id="banks">';
        html += '<div class="bankButton" id="region0" onclick="showSSLstatus();">Something</div>';
        html += '<div class="bankButton" id="region1">Else</div>';
        html += '<div class="bankButton" id="region2">Finally</div>';
        html += '</div>';
    return html;
}

function recallTabs(){
        var html = '';
        html += '<div id="banks">';
        html += '<div class="bankButton" id="tab0" onclick="recallTabClick(this);">Routing</div>';
        html += '<div class="bankButton" id="tab1" onclick="recallTabClick(this);">Input / Dyn</div>';
        html += '<div class="bankButton" id="tab2" onclick="recallTabClick(this);">EQ</div>';
        html += '<div class="bankButton" id="tab3" onclick="recallTabClick(this);">Sends</div>';
        html += '<div class="bankButton" id="tab4" onclick="recallTabClick(this);">Small</div>';
        html += '<div class="bankButton" id="tab5" onclick="recallTabClick(this);">VCA</div>';
        html += '</div>';
    return html;
}

function recallBankOverlay(dir){
    
    var overlay = document.createElement('div');
        overlay.id     = "bankLeft";
        overlay.style.width = "200px";
        overlay.style.height = "400px";
        overlay.style.zIndex   = 100;
        overlay.style.position = "absolute";
        overlay.style.backgroundPosition = "25px 50px";
        overlay.style.backgroundRepeat = "no-repeat";
        overlay.style.top = "75px";
        overlay.style.border = "none";
        overlay.style.cursor = "pointer";
        overlay.style.opacity = "0.5";
        
        overlay.addEventListener("mouseleave",function() {
            this.style.backgroundImage = "none";
            leftFlag = 0;
            rightFlag = 0;
        });
        
        if(dir===0){     // left
            overlay.style.left = "20px";
            overlay.addEventListener("click",function() {
                if(properties.recall.activeBank>0) shiftBank(-1);
            });
            overlay.addEventListener("mouseover",function() {
                if(properties.recall.activeBank>0) this.style.backgroundImage = "url('img/left.png')";
                leftFlag = 1;
            });
            if(leftFlag) overlay.style.backgroundImage = "url('img/left.png')";
            
        }else{          // right
            overlay.style.right = "20px";
            overlay.addEventListener("click",function() {
                if(properties.recall.activeBank<(cv96.numOfBanks-1)) shiftBank(1);
            });
            overlay.addEventListener("mouseover",function() {
                if(properties.recall.activeBank<(cv96.numOfBanks-1)) this.style.backgroundImage = "url('img/right.png')";
                rightFlag = 1;
            });
            if(rightFlag) overlay.style.backgroundImage = "url('img/right.png')";
        }
        return overlay;
}

function createCanvas(id,x,y,w,h){
    var cvs = document.createElement('canvas');
    cvs.id                            = id;
    cvs.style.position                = "absolute";
    cvs.style.left                    = ""+x+"px";
    cvs.style.top                     = ""+y+"px";
    cvs.width                         = w;
    cvs.height                        = h;
    return cvs;
}
function createHorizButton(preId,id){
    var button = document.createElement('div');
    button.id                            = "switch"+preId+id;
    button.className                     = "horizButton off";
    button.style.left                    = ""+elementCoord[id].x+"px";
    button.style.top                     = ""+elementCoord[id].y+"px";
    return button;
}
function createKnobDiv(left, top){
    var div = document.createElement('div');
    div.className                     = "pot";
    div.style.position                      = "absolute";
    div.style.left                    = ""+left+"px";
    div.style.top                     = ""+top+"px";
    return div;
}

//var elemArray = [];
function recallTemplate(bank){
    document.getElementById("mainGUI").innerHTML = "";
    for(chn=0;chn<8;chn++){
        var m = (chn) * 5;
        var realChn = chn +((bank)*8);
        var channel = document.createElement('div');
        
        channel.id                            = "strip"+chn;
        channel.className                     = "channelStrip";               
        var id='';
 
        var chnLabel = document.createElement('div');
        var chnLabelText = document.createElement('p');
        var text = document.createTextNode(""+(realChn+1)+"");
        
        chnLabelText.appendChild(text);
        chnLabel.className = "chnNo";
        chnLabel.appendChild(chnLabelText);

        channel.appendChild(chnLabel);
        document.getElementById("mainGUI").appendChild(channel);
      }
    if(!document.getElementById("recallCanvas")){
        var recallCvs = createCanvas("recallCanvas",0,0,(chnWidth*8),610);
        recallCvs.style.left = "12px";
        recallCvs.style.right = "12px";
    //    recallCvs.style.width = "1010px";
        document.getElementById("mainGUI").appendChild(recallCvs);           
    }    
    else{
        clearCanvas();
    }
    
    
}

function clearCanvas(){
    if(document.getElementById("recallCanvas")){
        var cvs = document.getElementById("recallCanvas");
        var ctx = cvs.getContext("2d");
        ctx.clearRect(0,0,(chnWidth*8),610);
    }
}

function showRouting (bank){
        for(var chn=0;chn<8;chn++){
            drawKnob(getElementArgs(0x11,chn));
            drawButton(getElementArgs(0x31,chn));
            for(var no=0;no<35;no++){
                drawRoutingButton(getElementArgs(trAddress[no+1],chn)); 
            }      
            drawRoutingButton(getElementArgs(trAddress[36],chn)); 
        } 
}


function showDyn (bank){
        for(var chn=0;chn<8;chn++){
            drawKnob(getElementArgs(0x61,chn));
            drawKnob(getElementArgs(0x2e,chn));
            drawKnob(getElementArgs(0x6e,chn));
            drawKnob(getElementArgs(0x1e,chn));
            drawKnob(getElementArgs(0x3e,chn));
            drawKnob(getElementArgs(0x7e,chn));
            drawKnob(getElementArgs(0x49,chn));
            drawKnob(getElementArgs(0x69,chn));
            
            drawButton(getElementArgs(0x05,chn));
            drawButton(getElementArgs(0x51,chn));
            drawButton(getElementArgs(0x21,chn));
            drawButton(getElementArgs(0x71,chn));
            drawButton(getElementArgs(0x5e,chn));
            drawButton(getElementArgs(0x29,chn));
            drawButton(getElementArgs(0x3a,chn));
            drawButton(getElementArgs(0x0e,chn));
            drawButton(getElementArgs(0x01,chn));
        } 
}

function showEq (bank){
        for(var chn=0;chn<8;chn++){
            drawKnob(getElementArgs(0x76,chn));
            drawKnob(getElementArgs(0x36,chn));
            drawKnob(getElementArgs(0x56,chn));
            drawKnob(getElementArgs(trAddress[64],chn));
            drawKnob(getElementArgs(trAddress[65],chn));
            drawKnob(getElementArgs(trAddress[66],chn));
            drawKnob(getElementArgs(trAddress[67],chn));
            drawKnob(getElementArgs(trAddress[70],chn));
            drawKnob(getElementArgs(trAddress[71],chn));
            drawKnob(getElementArgs(trAddress[72],chn));
            drawKnob(getElementArgs(trAddress[73],chn));
            drawKnob(getElementArgs(trAddress[74],chn));
            drawButton(getElementArgs(trAddress[61],chn));
            drawButton(getElementArgs(trAddress[62],chn));
            drawButton(getElementArgs(trAddress[68],chn));
            drawButton(getElementArgs(trAddress[69],chn));
            drawButton(getElementArgs(trAddress[75],chn));
            drawButton(getElementArgs(trAddress[76],chn));
            drawButton(getElementArgs(trAddress[77],chn));
            drawButton(getElementArgs(trAddress[78],chn));
        } 
}
function showSend (bank){
        for(var chn=0;chn<8;chn++){
            drawKnob(getElementArgs(0x52,chn));
            drawKnob(getElementArgs(0x22,chn));
            drawKnob(getElementArgs(0x14,chn));
            drawKnob(getElementArgs(0x0c,chn));
            drawKnob(getElementArgs(0x1c,chn));
            drawKnob(getElementArgs(0x70,chn));
            drawButton(getElementArgs(0x12,chn));
            drawButton(getElementArgs(0x62,chn));
            drawButton(getElementArgs(0x02,chn));
            drawButton(getElementArgs(0x38,chn));
            drawButton(getElementArgs(0x78,chn));
            drawButton(getElementArgs(0x2c,chn));
            drawButton(getElementArgs(0x6c,chn));
            drawButton(getElementArgs(0x3c,chn));
            drawButton(getElementArgs(0x50,chn));
            drawButton(getElementArgs(0x10,chn));
        } 
}
function showSmall (bank){
        for(var chn=0;chn<8;chn++){
            drawKnob(getElementArgs(0x68,chn));
            drawKnob(getElementArgs(0x44,chn));
            drawButton(getElementArgs(0x60,chn));
            drawButton(getElementArgs(0x40,chn));
            drawButton(getElementArgs(0x28,chn));
            drawButton(getElementArgs(0x08,chn));
            drawButton(getElementArgs(0x24, chn));
            drawButton(getElementArgs(0x20, chn));
            if (!trSettings.sixk) drawButton(getElementArgs(0x04, chn));
            drawFader(getElementArgs(0x18,chn));
            
            // Ready Group
            drawButton(getElementArgs(0x48, chn));
            // Ready Tape
            drawButton(getElementArgs(0x58, chn));
            // VCA Cut
            drawButton(getElementArgs(0x74, chn));
            // Rec Arm
            drawButton(getElementArgs(0x80, chn));
            // Big Pan
            drawKnob(getElementArgs(0x64, chn));
        } 
  /*  

    channel+='<div class="thumbNo" id="group'+chn+':'+id+0x3B+'" style="left: 11px; top: 502px;">'+chn+'</div>';
    channel+='<div class="thumbUp" id="upGroupAlert'+chn+':'+id+0x3B+'" style="left: 27px; top: 505px;"></div>';
    channel+='<div class="thumbDown" id="downGroupAlert'+chn+':'+id+0x3B+'" style="left: 27px; top: 534px;"></div>';
*/
}
function showVca (bank){
    
    var allChannels="";
    for(chn=0;chn<8;chn++){
        var m = (chn) * 5;
        var no = 0;
        var realChn = chn +((bank)*8);
        var channel = '<div class="channelStrip" id="strip'+chn+'">';
        var p, q;
        var id='';

    channel+='<div class="slot" style="left: 56px; top: 50px; height: 480px;"></div>';
    channel+='<div class="smallFaderAlert" id="vcaFaderAlert'+id+'" style="left: 34px; top: 204px;"></div>';
    channel+='<div class="smallFader" id="vcaFader'+id+'" style="left: 44px; top: 208px;"></div>';

        channel+='<div class="chnNo">';
        channel+='<p>'+(realChn+1)+'</p>';
        channel+='</div>';
        channel+='</div>';

        allChannels+=channel;
    }
  document.getElementById("mainGUI").innerHTML = allChannels;
}

var mtcDisplay = new function() {
    this.fps = function (value){
        document.getElementById("FPS").innerHTML = value;
    };
    this.hour = function (value){
        document.getElementById("HH1").innerHTML = Math.floor(value/10);
        document.getElementById("HH0").innerHTML = value%10;
    };
    this.min = function (value){
        document.getElementById("MM1").innerHTML = Math.floor(value/10);
        document.getElementById("MM0").innerHTML = value%10;
   //     rotateAnimation("clockMin",value*(6));
    };
    this.sec = function (value){
        document.getElementById("SS1").innerHTML = Math.floor(value/10);
        document.getElementById("SS0").innerHTML = value%10;
   //     rotateAnimation("clockSec",value*(6));
    };
    this.frame = function (value){
        document.getElementById("FF1").innerHTML = Math.floor(value/10);
        document.getElementById("FF0").innerHTML = value%10;
   //     rotateAnimation("clockFrame",value*(360/(timeCode.fps)));
    };
};

  function drawKnob(args){
    var cvs = document.getElementById("recallCanvas");
    var ctx = cvs.getContext("2d");
    var lineW = 5;
    var knobsize = 18;
    var matchTolerance = 3;
    var backG = "#333";
    
    var x = knobsize + lineW + elementCoord[args.guiIndex].x + ((args.chn%8)*chnWidth) - 3;
    var y = knobsize + lineW + elementCoord[args.guiIndex].y - 3;
    var glow = Math.abs((args.potAngle - args.potRingAngle)/matchTolerance);  
    
    if(args.guiIndex==0x64) knobsize = 22; 
    // drawKnob args
    // id
    // angle of marker (0 is right, 270 up, etc..)
    // angle of target - if left out (no ring)
    
    // Knob marker coords
    Math.TAU = 2 * Math.PI;
    var hArmRadians = Math.TAU * (args.potAngle / 360);
    var hArmStart = 3;
    var hArmLength = knobsize + 1;
    var startX = (x) + Math.cos(hArmRadians - (Math.TAU)) * hArmStart;
    var startY = (y) + Math.sin(hArmRadians - (Math.TAU)) * hArmStart;
    var targetX = (x) + Math.cos(hArmRadians - (Math.TAU)) * hArmLength;
    var targetY = (y) + Math.sin(hArmRadians - (Math.TAU)) * hArmLength;
    
    // clear area
    ctx.clearRect(x-(knobsize)-(lineW)-1,y-(knobsize)-(lineW)-1,(knobsize*2)+(lineW*2)+1,(knobsize*2)+(lineW*2)+1);
    
    // do filled circle
    ctx.beginPath();
    ctx.lineWidth = 1;
    ctx.strokeStyle = elementCoord[args.guiIndex].color[args.switchState];
    ctx.arc(x, y, knobsize, 0 ,2*Math.PI);
    ctx.fillStyle = elementCoord[args.guiIndex].color[args.switchState];
    ctx.fill();
    ctx.stroke();  
    
    // do knob marker
    ctx.beginPath();
    ctx.lineWidth = lineW;
    if(glow < 1 || args.switchState == 2) ctx.strokeStyle = backG;
    else ctx.strokeStyle = "#ffcc00";
    ctx.moveTo(startX,startY);
    ctx.lineTo(targetX,targetY);
    ctx.stroke();
    
    // target ring
    if(glow>1 && (args.switchState != 2)) 
    {
      var glowColor = 'rgba(255,204,0,'+(glow/matchTolerance)+')'
      ctx.beginPath();
      ctx.lineWidth = lineW;
      ctx.strokeStyle = glowColor;
      if (elementCoord[args.guiIndex].orientation == 'up') {
        if (args.potRingAngle >= 270 || args.potRingAngle <= 90) ctx.arc(x, y, (knobsize+(lineW/2)), degToRad(270), degToRad(args.potRingAngle));
        else ctx.arc(x, y, (knobsize+(lineW/2)), degToRad(args.potRingAngle), degToRad(270));
      }
      else if (elementCoord[args.guiIndex].orientation == 'down') {
        if (args.potRingAngle >= 270 || args.potRingAngle <= 90) ctx.arc(x, y, (knobsize+(lineW/2)), degToRad(args.potRingAngle), degToRad(90));
        else ctx.arc(x, y, (knobsize+(lineW/2)), degToRad(90), degToRad(args.potRingAngle));
      }
      else if (elementCoord[args.guiIndex].orientation == 'left') {
        if (args.potRingAngle >= 180) ctx.arc(x, y, (knobsize+(lineW/2)), degToRad(180), degToRad(args.potRingAngle));
        else ctx.arc(x, y, (knobsize+(lineW/2)), degToRad(args.potRingAngle), degToRad(180));
      }
      else if (elementCoord[args.guiIndex].orientation == 'right') {
        if (args.potRingAngle >= 180) ctx.arc(x, y, (knobsize+(lineW/2)), degToRad(args.potRingAngle), degToRad(360));
        else ctx.arc(x, y, (knobsize+(lineW/2)), degToRad(0), degToRad(args.potRingAngle));
      }
      else if (elementCoord[args.guiIndex].orientation == 'volume') {
        ctx.arc(x, y, (knobsize+(lineW/2)), degToRad(130), degToRad(args.potRingAngle));
      }  
      else if (elementCoord[args.guiIndex].orientation == 'reversed') {
        ctx.arc(x, y, (knobsize+(lineW/2)), degToRad(args.potRingAngle), degToRad(50));
      }   
      ctx.stroke();
    }
  } 
               
  function drawButton(args){
                        console.log("drawButton");
    var cvs = document.getElementById("recallCanvas");
    ctx = cvs.getContext("2d");
    var x = elementCoord[args.guiIndex].x + ((args.chn%8)*chnWidth);
    var y = elementCoord[args.guiIndex].y;
    var w = elementCoord[args.guiIndex].size[0];
    var h = elementCoord[args.guiIndex].size[1];
    // 
    ctx.fillStyle = elementCoord[args.guiIndex].color[args.switchState];
    ctx.fillRect(x,y,w,h);
    if(args.guiIndex == 0x80){
        ctx.font = "bold 30px Arial";
        ctx.fillStyle = "#333";
        ctx.textAlign = "center";
        var realChn = properties.recall.activeBank*8 + args.chn + 1;
        ctx.fillText(realChn,x+(w/2),y+30);
    }
 }                
  function drawRoutingButton(args){ 
    var cvs = document.getElementById("recallCanvas");
    ctx = cvs.getContext("2d");
    var x = elementCoord[args.guiIndex].x + ((args.chn%8)*chnWidth);
    var y = elementCoord[args.guiIndex].y;
    
    if(x+y==0)console.log("id "+args.guiIndex);
    // do filled circle
    ctx.clearRect(x-6,y-6,12,12);
    ctx.beginPath();
    ctx.lineWidth = 1;
    ctx.strokeStyle = elementCoord[args.guiIndex].color[args.switchState];
    ctx.arc(x, y, 9, 0 ,2*Math.PI);
    ctx.fillStyle = elementCoord[args.guiIndex].color[args.switchState];
    ctx.fill();
    ctx.stroke(); 
  }                
  function drawFader(args){
    var cvs = document.getElementById("recallCanvas");
    ctx = cvs.getContext("2d");
    if(args.currentValue == null) args.currentValue = 0;
    var x = elementCoord[args.guiIndex].x + ((args.chn%8)*chnWidth);
    var y = elementCoord[args.guiIndex].y + (160-(args.currentValue/3.3));
       // clear area
    ctx.clearRect(x,170,40,426);
    ctx.fillStyle = "#222";
    ctx.fillRect(x+12,202,8,270);
    ctx.drawImage(faderImage,x,y);
  } 
  
  function degToRad(degrees) {
    return (Math.PI / 180) * degrees
  }
  
  /***************************/
  // Recall Object Parameters
  /***************************/
  
  function setElementCoords (){
      
      var leftColumn = 11;
      var rightColumn = 71;
      
      for(var i = 0;i<255;i++){
         elementCoord[i]={
             "x":0,
             "y":0,
             "orientation":0,
             "color":"",
             "region":0,
             "size":[0,0],
             "text":false,
             "knobId":0
         } 
      }
        for (var i = 39; i < 59; i++) {
            elementCoord[trAddress[i]].region = 1;
        }
        for (var i = 59; i < 80; i++) {
            elementCoord[trAddress[i]].region = 2;
        }
        for (var i = 80; i < 101; i++) {
            elementCoord[trAddress[i]].region = 3;
        }
        for (var i = 101; i < 120; i++) {
            elementCoord[trAddress[i]].region = 4;
        }
      // Routing
      // Bus Pan knob
      elementCoord[0x11].x = leftColumn;
      elementCoord[0x11].y = 478;
      elementCoord[0x11].orientation = "up";
      elementCoord[0x11].color = ["#55f"];
      elementCoord[0x11].region = 0;
      // Bus Pan button
      elementCoord[0x31].x = rightColumn;
      elementCoord[0x31].y = 492;
      elementCoord[0x31].color = ["#999","#555","#ffcc00"];
      elementCoord[0x31].size = [40,20];
      elementCoord[0x31].region = 0;
      // Routing switches
      var no=0;
      for (var p = 0; p < 9; p++) {
          for (var q = 0; q < 4; q++) {
              var x = 20 + (q * 28);
              var y = 80 + (p * 45);
              elementCoord[trAddress[no + 1]].x = x;
              elementCoord[trAddress[no + 1]].y = y;
              elementCoord[trAddress[no + 1]].color = ["#999","#555","#ffcc00"];
              elementCoord[trAddress[no + 1]].region = 0;
              no++;
          }
      }   
      //
      // Dynamics
      // Flip button
      elementCoord[0x05].x = rightColumn;
      elementCoord[0x05].y = 43;
      elementCoord[0x05].color = ["#999","#555","#ffcc00"];
      elementCoord[0x05].size = [40,20];
      // Sub button
      elementCoord[0x51].x = rightColumn;
      elementCoord[0x51].y = 71;
      elementCoord[0x51].color = ["#999","#555","#ffcc00"];
      elementCoord[0x51].size = [40,20];
      // Phase button
      elementCoord[0x21].x = rightColumn;
      elementCoord[0x21].y = 99;
      elementCoord[0x21].color = ["#999","#555","#ffcc00"];
      elementCoord[0x21].size = [40,20];
      // 48 button
      elementCoord[0x71].x = rightColumn;
      elementCoord[0x71].y = 127;
      elementCoord[0x71].color = ["#999","#555","#ffcc00"];
      elementCoord[0x71].size = [40,20];
      // Line Knob
      elementCoord[0x61].x = leftColumn;
      elementCoord[0x61].y = 41;
      elementCoord[0x61].orientation = "up";
      elementCoord[0x61].color = ["#999","#555","#ffcc00"];
      // Mic Knob
      elementCoord[0x2e].x = leftColumn;
      elementCoord[0x2e].y = 97;
      elementCoord[0x2e].orientation = "volym";
      elementCoord[0x2e].color = ["#f55","#f55","#ffcc00"];
      //
      // Ratio
      elementCoord[0x6E].x = leftColumn;
      elementCoord[0x6E].y = 223;
      elementCoord[0x6E].orientation = "volume";
      elementCoord[0x6E].color = ["#999","#555","#ffcc00"];
      // Threshold
      elementCoord[0x1E].x = rightColumn;
      elementCoord[0x1E].y = 259;
      elementCoord[0x1E].orientation = "volume";
      elementCoord[0x1E].color = ["#999","#555","#ffcc00"];
      // Release
      elementCoord[0x3E].x = leftColumn;
      elementCoord[0x3E].y = 295;
      elementCoord[0x3E].orientation = "volume";
      elementCoord[0x3E].color = ["#999","#555","#ffcc00"];
      // Threshold
      elementCoord[0x7E].x = rightColumn;
      elementCoord[0x7E].y = 331;
      elementCoord[0x7E].orientation = "volume";
      elementCoord[0x7E].color = ["#5a5","#575","#ffcc00"];
      // Range
      elementCoord[0x49].x = leftColumn;
      elementCoord[0x49].y = 367;
      elementCoord[0x49].orientation = "volume";
      elementCoord[0x49].color = ["#5a5","#575","#ffcc00"];
      // Release
      elementCoord[0x69].x = leftColumn;
      elementCoord[0x69].y = 433;
      elementCoord[0x69].orientation = "volume";
      elementCoord[0x69].color = ["#5a5","#575","#ffcc00"];
      // Link button
      elementCoord[0x5e].x = rightColumn;
      elementCoord[0x5e].y = 221;
      elementCoord[0x5e].color = ["#999","#555","#ffcc00"];
      elementCoord[0x5e].size = [40,20];
      // Gate button
      elementCoord[0x29].x = rightColumn;
      elementCoord[0x29].y = 397;
      elementCoord[0x29].color = ["#999","#555","#ffcc00"];
      elementCoord[0x29].size = [40,20];
      // Ch in button
      elementCoord[0x3a].x = ((chnWidth/2)-10) - ((((chnWidth/2)-10)-leftColumn)*0.9);
      elementCoord[0x3a].y = 505;
      elementCoord[0x3a].color = ["#999","#555","#ffcc00"];
      elementCoord[0x3a].size = [20,40];
      // Ch out button
      elementCoord[0x0e].x = ((chnWidth/2)-10);
      elementCoord[0x0e].y = 505;
      elementCoord[0x0e].color = ["#999","#555","#ffcc00"];
      elementCoord[0x0e].size = [20,40];
      // Mon button
      elementCoord[0x01].x = ((chnWidth/2)-10) + ((((chnWidth/2)-10)-leftColumn)*0.9);
      elementCoord[0x01].y = 505;
      elementCoord[0x01].color = ["#999","#555","#ffcc00"];
      elementCoord[0x01].size = [20,40];
      //
      // EQ
      var space = 33;
      var top = 10;
      // Filter Knob
      elementCoord[0x76].x = rightColumn;
      elementCoord[0x76].y = top+(0*space);
      elementCoord[0x76].orientation = "up";
      elementCoord[0x76].color = ["#555","#555","#ffcc00"];
      // Filter Knob
      elementCoord[0x36].x = leftColumn;
      elementCoord[0x36].y = top+(1*space);
      elementCoord[0x36].orientation = "up";
      elementCoord[0x36].color = ["#555","#555","#ffcc00"];
      // Hi Knob
      elementCoord[0x56].x = leftColumn;
      elementCoord[0x56].y = top+(3*space);
      elementCoord[0x56].orientation = "up";
      elementCoord[0x56].color = ["#f55","#f55","#ffcc00"];
      // Hi Knob
      elementCoord[trAddress[64]].x = rightColumn;
      elementCoord[trAddress[64]].y = top+(4*space);
      elementCoord[trAddress[64]].orientation = "up";
      elementCoord[trAddress[64]].color = ["#f55","#f55","#ffcc00"];
      // Hi Mid Knob
      elementCoord[trAddress[65]].x = leftColumn;
      elementCoord[trAddress[65]].y = top+(5*space);
      elementCoord[trAddress[65]].orientation = "up";
      elementCoord[trAddress[65]].color = ["#5a5","#5a5","#ffcc00"];
      // Hi Mid Knob
      elementCoord[trAddress[66]].x = rightColumn;
      elementCoord[trAddress[66]].y = top+(6*space);
      elementCoord[trAddress[66]].orientation = "up";
      elementCoord[trAddress[66]].color = ["#5a5","#5a5","#ffcc00"];
      // Hi Mid Knob
      elementCoord[trAddress[67]].x = leftColumn;
      elementCoord[trAddress[67]].y = top+(7*space);
      elementCoord[trAddress[67]].orientation = "up";
      elementCoord[trAddress[67]].color = ["#5a5","#5a5","#ffcc00"];
      // Lo Mid Knob
      elementCoord[trAddress[70]].x = leftColumn;
      elementCoord[trAddress[70]].y = top+(9*space);
      elementCoord[trAddress[70]].orientation = "up";
      elementCoord[trAddress[70]].color = ["#55f","#55f","#ffcc00"];
      // Lo Mid Knob
      elementCoord[trAddress[71]].x = rightColumn;
      elementCoord[trAddress[71]].y = top+(10*space);
      elementCoord[trAddress[71]].orientation = "up";
      elementCoord[trAddress[71]].color = ["#55f","#55f","#ffcc00"];
      // Lo Mid Knob
      elementCoord[trAddress[72]].x = leftColumn;
      elementCoord[trAddress[72]].y = top+(11*space);
      elementCoord[trAddress[72]].orientation = "up";
      elementCoord[trAddress[72]].color = ["#55f","#55f","#ffcc00"];
      // Lo Knob
      elementCoord[trAddress[73]].x = rightColumn;
      elementCoord[trAddress[73]].y = top+(12*space);
      elementCoord[trAddress[73]].orientation = "up";
      elementCoord[trAddress[73]].color = ["#55f","#55f","#ffcc00"];
      // Lo Knob
      elementCoord[trAddress[74]].x = leftColumn;
      elementCoord[trAddress[74]].y = top+(13*space);
      elementCoord[trAddress[74]].orientation = "up";
      elementCoord[trAddress[74]].color = ["#555","#555","#ffcc00"];
      // Split button
      elementCoord[trAddress[61]].x = rightColumn;
      elementCoord[trAddress[61]].y = 72;
      elementCoord[trAddress[61]].color = ["#999","#555","#ffcc00"];
      elementCoord[trAddress[61]].size = [40,20];
      // X3 button
      elementCoord[trAddress[62]].x = rightColumn;
      elementCoord[trAddress[62]].y = 111;
      elementCoord[trAddress[62]].color = ["#999","#555","#ffcc00"];
      elementCoord[trAddress[62]].size = [40,20];
      // Pre button
      elementCoord[trAddress[68]].x = rightColumn;
      elementCoord[trAddress[68]].y = 274;
      elementCoord[trAddress[68]].color = ["#999","#555","#ffcc00"];
      elementCoord[trAddress[68]].size = [40,20];
      // In button
      elementCoord[trAddress[69]].x = rightColumn;
      elementCoord[trAddress[69]].y = 304;
      elementCoord[trAddress[69]].color = ["#999","#555","#ffcc00"];
      elementCoord[trAddress[69]].size = [40,20];
      // /3 button
      elementCoord[trAddress[75]].x = rightColumn;
      elementCoord[trAddress[75]].y = 470;
      elementCoord[trAddress[75]].color = ["#999","#555","#ffcc00"];
      elementCoord[trAddress[75]].size = [40,20];
      // Ch in button
      elementCoord[trAddress[76]].x = ((chnWidth/2)-10) - ((((chnWidth/2)-10)-leftColumn)*0.9);
      elementCoord[trAddress[76]].y = 505;
      elementCoord[trAddress[76]].color = ["#999","#555","#ffcc00"];
      elementCoord[trAddress[76]].size = [20,40];
      // Ch out button
      elementCoord[trAddress[77]].x = ((chnWidth/2)-10);
      elementCoord[trAddress[77]].y = 505;
      elementCoord[trAddress[77]].color = ["#999","#555","#ffcc00"];
      elementCoord[trAddress[77]].size = [20,40];
      // Mon button
      elementCoord[trAddress[78]].x = ((chnWidth/2)-10) + ((((chnWidth/2)-10)-leftColumn)*0.9);
      elementCoord[trAddress[78]].y = 505;
      elementCoord[trAddress[78]].color = ["#999","#555","#ffcc00"];
      elementCoord[trAddress[78]].size = [20,40];
      //
      // Sends
      // Send Pan
      elementCoord[0x52].x = leftColumn;
      elementCoord[0x52].y = 57;
      elementCoord[0x52].orientation = "up";
      elementCoord[0x52].color = ["#55f","#55f","#ffcc00"];
      // Send
      elementCoord[0x22].x = leftColumn;
      elementCoord[0x22].y = 137;
      elementCoord[0x22].orientation = "volume";
      elementCoord[0x22].color = ["#555","#999","#ffcc00"];
      // Send
      elementCoord[0x14].x = leftColumn;
      elementCoord[0x14].y = 217;
      elementCoord[0x14].orientation = "volume";
      elementCoord[0x14].color = ["#555","#999","#ffcc00"];
      // Send
      elementCoord[0x0c].x = leftColumn;
      elementCoord[0x0c].y = 297;
      elementCoord[0x0c].orientation = "volume";
      elementCoord[0x0c].color = ["#555","#999","#ffcc00"];
      // Send
      elementCoord[0x1c].x = leftColumn;
      elementCoord[0x1c].y = 377;
      elementCoord[0x1c].orientation = "volume";
      elementCoord[0x1c].color = ["#555","#999","#ffcc00"];
      // Send
      elementCoord[0x70].x = leftColumn;
      elementCoord[0x70].y = 457;
      elementCoord[0x70].orientation = "volume";
      elementCoord[0x70].color = ["#555","#999","#ffcc00"];
      // Send button
      elementCoord[0x12].x = rightColumn;
      elementCoord[0x12].y = 95;
      elementCoord[0x12].color = ["#999","#555","#ffcc00"];
      elementCoord[0x12].size = [40,20];
      // Send button
      elementCoord[0x62].x = rightColumn;
      elementCoord[0x62].y = 135;
      elementCoord[0x62].color = ["#999","#555","#ffcc00"];
      elementCoord[0x62].size = [40,20];
      // Send button
      elementCoord[0x02].x = rightColumn;
      elementCoord[0x02].y = 205;
      elementCoord[0x02].color = ["#999","#555","#ffcc00"];
      elementCoord[0x02].size = [40,20];
      // Send button
      elementCoord[0x38].x = rightColumn;
      elementCoord[0x38].y = 245;
      elementCoord[0x38].color = ["#999","#555","#ffcc00"];
      elementCoord[0x38].size = [40,20];
      // Send button
      elementCoord[0x78].x = rightColumn;
      elementCoord[0x78].y = 285;
      elementCoord[0x78].color = ["#999","#555","#ffcc00"];
      elementCoord[0x78].size = [40,20];
      // Send button
      elementCoord[0x2c].x = rightColumn;
      elementCoord[0x2c].y = 325;
      elementCoord[0x2c].color = ["#999","#555","#ffcc00"];
      elementCoord[0x2c].size = [40,20];
      // Send button
      elementCoord[0x6c].x = rightColumn;
      elementCoord[0x6c].y = 365;
      elementCoord[0x6c].color = ["#999","#555","#ffcc00"];
      elementCoord[0x6c].size = [40,20];
      // Send button
      elementCoord[0x3c].x = rightColumn;
      elementCoord[0x3c].y = 405;
      elementCoord[0x3c].color = ["#999","#555","#ffcc00"];
      elementCoord[0x3c].size = [40,20];
      // Send button
      elementCoord[0x50].x = rightColumn;
      elementCoord[0x50].y = 445;
      elementCoord[0x50].color = ["#999","#555","#ffcc00"];
      elementCoord[0x50].size = [40,20];
      // Send button
      elementCoord[0x10].x = rightColumn;
      elementCoord[0x10].y = 485;
      elementCoord[0x10].color = ["#999","#555","#ffcc00"];
      elementCoord[0x10].size = [40,20];
      //
      // Small fader section
      // Bus Trim knob
      elementCoord[0x68].x = leftColumn;
      elementCoord[0x68].y = 20;
      elementCoord[0x68].orientation = "reversed";
      elementCoord[0x68].color = ["#955","#f55","#ffcc00"];
      // Float button
      elementCoord[0x60].x = rightColumn;
      elementCoord[0x60].y = 13;
      elementCoord[0x60].color = ["#999","#555","#ffcc00"];
      elementCoord[0x60].size = [40,20];
      // Direct button
      elementCoord[0x40].x = rightColumn;
      elementCoord[0x40].y = 43;
      elementCoord[0x40].color = ["#999","#555","#ffcc00"];
      elementCoord[0x40].size = [40,20];
      // Input button
      elementCoord[0x28].x = rightColumn;
      elementCoord[0x28].y = 186;
      elementCoord[0x28].color = ["#999","#555","#ffcc00"];
      elementCoord[0x28].size = [40,20];
      // Output button
      elementCoord[0x08].x = rightColumn;
      elementCoord[0x08].y = 218;
      elementCoord[0x08].color = ["#999","#555","#ffcc00"];
      elementCoord[0x08].size = [40,20];
      // Solo button
      elementCoord[0x24].x = rightColumn;
      elementCoord[0x24].y = 260;
      elementCoord[0x24].color = ["#999","#555","#ffcc00"];
      elementCoord[0x24].size = [40,20];
      // Cut button
      elementCoord[0x20].x = rightColumn;
      elementCoord[0x20].y = 292;
      elementCoord[0x20].color = ["#999","#555","#ffcc00"];
      elementCoord[0x20].size = [40,20];
      // Small Fader
      elementCoord[0x18].x = leftColumn+10;
      elementCoord[0x18].y = 268;
      elementCoord[0x18].color = ["#999","#555","#ffcc00"];
      elementCoord[0x18].size = [40,20];
      // Ready Group button
      elementCoord[0x48].x = leftColumn;
      elementCoord[0x48].y = 78;
      elementCoord[0x48].color = ["#999","#555","#ffcc00"];
      elementCoord[0x48].size = [40,40];
      // Ready Tape button
      elementCoord[0x58].x = rightColumn;
      elementCoord[0x58].y = 78;
      elementCoord[0x58].color = ["#999","#555","#ffcc00"];
      elementCoord[0x58].size = [40,40];
      // VCA Cut button
      elementCoord[0x74].x = rightColumn;
      elementCoord[0x74].y = 512;
      elementCoord[0x74].color = ["#999","#555","#ffcc00"];
      elementCoord[0x74].size = [40,40]; 
      // Rec Arm (No recall)
      elementCoord[0x80].x = ((chnWidth/2)-38)
      elementCoord[0x80].y = 130;
      elementCoord[0x80].color = ["#f55","#f55","#ffcc00"];
      elementCoord[0x80].size = [78,40];  
      elementCoord[0x80].text = 1;    
      // Front Back Pan knob // Stereo Pus
      elementCoord[0x44].x = rightColumn*0.95;
      if(trSettings.sixk) {
        elementCoord[0x44].orientation = "down";
        elementCoord[0x44].y = 350;
      }
      else {
        elementCoord[0x44].orientation = "right";
        elementCoord[0x44].y = 330;
      }
      elementCoord[0x44].color = ["#999","#555","#ffcc00"];
      // Pan In button
      elementCoord[0x04].x = rightColumn;
      elementCoord[0x04].y = 388;
      elementCoord[0x04].color = ["#999","#555","#ffcc00"];
      elementCoord[0x04].size = [40,20];
      // Big Pan knob
      elementCoord[0x64].x = rightColumn*0.95;
      elementCoord[0x64].y = 441;
      elementCoord[0x64].orientation = "up";
      elementCoord[0x64].color = ["#55f","#55f","#ffcc00"];
      
      // Pull Knobs
      elementCoord[0x09].knobId = 0x3E; 
      elementCoord[0x65].knobId = 0x69; 
      elementCoord[0x42].knobId = 0x22; 
      elementCoord[0x34].knobId = 0x14;  
      elementCoord[0x4c].knobId = 0x0c;  
      elementCoord[0x5c].knobId = 0x1c; 
      elementCoord[0x30].knobId = 0x70;  
      
      
      console.log("Recall Animations Coords set");
  }
  
  function getElementArgs(id,chn){
        var args= {
        "guiIndex": id,
        "potAngle": 270,
        "potRingAngle": 270,
        "chn":chn,
        "switchState" : 0
        }
        return args;    
  }

function showSSLstatus(){
    console.log("hej");
}

function createSSLoverlay(){
    /*
    window div
    button divs
    */
    var overlay = document.createElement('div');
    overlay.id     = "SSLstatusOverlay";
    overlay.style.width = "800px";
    overlay.style.height = "400px";
    overlay.style.zIndex   = 100;
    overlay.style.position = "absolute";
    overlay.style.bottom = "50px";
    overlay.style.border = "none";
    overlay.style.opacity = "0.5";

    return overlay;
}