

    var skin = 1;
     
    var potRingImg = new Image();
    var potRingBigImg = new Image();
    var potImg = new Image();
    var potSslGrayImg = new Image();
    var potSslBlackImg = new Image();
    var potSslBrownImg = new Image();
    var potSslRedImg = new Image();
    var potSslBlueImg = new Image();
    var potSslGreenImg = new Image();
    var potSslPinkImg = new Image();
    var buttOffImg = new Image();
    var buttOnImg = new Image();
    var buttVertOffImg = new Image();
    var buttVertOnImg = new Image();
    var buttOffAlertImg = new Image();
    var buttOnAlertImg = new Image();
    var buttVertOffAlertImg = new Image();
    var buttVertOnAlertImg = new Image();
    var ledRoutingOffImg = new Image();
    var ledRoutingOnImg = new Image();

    var buttPullOnImg = new Image();
    var buttPullOffImg = new Image();
    var buttPullOnAlertImg = new Image();
    var buttPullOffAlertImg = new Image();
    var aeLogoImg = new Image();
    var aeLogoBrokenImg = new Image();
      
    
    var hlBGR = "#ffcc00";
    var hlFGR = "#333";
    var BGR = "#444";
    var FGR = "#ffcc00";
    
    var statusColor = [
        "#555",
        "#7ED321",
        "#ffcc00",
        "#E74054"
    ];
    var statusTextColor = [
        "#999",
        "#555",
        "#555",
        "#444"
    ];
    var statusText = [
        "MAN",
        "AUTO",
        "TOUCH",
        "WRITE"
    ];
    
    var knobAnimation = 0;
    var horButton = "url('img/buttonAll.png') 0px 0;";
    var verButton = "url('img/buttonVertAll.png') 0px 0;";
    var logoBroken = "url('img/logoAll.png') 28px 0;";
    var logo = "url('img/logoAll.png') 0px 0;";
    var pullButton = "none;";
    var horButtonStyle = 'style="border: none; width: 34px; height: 19px; background: '+horButton+'"';
    var verButtonStyle = 'style="border: none; width: 19px; height: 34px; background: '+verButton+'"';
    var pullButtonStyle = 'style="border: none; width: 52px; height: 52px; background: '+pullButton+'"';
    var logoStyle = 'style="border: none; width: 28px; height: 52px; background: '+logoBroken+'"';

    potRingImg.src = 'img/potRing.png';
    potRingBigImg.src = 'img/potRingBig.png';
    potImg.src = 'img/pot.png';
    potSslBlackImg.src = 'img/potSslBlack.png';
    potSslBrownImg.src = 'img/potSslBrown.png';
    potSslRedImg.src = 'img/potSslRed.png';
    potSslBlueImg.src = 'img/potSslBlue.png';
    potSslGreenImg.src = 'img/potSslGreen.png';
    potSslGrayImg.src = 'img/potSslGray.png';
    potSslPinkImg.src = 'img/potSslPink.png';
    buttOffImg.src = 'img/buttonOff.png';
    buttOnImg.src = 'img/buttonOn.png';
    buttVertOffImg.src = 'img/buttonVertOff.png';
    buttVertOnImg.src = 'img/buttonVertOn.png';
    buttOffAlertImg.src = 'img/buttonOffAlert.png';
    buttOnAlertImg.src = 'img/buttonOnAlert.png';
    buttVertOffAlertImg.src = 'img/buttonVertOffAlert.png';
    buttVertOnAlertImg.src = 'img/buttonVertOnAlert.png';
    ledRoutingOffImg.src = 'img/ledRoutingOff.png';
    ledRoutingOnImg.src = 'img/ledRoutingOn.png';

    buttPullOnImg.src = 'img/buttPullOn.png';
    buttPullOffImg.src = 'img/buttPullOff.png';
    buttPullOnAlertImg.src = 'img/buttPullOnAlert.png';
    buttPullOffAlertImg.src = 'img/buttPullOnAlert.png';

    aeLogoImg.src = 'img/AE-logo.png';
    aeLogoBrokenImg.src = 'img/AE-logo-broken.png';
    console.log("Images loaded");
            
            
    var micPot = potImg;
    var linePot = potImg;
    var compPot = potImg;
    var expPot = potImg;
    var filterPot = potImg;
    var loPot = potImg;
    var loMidPot = potImg;
    var hiMidPot = potImg;
    var hiPot = potImg;   
    var panPot = potImg;  
    var sendPot = potImg;  
    var trimPot = potImg;   
    
    var position = 0;
    
    var zoom = 1.0; 
    var startOfScope = 0;
    var startOfScopeY = 0;
    var trackBackground = {};
    var trackPoints = [];
    var autoPts = [];
    var writeRegions=[];
    var redRegions = [];
    var lastPos;
    var timelineWidth = 860;
    var timelineHeight = 440;
    var tracksInTimeline = 8;
    var numOfTracks = 96;
    var trackHeight = timelineHeight/tracksInTimeline;
    var scaleHeightRatio = 0;
    var timelineCanvasBase = {};
    var timelineCanvasWithPaths = {};
    var timelinePaths = [];
    var timelineSlidePaths = [];
    var slideFlag = 0;
    var filterVal = 1.01;
    
    var statusColDragInhibit = 0;
    var dragStartX=0;
    var dragOffsetX=0;
    var dragStartY=0;
    var dragOffsetY=0;
    var pageFlipInhibit=0;
    var rePaintFlag=0;
    var chnOffset=0;
    
    
    var sessionStateClass = function(){
        this.buttonName = "";
        this.versionName = "";
        this.faderStatuses = [];
        this.faderHuiStatuses = [];
        this.faderHuiRoute = [];
        this.faderHuiRouteLinks = [];

        // mirrored from SW96
        for(var n=0;n<numOfTracks;n++){
            this.faderStatuses[n]=0;
            this.faderHuiStatuses[n]=0;
            this.faderHuiRoute[n]=0;
        }

        // faderHuiRouteLinks
        // HUI bank * 8 + hui channel - 1 as index
        // CV96 channel as value
        for(var n=0;n<32;n++){
            this.faderHuiRouteLinks[n]=0;
        }
    };
    var sessionState;
    sessionState = new sessionStateClass();
    
    scaleHeightRatio = 1023 / (trackHeight-4);
    trackBackground = drawTrackBackground();
    
    
    timelineCanvasBase = document.createElement('canvas');
    timelineCanvasBase.width = timelineWidth;
    timelineCanvasBase.height = timelineHeight*12;
    var initCtx = timelineCanvasBase.getContext('2d');
    initCtx.clearRect(0, 0, timelineWidth, timelineHeight);
    initCtx.beginPath();
    for(var n=0;n<numOfTracks;n++){
        timelinePaths[n] = document.createElement('canvas');
        timelinePaths[n].width = timelineWidth;
        timelinePaths[n].height = timelineHeight;
        writeRegions[n] = new writeRegion();
        autoPts[n]=[];
        autoPts[n].push({
                "time":0,
                "level":0
        });
    //    trackPoints[n]=trackPointsToImage(autoPts[n],0);
        initCtx.drawImage(trackBackground, 0, n*trackHeight);
    }
    initCtx.stroke();
  
    
    var faderStatusClass = function(id){
        this.touch = 0;
        this.id=id;
        this.level=function(level){
            var knobId='#knob'+this.id;
            var pos = (Math.round((level/9.1)+1))-1;
            if(knobAnimation){
                $(knobId).animate({
                    "bottom": pos+'px'
                },40);   
            }
            else{
                $(knobId).css('bottom', pos+'px');
            }
        };
        this.knob = function(state){
            var knobId='#knob'+this.id;
            this.touch = state;
            if(state===1){
                if($(knobId).hasClass("knobWhite")){
                    $(knobId).removeClass("knobWhite");
                }
                $(knobId).addClass("knobRed"); 
            }
            if(state===0){
                if($(knobId).hasClass("knobRed")){
                    $(knobId).removeClass("knobRed");
                }
                $(knobId).addClass("knobWhite"); 
            }       
        };
    };
    
    
    var faderStatus = [];
            
    
    var standardPotImg = potSslGrayImg;
    // AE
    if(skin===0){
        var standardPotImg = potImg;
        filterPot = potImg;
        loImg = potImg;
        loMidImg = potImg;
        hiMidImg = potImg;
        hiImg = potImg;        
    }
    
    // 4000E - old
    if(skin===1){
        filterPot = potSslGrayImg;
        loPot = potSslBrownImg;
        loMidPot = potSslBlueImg;
        hiMidPot = potSslGreenImg;
        hiPot = potSslRedImg;  
        
        micPot = potSslRedImg;
        linePot = potSslGrayImg;
        compPot = potSslGrayImg;
        expPot = potSslGreenImg;
        
        panPot = potSslBlueImg;   
        sendPot = potSslGrayImg; 
        
        trimPot =  potSslRedImg;
    }

    // 4000E
    if(skin===2){
        filterImg = potSslGrayImg;
        loImg = potSslBlackImg;
        loMidImg = potSslBlueImg;
        hiMidImg = potSslGreenImg;
        hiImg = potSslRedImg;
    }
    // 4000G
    if(skin===3){
        filterImg = potSslGrayImg;
        loImg = potSslBlackImg;
        loMidImg = potSslBlueImg;
        hiMidImg = potSslGreenImg;
        hiImg = potSslPinkImg;
    }           

    (function() {
        var lastTime = 0;
        var vendors = ['ms', 'moz', 'webkit', 'o'];
        for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
            window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
            window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame']
                                       || window[vendors[x]+'CancelRequestAnimationFrame'];
        }

        if (!window.requestAnimationFrame)
            window.requestAnimationFrame = function(callback, element) {
                var currTime = new Date().getTime();
                var timeToCall = Math.max(0, 16 - (currTime - lastTime));
                var id = window.setTimeout(function() { callback(currTime + timeToCall); },
                  timeToCall);
                lastTime = currTime + timeToCall;
                return id;
            };

        if (!window.cancelAnimationFrame)
            window.cancelAnimationFrame = function(id) {
                clearTimeout(id);
            };
    }());
    
    var faderBank = new function(){
        this.bank = 0;
        this.switch = function(newBank){
            if(newBank!==this.bank){
                //switch
                $('#faderBankHighLite').animate({
                    "left": 30+((newBank-1)*160)+'px'
                },500);   

                var distance = 440*(newBank-bank);
                guiHold=1;
                slideFlag=1;

                $("#autoStatuses").animate({
                                top: '-='+distance+'px'
                            }, 500, function(){
                                guiHold=0;
                                slideFlag=0;
                });

                $("#autoTracks").animate({
                                top: '-='+distance+'px'
                            }, 500, function(){
                                guiHold=0;
                                slideFlag=0;
                });
                
                chnOffset = ((newBank-1)*8);
                var start, stop;
                if(newBank>bank){
                    start = bank-1;
                    stop = newBank+1;
                }
                else{
                    start = newBank-1;
                    stop = bank+1;                   
                }
                
                 
                var chn=n+(chnOffset);
                for(var n=start;n<stop;n++) {    
                    var chn=n+(chnOffset);
                    if(chn>0 && chn<97){
                       timelinePaths[chn-1] = trackPointsToImage(autoPts[chn-1], chn-1);
                    }
                }     
                
                this.bank = newBank;
                bank = newBank;
 
            };
        };
    };
    
    
    paintWorker();

function showIPconfig(){
    var content="";
    console.log("load IP config");
    
    content+='IP address:';
    content+='<input id="ip" value="'+localStorage.wsIp+'"/><br/>';
    content+='Port:';
    content+='<input id="port" value="'+localStorage.wsPort+'"/>';
    content+='<button id="save">Save</>';
   
    
    
    $("#top p").html('Automan SW96 Server Config');
    $("#mainGUI").html(content);
    
    updateAddress = document.getElementById('save');
    
    document.getElementById('save').addEventListener("click", function(){
        localStorage.setItem('wsIp',document.getElementById('ip').value);
        localStorage.setItem('wsPort',document.getElementById('port').value);
        var newUrl="ws://"+localStorage.wsIp+":"+localStorage.wsPort;
        localStorage.setItem('wsUrl', newUrl);
        
    });

}  

function showNagScreen(){
    var content="";
    console.log("load Nag Screen");
    
    // content+='Nag Nag Nag';
    
    
    $("#top p").html("Can't find Automan SW96 Server");
    $("#mainGUI").html(content);

}  

function showEqGUI (chn, bank){
    var realChn = (bank-1)*8;
    chn=chn-1;
    
    realChn += chn+1;
    var channel = '<div class="channelStrip" id="strip'+chn+'">';
    channel+='<img class="potRing" id="potRing'+chn+':'+0x36+'" src="'+potRingImg.src+'" style="left: 70px; top: 12px;">';
    channel+='<img class="pot" id="pot'+chn+':'+0x36+'" src="'+filterPot.src+'" style="left: 74px; top: 16px;">';
    channel+='<img class="potRing" id="potRing'+chn+':'+0x76+'" src="'+potRingImg.src+'" style="left: 10px; top: 38px;">';
    channel+='<img class="pot" id="pot'+chn+':'+0x76+'" src="'+filterPot.src+'" style="left: 14px; top: 42px;">';
    channel+='<img class="potRing" id="potRing'+chn+':'+0x56+'" src="'+potRingImg.src+'" style="left: 10px; top: 108px;">';
    channel+='<img class="pot" id="pot'+chn+':'+0x56+'" src="'+hiPot.src+'" style="left: 14px; top: 112px;">';
    channel+='<img class="potRing" id="potRing'+chn+':'+trAddress[64]+'" src="'+potRingImg.src+'" style="left: 70px; top: 144px;">';
    channel+='<img class="pot" id="pot'+chn+':'+trAddress[64]+'" src="'+hiPot.src+'" style="left: 74px; top: 148px;">';
    channel+='<img class="potRing" id="potRing'+chn+':'+trAddress[65]+'" src="'+potRingImg.src+'" style="left: 10px; top: 180px;">';
    channel+='<img class="pot" id="pot'+chn+':'+trAddress[65]+'" src="'+hiMidPot.src+'" style="left: 14px; top: 184px;">';
    channel+='<img class="potRing" id="potRing'+chn+':'+trAddress[66]+'" src="'+potRingImg.src+'" style="left: 70px; top: 216px;">';
    channel+='<img class="pot" id="pot'+chn+':'+trAddress[66]+'" src="'+hiMidPot.src+'" style="left: 74px; top: 220px;">';
    channel+='<img class="potRing" id="potRing'+chn+':'+trAddress[67]+'" src="'+potRingImg.src+'" style="left: 10px; top: 252px;">';
    channel+='<img class="pot" id="pot'+chn+':'+trAddress[67]+'" src="'+hiMidPot.src+'" style="left: 14px; top: 256px;">';
    channel+='<img class="potRing" id="potRing'+chn+':'+trAddress[70]+'" src="'+potRingImg.src+'" style="left: 10px; top: 318px;">';
    channel+='<img class="pot" id="pot'+chn+':'+trAddress[70]+'" src="'+loMidPot.src+'" style="left: 14px; top: 322px;">';
    channel+='<img class="potRing" id="potRing'+chn+':'+trAddress[71]+'" src="'+potRingImg.src+'" style="left: 70px; top: 354px;">';
    channel+='<img class="pot" id="pot'+chn+':'+trAddress[71]+'" src="'+loMidPot.src+'" style="left: 74px; top: 358px;">';
    channel+='<img class="potRing" id="potRing'+chn+':'+trAddress[72]+'" src="'+potRingImg.src+'" style="left: 10px; top: 390px;">';
    channel+='<img class="pot" id="pot'+chn+':'+trAddress[72]+'" src="'+loMidPot.src+'" style="left: 14px; top: 394px;">';
    channel+='<img class="potRing" id="potRing'+chn+':'+trAddress[73]+'" src="'+potRingImg.src+'" style="left: 70px; top: 426px;">';
    channel+='<img class="pot" id="pot'+chn+':'+trAddress[73]+'" src="'+loPot.src+'" style="left: 74px; top: 430px;">';
    channel+='<img class="potRing" id="potRing'+chn+':'+trAddress[74]+'" src="'+potRingImg.src+'" style="left: 10px; top: 466px;">';
    channel+='<img class="pot" id="pot'+chn+':'+trAddress[74]+'" src="'+loPot.src+'" style="left: 14px; top: 470px;">';
    
    channel+='<div class="horizButton off" id="switch'+chn+':'+trAddress[61]+'"style="left: 73px; top: 72px;"/>';
    channel+='<div class="horizButton off" id="switch'+chn+':'+trAddress[62]+'"style="left: 73px; top: 102px;"/>';
    channel+='<div class="horizButton off" id="switch'+chn+':'+trAddress[68]+'"style="left: 73px; top: 282px;"/>';
    channel+='<div class="horizButton off" id="switch'+chn+':'+trAddress[69]+'"style="left: 73px; top: 312px;"/>';
    channel+='<div class="horizButton off" id="switch'+chn+':'+trAddress[75]+'"style="left: 73px; top: 487px;"/>';
    channel+='<div class="vertButton off" id="switch'+chn+':'+trAddress[76]+'"style="left: 13px; top: 518px;"/>';
    channel+='<div class="vertButton off" id="switch'+chn+':'+trAddress[77]+'"style="left: 50px; top: 518px;"/>';
    channel+='<div class="vertButton off" id="switch'+chn+':'+trAddress[78]+'"style="left: 87px; top: 518px;"/>';

    
    channel+='<div class="chnNo">';
    channel+='<p>'+realChn+'</p>';
    channel+='</div>';
    channel+='</div>';
 
    return channel;
}

function showRoutingGUI (chn, bank){
    
    var m = (chn-1) * 5;
    var no = 0;
    var realChn = (bank-1)*8;
    realChn += chn;
    var channel = '<div class="channelStrip" id="strip'+chn+'">';
    var p, q;
    var id='';
      
    for(p=0;p<9;p++){
        for(q=0;q<4;q++){
            var x=11+(q*28);
            var y=80+(p*45);
            var x2=x+4;
            var y2=y-16;
            id=(chn-1)+':'+trAddress[no+1];
            
            channel+='<div class= "routingButton" id="switch'+id+'" style="position:absolute;left:'+x+'px;top:'+y+'px;"/>'; 
            
            /*
            var swImg="width: 18px; height: 18px;background: url('img/routingSwitch.png') 0 0";
  //          channel+='<img id="led'+id+'" style="position:absolute;left:'+x2+'px;top:'+y2+'px;" src="'+ledRoutingOff+'">'; 
            channel+='<div id="switch'+id+'" style="position:absolute;left:'+x+'px;top:'+y+'px; '+swImg+'"/>'; 
        //    channel+='<img id="switch'+id+'" style="position:absolute;left:'+x+'px;top:'+y+'px;" src="'+switchRoutingOff+'">'; 
            */
            no++;
        }
    }
    
    var id=(chn-1)+':';
    channel+='<img class="potRing" id="potRing'+id+0x11+'" src="'+potRingImg.src+'" style="left: 16px; top: 478px;">';
    channel+='<img class="pot" id="pot'+id+0x11+'" src="'+panPot.src+'" style="left: 20px; top: 482px;">';
    channel+='<div class="horizButton off" id="switch'+id+0x31+'" style="left: 76px; top: 492px;"/>';
    
    channel+='<div class="chnNo">';
    channel+='<p>'+realChn+'</p>';
    channel+='</div>';
    channel+='</div>';


    return channel;
}

function showDynamicsGUI (chn, bank){
    
    var m = (chn-1) * 5;
    var no = 0;
    var realChn = (bank-1)*8;
    realChn += chn;
    var channel = '<div class="channelStrip" id="strip'+chn+'">';
    var p, q;
    var id=(chn-1)+':';
    
    channel+='<img class="potRing" id="potRing'+id+0x61+'" src="'+potRingImg.src+'" style="left: 10px; top: 42px;">';
    channel+='<img class="pot" id="pot'+id+0x61+'" src="'+linePot.src+'" style="left: 14px; top: 46px;">';
    channel+='<img class="potRing" id="potRing'+id+0x2E+'" src="'+potRingImg.src+'" style="left: 10px; top: 106px;">';
    channel+='<img class="pot" id="pot'+id+0x2E+'" src="'+micPot.src+'" style="left: 14px; top: 110px;">';
    channel+='<div class="horizButton off" id="switch'+id+0x05+'" style="left: 76px; top: 49px;"/>';
    channel+='<div class="horizButton off" id="switch'+id+0x51+'" style="left: 76px; top: 75px;"/>';
    channel+='<div class="horizButton off" id="switch'+id+0x21+'" style="left: 76px; top: 101px;"/>';
    channel+='<div class="horizButton off" id="switch'+id+0x71+'" style="left: 76px; top: 127px;"/>';
    
    channel+='<div class="pullButton" id="switch'+id+0x09+'" '+pullButtonStyle+' style="left: 6px; top: 296px; z-index: 10;"/>';
    channel+='<div class="pullButton" id="switch'+id+0x65+'" '+pullButtonStyle+' style="left: 6px; top: 434px; z-index: 10;"/>';
    
    channel+='<img class="potRing" id="potRing'+id+0x6E+'" src="'+potRingImg.src+'" style="left: 10px; top: 228px;">';
    channel+='<img class="pot" id="pot'+id+0x6E+'" src="'+compPot.src+'" style="left: 14px; top: 232px;">';
    channel+='<img class="potRing" id="potRing'+id+0x1E+'" src="'+potRingImg.src+'" style="left: 70px; top: 264px;">';
    channel+='<img class="pot" id="pot'+id+0x1E+'" src="'+compPot.src+'" style="left: 74px; top: 268px;">';
    channel+='<img class="potRing" id="potRing'+id+0x3E+'" src="'+potRingImg.src+'" style="left: 10px; top: 300px;">';
    channel+='<img class="pot" id="pot'+id+0x3E+'" src="'+compPot.src+'" style="left: 14px; top: 304px;">';
    channel+='<img class="potRing" id="potRing'+id+0x7E+'" src="'+potRingImg.src+'" style="left: 70px; top: 336px;">';
    channel+='<img class="pot" id="pot'+id+0x7E+'" src="'+expPot.src+'" style="left: 74px; top: 340px;">';
    channel+='<img class="potRing" id="potRing'+id+0x49+'" src="'+potRingImg.src+'" style="left: 10px; top: 372px;">';
    channel+='<img class="pot" id="pot'+id+0x49+'" src="'+expPot.src+'" style="left: 14px; top: 376px;">';
    channel+='<img class="potRing" id="potRing'+id+0x69+'" src="'+potRingImg.src+'" style="left: 10px; top: 438px;">';
    channel+='<img class="pot" id="pot'+id+0x69+'" src="'+expPot.src+'" style="left: 14px; top: 442px;">';
    
    channel+='<div class="horizButton off" id="switch'+id+0x5E+'" style="left: 75px; top: 226px;"/>';
    channel+='<div class="horizButton off" id="switch'+id+0x29+'" style="left: 75px; top: 402px;"/>';
    channel+='<div class="vertButton off" id="switch'+id+0x3A+'" style="left: 15px; top: 510px;"/>';
    channel+='<div class="vertButton off" id="switch'+id+0x0E+'" style="left: 52px; top: 510px;"/>';
    channel+='<div class="vertButton off" id="switch'+id+0x01+'" style="left: 89px; top: 510px;"/>';

    channel+='<div class="chnNo">';
    channel+='<p>'+realChn+'</p>';
    channel+='</div>';
    channel+='</div>';

    return channel;
}

function showSendsGUI (chn, bank){
    
    var m = (chn-1) * 5;
    var no = 0;
    var realChn = (bank-1)*8;
    realChn += chn;
    var channel = '<div class="channelStrip" id="strip'+chn+'">';
    var p, q;
    var id=(chn-1)+':';
    
    channel+='<img class="potRing" id="potRing'+id+0x52+'" src="'+potRingImg.src+'" style="left: 11px; top: 53px;"/>';
    channel+='<img class="pot" id="pot'+id+0x52+'" src="'+sendPot.src+'" style="left: 15px; top: 57px;"/>';
    
    channel+='<img class="potRing" id="potRing'+id+0x22+'" src="'+potRingImg.src+'" style="left: 11px; top: 133px;"/>';
    channel+='<img class="pot" id="pot'+id+0x22+'" src="'+panPot.src+'" style="left: 15px; top: 137px;"/>';
    channel+='<img class="potRing" id="potRing'+id+0x14+'" src="'+potRingImg.src+'" style="left: 11px; top: 213px;"/>';
    channel+='<img class="pot" id="pot'+id+0x14+'" src="'+sendPot.src+'" style="left: 15px; top: 217px;"/>';
    channel+='<img class="potRing" id="potRing'+id+0x0c+'" src="'+potRingImg.src+'" style="left: 11px; top: 293px;"/>';
    channel+='<img class="pot" id="pot'+id+0x0c+'" src="'+sendPot.src+'" style="left: 15px; top: 297px;"/>';
    channel+='<img class="potRing" id="potRing'+id+0x1c+'" src="'+potRingImg.src+'" style="left: 11px; top: 373px;"/>';
    channel+='<img class="pot" id="pot'+id+0x1c+'" src="'+sendPot.src+'" style="left: 15px; top: 377px;"/>';
    channel+='<img class="potRing" id="potRing'+id+0x70+'" src="'+potRingImg.src+'" style="left: 11px; top: 453px;"/>';
    channel+='<img class="pot" id="pot'+id+0x70+'" src="'+sendPot.src+'" style="left: 15px; top: 457px;"/>';
    
    channel+='<div class="horizButton off" id="switch'+id+0x12+'" style="left: 69px; top: 85px;"/>';
    channel+='<div class="horizButton off" id="switch'+id+0x62+'" style="left: 69px; top: 125px;"/>';
    channel+='<div class="horizButton off" id="switch'+id+0x02+'" style="left: 69px; top: 205px;"/>';
    channel+='<div class="horizButton off" id="switch'+id+0x38+'" style="left: 69px; top: 245px;"/>';
    channel+='<div class="horizButton off" id="switch'+id+0x78+'" style="left: 69px; top: 285px;"/>';
    channel+='<div class="horizButton off" id="switch'+id+0x2c+'" style="left: 69px; top: 325px;"/>';
    channel+='<div class="horizButton off" id="switch'+id+0x6c+'" style="left: 69px; top: 365px;"/>';
    channel+='<div class="horizButton off" id="switch'+id+0x3c+'" style="left: 69px; top: 405px;"/>';
    channel+='<div class="horizButton off" id="switch'+id+0x50+'" style="left: 69px; top: 445px;"/>';
    channel+='<div class="horizButton off" id="switch'+id+0x10+'" style="left: 69px; top: 485px;"/>';
    
    channel+='<div class="chnNo">';
    channel+='<p>'+realChn+'</p>';
    channel+='</div>';
    channel+='</div>';


    return channel;
}

function showSmallGUI (chn, bank){
    
    var m = (chn-1) * 5;
    var no = 0;
    var realChn = (bank-1)*8;
    realChn += chn;
    var channel = '<div class="channelStrip" id="strip'+chn+'">';
    var p, q;
    var id=(chn-1)+':';
     
    channel+='<img class="potRing" id="potRing'+id+0x68+'" src="'+potRingImg.src+'" style="left: 11px; top: 16px;">';
    channel+='<img class="pot" id="pot'+id+0x68+'" src="'+trimPot.src+'" style="left: 15px; top: 20px;"/>';
    channel+='<div class="horizButton off" id="switch'+id+0x60+'" style="left: 69px; top: 13px;"/>';
    channel+='<div class="horizButton off" id="switch'+id+0x40+'" style="left: 69px; top: 43px;"/>';
    
    channel+='<div class="squareButton off" id="switch'+id+0x48+'" style="left: 11px; top: 75px;"/>';
    channel+='<div class="squareButton off" id="switch'+id+0x58+'" style="left: 66px; top: 75px;"/>';
    
    channel+='<div class="armButton" style="left: 29px; top: 128px;"/>';            // Record button
    
    channel+='<div class="horizButton off" id="switch'+id+0x28+'" style="left: 69px; top: 186px;"/>';   //130
    channel+='<div class="horizButton off" id="switch'+id+0x08+'" style="left: 69px; top: 218px;"/>';
    channel+='<div class="horizButton off" id="switch'+id+0x24+'" style="left: 69px; top: 260px;"/>';
    channel+='<div class="horizButton off" id="switch'+id+0x20+'" style="left: 69px; top: 292px;"/>';
    
    channel+='<img class="potRing" id="potRing'+id+0x44+'" src="'+potRingImg.src+'" style="left: 66px; top: 331px;">';
    channel+='<img class="pot" id="pot'+id+0x44+'" src="'+panPot.src+'"  style="left: 70px; top: 335px;"/>';
    channel+='<div class="horizButton off" id="switch'+id+0x04+'" style="left: 69px; top: 388px;"/>';
    
    channel+='<div class="slot" style="left: 28px; top: 202px;"/>';
    channel+='<div class="smallFaderAlert" id="smallFaderAlert'+id+0x18+'" style="left: 6px; top: 264px;"/>';
    channel+='<div class="smallFader" id="smallFader'+id+0x18+'" style="left: 16px; top: 268px;"/>';
    
    channel+='<img class="potRingBig" id="potRing'+id+0x64+'" src="'+potRingBigImg.src+'" style="left: 57px; top: 426px;">';
    channel+='<div class="blueKnobBig" id="pot'+id+0x64+'" style="left: 62px; top: 431px;"/>';
    
 //   channel+='<div class="squareButton off" style="left: 11px; top: 502px;"/>';           // SOLO button !!  
    channel+='<div class="squareButton off " id="switch'+id+0x74+'" style="left: 66px; top: 502px;"/>';
    
    // Thumbwheel
    channel+='<div class="thumbNo" id="group'+id+0x3B+'" style="left: 11px; top: 502px;">'+chn+'</div>';
    channel+='<div class="thumbUp" id="upGroupAlert'+id+0x3B+'" style="left: 27px; top: 505px;"/>';
    channel+='<div class="thumbDown" id="downGroupAlert'+id+0x3B+'" style="left: 27px; top: 534px;"/>';
    
    channel+='<div class="chnNo">';
    channel+='<p>'+realChn+'</p>';
    channel+='</div>';
    channel+='</div>';


    return channel;
}

function showVcaGUI (chn, bank){
    
    var m = (chn-1) * 5;
    var no = 0;
    var realChn = (bank-1)*8;
    realChn += chn;
    var channel = '<div class="channelStrip" id="strip'+chn+'">';
    var p, q;
    var id=(chn-1)+':';
     
    
    channel+='<div class="slot" style="left: 56px; top: 50px; height: 480px;"/>';
    channel+='<div class="smallFaderAlert" id="vcaFaderAlert'+id+'" style="left: 34px; top: 204px;"/>';
    channel+='<div class="smallFader" id="vcaFader'+id+'" style="left: 44px; top: 208px;"/>';
    
    channel+='<div class="chnNo">';
    channel+='<p>'+realChn+'</p>';
    channel+='</div>';
    channel+='</div>';


    return channel;
}

function buildMainGUI (autoMode){
    var versionText = '' + versionHi + '.' + versionLo + '.' + build;
    var html = '';
    html += '<header>';
    html += '<table id="topCells">';
    html +=     '<tr>';
    html +=         '<td id="buttonData"><table id="buttonCells">';
    html +=             '<tr id="buttonRow">';
    html +=                 '<td id="button1" onclick="showSettings()">Settings</td>';
    html +=                 '<td id="button2"></td>';
    html +=                 '<td id="button3">Files</td>';
    html +=             '</tr>';
    html +=         '</table></td>';
    html +=         '<td id="infoTable"><table id="infoCells">';
    html +=             '<tr id="lineTop">';
    html +=                 '<th></th>';
    html +=                 '<th></th>';
    html +=             '</tr>';
    html +=             '<tr>';
    html +=                 '<th class="infoLabel">Reel</th>';
    html +=                 '<th class="infoLabel">Mix</th>';
    html +=             '</tr>';
    html +=             '<tr id="infoData">';
    html +=                 '<td id="titleName">Reel name</td>';
    html +=                 '<td id="versionName">Mix name</td>';
    html +=             '</tr>';
    html +=         '</table></td>';
    
    html +=         '<td id="mtcInfo"><table id="mtcInfoCells">';
    html +=             '<tr>';
    html +=                 '<td id="FPS">25</td>';
    html +=             '</tr>';
    html +=             '<tr>';
    html +=                 '<th>FPS</th>';
    html +=             '</tr>';
    html +=         '</table></td>';
    
    html +=         '<td id="mtcData"><table id="mtcCells">';
    html +=             '<tr>';
    html +=                 '<td id="HH1">0</td>';
    html +=                 '<td id="HH0">0</td>';
    html +=                 '<td>:</td>';
    html +=                 '<td id="MM1">0</td>';
    html +=                 '<td id="MM0">0</td>';
    html +=                 '<td>:</td>';
    html +=                 '<td id="SS1">0</td>';
    html +=                 '<td id="SS0">0</td>';
    html +=                 '<td>:</td>';
    html +=                 '<td id="FF1">0</td>';
    html +=                 '<td id="FF0">0</td>';
    html +=             '</tr>';
    html +=         '</table></td>';
    html +=         '<td id="clockData">';
    html +=             '<div id="clock">';
    html +=                 '<div class="clockPointers" id="clockFrame"></div>';
    html +=                 '<div class="clockPointers" id="clockSec"></div>';
    html +=                 '<div class="clockPointers" id="clockMin"></div>';
    html +=             '</div>';
    html +=         '</td>';
    html +=     '</tr>';
    html += '</table>';
    html += '<div id="version">'+versionText+'</div>';
    html += '<div id="logo" '+logoStyle+'/>';
    html += '</header>';
    html += '<div id="mainGUI"></div>';
        html += '<footer id="foot">'; 
     //  if(autoMode) html += buildBankPanel();;   
        html += '</footer>';     

    
    return html;
}

function buildBankPanel(){
        var html = '';
        html += '<div id="banks">';
        html += '<div class="bankButton bankButtonNotFocus" id="region0">Routing</div>';
        html += '<div class="bankButton bankButtonNotFocus" id="region1">Input / Dyn</div>';
        html += '<div class="bankButton bankButtonNotFocus" id="region2">EQ</div>';
        html += '<div class="bankButton bankButtonNotFocus" id="region3">Sends</div>';
        html += '<div class="bankButton bankButtonNotFocus" id="region4">Small</div>';
        html += '<div class="bankButton bankButtonNotFocus" id="region5">VCA</div>';
        html += '</div>';
    return html;
}

function buildAutomationWindow (){
    
    var html = '';
    html += '<div id="autoWrapper">';
    html +=     '<div id="autoOverlay" class="hidden"></div>';
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
    html +=         '<canvas id="autoRuler" width="860" height="21"></canvas>';
    html +=         '<div id="autoTracksCrop">';
    html +=         '   <div id="autoTracks"></div>';
    html +=         '</div>';
    html +=     '</div>';
    html +=     '<div id="autoFaders"></div>';
    html += '</div>';
    rePaintFlag=1;
    return html;
}
function buildStatuses (){
    
    var html = '';
    for(n=0;n<numOfTracks;n++){
        var trackNo = (n+((bank-1)*8)+1);
        var trackNoSize = trackHeight-2;
        var statusWidth = 130-trackHeight-2;
        var statusHeight = (trackHeight/2)-2;
        var statusTop = (trackHeight/2);
        html += '<div id="statusBox'+n+'" class="statusBox" style="width:130px; height:'+(trackHeight)+'px;">';
        html += '<div id="statusTrackNo'+n+'" class="statusTrackNo" style="right:0px; width:'+(trackNoSize)+'px; height:'+(trackNoSize)+'px;">'+trackNo+'</div>';
        html += '<div id="statusTrackStatus'+n+'" class="statusTrackStatus" style="cursor:pointer; width:'+(statusWidth)+'px; height:'+(statusHeight)+'px;" onclick="statusClick('+n+')"></div>';
        html += '<div id="statusTrackLevel'+n+'" class="statusTrackLevel" style="top:'+(statusTop)+'px; width:'+(statusWidth)+'px; height:'+(statusHeight)+'px;"></div>';
        html += '</div>';
    }
    return html;
}
function buildFaderBanks (){
    
    var html = '';
    html += '<div id="faderControlPanel">';
    html +=     '<div id="faderControl1" class="faderControl"></div>';
    html +=     '<div id="faderControl2" class="faderControl"></div>';
    html +=     '<div id="faderControl3" class="faderControl"></div>';
    html +=     '<div id="faderControl4" class="faderControl"></div>';
    html +=     '<div id="faderControl5" class="faderControl"></div>';
    html +=     '<div id="faderControl6" class="faderControl"></div>';
    html += '</div>';
    for(var n=0;n<6;n++){
        var offset = (n*160)+30;
        html += '<div class="faderBank" id="faderBank'+m+'" style="position: absolute; width:160px; height:159px; left:'+offset+'px; top:1px;">';
        for(var m=0;m<8;m++){
            var trackNo = (m+(n*8)+1);
            var leftOffset = (0)+(m*20);
            faderStatus[trackNo] = new faderStatusClass(trackNo);
            html += '<div id="fader'+trackNo+'" class="fader" style="position: absolute; width:20px; height:158px; left:'+leftOffset+'px; top:1px; z-index:3;">';
            html +=     '<div id="statusLine'+trackNo+'" class="statusLine" style="position: absolute; width:20px; height:3px; left:0px; top:18px; z-index: 10;"></div>';
            html +=     '<div id="faderTrackNo'+trackNo+'" class="faderTrackNo" style="position: absolute; width:18px; height:18px; left:1px; top:0px; z-index: 10;">'+trackNo+'</div>';
            html +=     '<div id="knob'+trackNo+'" class="knob knobWhite" style="position: absolute; width:12px; height:24px; left:4px; bottom:1px; z-index: 10;">';
            html +=     '</div>';   
            html += '</div>';   
        }
        html += '</div>';   
    }
    html += '<div id="faderBankHighLite" style="position: absolute; width:160px; height:138px; left:30px; top:22px; z-index:1;"></div>';
  
    return html;
}
function buildTimeline (){
    
//    html += '<canvas id="c1" width="800" height="480" style="border:1px solid #FFF;"></canvas>';
    var canvas = document.createElement('canvas');
        canvas.id     = "c1";
        canvas.width  = timelineWidth;
        canvas.height = timelineHeight*12;
        canvas.style.zIndex   = 8;
        canvas.style.position = "relative";
        canvas.style.border   = "none";
        
    return canvas;
}
function buildStatusPalette(id){
    
    var huiState = sessionState.faderHuiStatuses[id];
    var html = '';
    var w = 130-trackHeight-2;
    var h = (trackHeight/2)-0;
    var hOffset = 55;
    html += '<div id="statusPalette1">';
    html +=     '<div id="statusPaletteInfo">Status mode CV96 channel: '+(id+1)+'</div>';
    
    html +=     '<div id="optionTrackStatus0" class="optionTrackStatus" style="cursor:pointer; width:'+(w)+'px; height:'+(h-2)+'px; top:'+((h*0)+hOffset)+'px;" onclick="huiStatusSet('+id+','+0+')">automan</div>';
    html +=     '<div id="optionTrackStatus1" class="optionTrackStatus" style="cursor:pointer; width:'+(w)+'px; height:'+(h-2)+'px; top:'+((h*1)+hOffset)+'px;" onclick="huiStatusSet('+id+','+1+')">hui</div>';
    html +=     '<div id="optionTrackStatus2" class="optionTrackStatus" style="cursor:pointer; width:'+(w)+'px; height:'+(h-2)+'px; top:'+((h*2)+hOffset)+'px;" onclick="huiStatusSet('+id+','+2+')">hui delta</div>';
    
    
    if(sessionState.faderHuiStatuses[id]>0){
        var huiIndex = 0;
        for(var bank=0;bank<4;bank++){
            for(var chn=0;chn<8;chn++){
                html += '<div id="huiRoute'+huiIndex+'" class="huiRoute" style="cursor:pointer; width:'+((w*1.5)-8)+'px; height:'+(h-2)+'px; top:'+((h*chn)+(28*huiState)+hOffset)+'px; left:'+(w+(w*1.5*bank)+28)+'px;" onclick="huiRoute('+id+','+huiIndex+')">bank '+(bank+1)+', chn '+(chn+1)+'</div>';
                huiIndex++;
            }
        }        
    }

    html += '</div>';  
    
    var str = ((trackHeight*8)+17) + "px";
    
    document.getElementById("autoOverlay").style.height = str;
    
    return html;
}

function hlHuiStatus(id){
    // hilite the selected status 
    var huiPalette = $("#statusPalette1");
    var hOffset = 55;
    
    $("#optionTrackStatus0").css("color", "#999");
    $("#optionTrackStatus1").css("color", "#999");
    $("#optionTrackStatus2").css("color", "#999");
    
    var huiState        = sessionState.faderHuiStatuses[id];
    var huiStateObject  = "#optionTrackStatus"+huiState;
    
    var huiStateArrow = '';
    huiStateArrow += '<div class="optionArrow" style="cursor:pointer; width:19px; height: 20px; left: -15px; top:'+((55*(id-chnOffset))+15)+'px;">></div>';
    huiPalette.append(huiStateArrow);
    
    $(huiStateObject).css("color", "#DDD");
    
    
    if(huiState>0){
        var huiIndex = 0;
        for(var bank=0;bank<4;bank++){
            for(var chn=0;chn<8;chn++){
                if(sessionState.faderHuiRoute[id] === (huiIndex+1)){
                    $("#huiRoute"+huiIndex).css("color", "#DDD");
                }
                else{
                    $("#huiRoute"+huiIndex).css("color", "#999");
                }
                huiIndex++;
            }
        }      
        var huiArrow = '';
        huiArrow += '<div class="optionArrow" style="cursor:pointer; width:19px; height: 20px; left: 88px; top:'+((28*huiState)+1+hOffset)+'px;">></div>';
        
        huiPalette.append(huiArrow);
        
    }
}

function drawTrackBackground()
{
    var buffer = document.createElement('canvas');
    buffer.width = timelineWidth;
    buffer.height = trackHeight;
    var ctx = buffer.getContext('2d');
    ctx.clearRect(0, 0, timelineWidth, trackHeight);
    ctx.beginPath(); 
    ctx.fillStyle = '#aaa';
    ctx.fillRect(1, 0, timelineWidth, trackHeight-1);
    ctx.stroke();

    ctx.beginPath();
    ctx.lineWidth="1";
    ctx.strokeStyle = '#000';
    ctx.moveTo(0,0);
    ctx.lineTo(timelineWidth,0);
    ctx.stroke();

    ctx.beginPath();
    ctx.lineWidth="1";
    ctx.strokeStyle = '#fff';
    ctx.moveTo(0,trackHeight-1);
    ctx.lineTo(timelineWidth, trackHeight-1);
    ctx.stroke();
    return buffer;
}

function drawTimeline(){
    
    var canvas = document.getElementById("c1");
    var context = canvas.getContext("2d");

    context.clearRect(0, 0, timelineWidth, timelineHeight);
    context.beginPath();

    for(var n=0;n<numOfTracks;n++) {   
        context.drawImage(trackBackground, 0, n*trackHeight);
    }
    context.stroke();
    
    
    var rulerCanvas = document.getElementById("autoRuler");
    rulerCanvas.width = 860;
    rulerCanvas.height = 21;
    rulerCanvas.style.width  = rulerCanvas.width.toString() + "px";
    rulerCanvas.style.height = rulerCanvas.height.toString() + "px";
    
}


function setStatus(chn, status){
    
    sessionState.faderStatuses[chn] = status;
    // timeline status box
    $("#statusTrackStatus"+(chn-1)).css(
        'background-color',statusColor[status]);
    $("#statusTrackStatus"+(chn-1)).css(
        'color',statusTextColor[status]);
    $("#statusTrackStatus"+(chn-1)).html(statusText[status]);
    
    // fader bank
    $("#statusLine"+(chn)).css(
        'background-color',statusColor[status]);
    
}
function setFaderLevel(chn, level){
    faderStatus[chn].level(level);
}
function setTouchSense(chn, touchSense){
    faderStatus[chn].knob(touchSense);
}
function getTouchSense(chn){
    return faderStatus[chn].touch;
}

function updateSessionStatuses(){
    for (var n=0;n<numOfTracks;n++){
        setStatus(n, sessionState.faderStatuses[n]);
    }
}

function refreshStatuses(){
    $("#autoStatuses").html(buildStatuses());
    drawTimeline();
    $("#autoStatuses").css({
        top: '-1px'
    }); 
}

function writeRegion(){
    this.buffer = {};
    this.ctx = {};
    this.path = {};
    this.start = null;
    this.end = null;
    this.dropIn = null;
    this.dropOut = null;
    this.lastPage = 0;
    this.lastPos = 0;
    this.feed = function(pos,level){
        if(pos>(this.lastPos+1))this.clear();
        this.end=pos;
        this.dropOut = (this.end-(page*timelineWidth));
        if(this.dropOut>timelineWidth)this.dropOut=timelineWidth;

        if(this.start===null || this.lastPage!==page){
            this.buffer = document.createElement('canvas');
            this.buffer.width = timelineWidth;
            this.buffer.height = trackHeight-2;
            this.ctx=this.buffer.getContext("2d");
            this.path=this.buffer.getContext("2d");
            this.start=pos;
            this.dropIn = this.start-(page*timelineWidth);
            if(this.dropIn<0)this.dropIn=0;
            this.ctx.beginPath();
            this.path.beginPath();
            this.path.lineWidth="2";
            this.path.strokeStyle = '#a00';
            this.path.moveTo(this.start-(page*timelineWidth),trackHeight-(level/scaleHeightRatio)-5);
        }
        else
        {
            this.path.lineTo(this.dropOut,trackHeight-(level/scaleHeightRatio)-5);
        }
        this.lastPage=page;
        this.lastPos=pos;
    };
    this.getStart = function(){
        return this.start-(page*timelineWidth);
    };
    this.getImage = function (){
        if(this.start===null || this.lastPage!==page){
            this.buffer = null;
        }
        else{
            this.ctx.fillStyle = '#f55';
            this.ctx.fillRect(this.dropIn, 1, this.dropOut-this.dropIn, trackHeight-3);
            this.ctx.stroke();
            this.path.stroke();
        }
        return this.buffer;
    };
    this.getContour = function (){
        this.path.rect(this.dropIn, 0, this.dropOut-this.dropIn, trackHeight-1);
        this.path.stroke();
        return this.buffer;
    };
    this.clear = function (){
        this.buffer=null;
        this.start=null;
    };
};

function trackPointsToImage(points,chn)
{
    var inScopeFlag = 0;
    points.sort;
     var keys = Object.keys(points);
     var length = keys.length;
     var buffer = document.createElement('canvas');
     buffer.width = timelineWidth;
     buffer.height = trackHeight;
     var ctx = buffer.getContext('2d');
     ctx.clearRect(0, 0, timelineWidth, trackHeight);
     /*
     ctx.lineWidth="1";
     ctx.strokeStyle = '#f00';
     ctx.beginPath(); 
     */
     if(redRegions[chn]){
        ctx.fillStyle = '#f66';
        var start, len;
        start = (Math.round(redRegions[chn].start)*zoom)-startOfScope+1;
        len = (Math.round(redRegions[chn].length)*zoom)+1;
        
        if(start<1) {
            len = len + start;
            start = 1;
        }
        if(len>timelineWidth) len = timelineWidth;
        
        if((start+len)>0) ctx.fillRect(start,1,len,trackHeight-3);
 //       ctx.rect(start,1,len,trackHeight-4);
 //       ctx.stroke();
     }
     
     ctx.lineWidth="2";
     ctx.strokeStyle = '#000';
     ctx.beginPath();  
     
     
     var lastLevel = null;
     
     if(length>1)
     {
        for(var n=0;n<length-0;n++)
        {
             var level = trackHeight-(Math.floor(points[keys[n]]/scaleHeightRatio))-3;
             var zoomedTime =  Math.round((keys[n]) * zoom);
                
             // when a point found inside scope
             if((zoomedTime)>(startOfScope+1))
             {
                // if point is not exceeding right scope
                if(zoomedTime<((startOfScope+timelineWidth)+0))
                {
                   if(lastLevel===null)lastLevel=level;
                   ctx.lineTo(zoomedTime-(startOfScope) + 1, lastLevel);
                   ctx.lineTo(zoomedTime-(startOfScope) +(zoom)+1, level);
                }  
                // if exceeding - break loop
                else
                {
                    break;
                }
             // if point is not in scope
             }
             else 
             {
                 ctx.moveTo(1,level);
             }
             lastLevel=level;
         }
     }
     ctx.lineTo(timelineWidth,lastLevel);
     ctx.stroke();
     return buffer;  
}


function findClosest (autoPts, pos){
//      var sortedKeys = getKeys(autoPts).sort(function (a, b) {
//            return a - b;
//            });   
      var key = getClosestIndex(getKeys(autoPts),pos);
      console.log("found point for: "+key);
};
function getKeys(object) {
    var keys = [];
    for (var key in object) {
        if (object.hasOwnProperty(key)) {
            keys.push(key);
        }
    }
    return keys;
};
  function getClosestIndex(sortedKeys, value) {
      var i;
      // Walk through the sorted keys array and stop when the next value is greater.
      for (i = 0; i < (sortedKeys.length-1); i++) {
          if (sortedKeys[i] > value) {
              // Either return the previous key, or zero if this was the first.
              return (i === 0) ? sortedKeys[0] : sortedKeys[i - 1];
          }
      } 
      // We reached the end, so the value is greater than the highest key we have.
      return sortedKeys[i];
}

function paintWorker(){
    
    requestAnimationFrame(paintWorker);
    // if stuff needs to be moved to on screen canvas: do it here
    // Check reDraw flag
    // Check scroll flag
    var transport = (position*zoom)-startOfScope;
    
    /*
    // jump to present time
    if(chaseFlag){
        chaseFlag = 0;
        startOfScope = 0;
    }
    */
    
    // if transport goes outside of canvas
    if(transport>timelineWidth || transport<0){
    // if a drag has started, inhibit page flip
        if(dragStartX){
            pageFlipInhibit=1;
        }
    // chase transport
        if(!pageFlipInhibit){
            
            while(transport>timelineWidth){
                startOfScope+=timelineWidth;
                transport = (position*zoom)-startOfScope;
            }
            while(transport<0){
                startOfScope-=timelineWidth;
                if(startOfScope<0){
                    startOfScope=0;
                    dragOffsetX=0;
                }
                transport = (position*zoom)-startOfScope;
            }
     // redraw paths
     rePaintFlag=1;
   
 //           for(var n=0;n<numOfTracks;n++) {   
//                timelinePaths[n] = trackPointsToImage(autoPts[n]);
//            } 
        }
    }
    // always release inhibit when transport is visible
    else{
        pageFlipInhibit=0;
    }
    
    if(rePaintFlag){   
            if(slideFlag){
                for(var n=0;n<numOfTracks;n++) {   
                    var chn=n;
                    timelinePaths[chn] = trackPointsToImage(autoPts[chn],chn);
                }  
            }else{
                for(var n=0;n<10;n++) {   
                    var chn=n+(chnOffset)-1;
                    if(chn>-1 && chn<96){
                       timelinePaths[chn] = trackPointsToImage(autoPts[chn],chn);
                    }
                }  
                
            }

        rePaintFlag=0;
        drawRuler();
    }
    


    var c = document.getElementById("c1");

    if(c){
      var context = c.getContext("2d");
     //   context.clearRect(0, 0, timelineWidth, timelineHeight*12);
        context.beginPath();


        if(slideFlag){
            context.clearRect(0, 0, timelineWidth, trackHeight*numOfTracks);
            for(var n=0;n<numOfTracks;n++) {   
               var chn=n;
               context.drawImage(trackBackground, 0, ((chn)*trackHeight)); 
               context.drawImage(timelinePaths[chn], 0, ((chn)*trackHeight)); 
            }            
        }
        else{
            for(var n=0;n<10;n++) {      
                var chn=n+(chnOffset)-1;
                if(chn>-1 && chn<96){
                   context.drawImage(trackBackground, 0, ((chn)*trackHeight)); 
                   context.drawImage(timelinePaths[chn], 0, ((chn)*trackHeight)); 
                }
            }            
        }



        if(transport>-1){
           context.moveTo(transport+2,0);
           context.strokeStyle = '#ff0000';
           context.lineTo(transport+2,numOfTracks*trackHeight);
           context.stroke();                
        }

    }

        
        /*
        for(n=0;n<48;n++){
            var obj = autoPts[n].filter(function ( obj ) {
                return obj.time === position;
            })[0];

            if(obj){
       //         faderStatus[1+n].level(obj.level);
            }
        }    
        
        */
}
var lastRemain;
var lastMarkerX = -1;
function drawRuler(){
    var canvas = document.getElementById("autoRuler");
    var context = canvas.getContext("2d");
    var buffer = document.createElement('canvas');
    buffer.width = 860;
    buffer.height = 21;
    var ctx = buffer.getContext('2d');
    ctx.beginPath(); 
    ctx.lineWidth="2";
    ctx.strokeStyle = '#999';
    // startOfScope
    
    ctx.moveTo(0,0);
    ctx.lineTo(0,20);
    ctx.lineTo(860,20);
    ctx.moveTo(0,21);
    ctx.lineTo(860,21);
    
    
    for(n=0;n<timelineWidth;n++){
        // kolla med scope & zoom
        // sätt ut streck
        var drawMarker = 0;
        var drawText = 0;
        var remain = (Math.round((startOfScope+n)/zoom)%fps);
        
 
        
        if((remain===0) && (remain!==lastRemain)){
   //     if((remain===0) && (n!==lastMarkerX)){
            var min = Math.floor((((startOfScope+n)/zoom)/fps)/60);
            var sec = (Math.round(((startOfScope+n)/zoom)/fps)%60);
            if(zoom === 2 || zoom === 5)            {drawMarker = 1;drawText = 1;}
            
            if(zoom === 1)                          drawMarker = 1;
            if(zoom === 1 && (sec%2) === 0 )        drawText = 1;
            
            if(zoom === 0.5 && (sec%2) === 0)       drawMarker = 1;
            if(zoom === 0.5 && (sec%5) === 0)       drawText = 1;
            
            if(zoom === 0.1 && ((sec%5) === 0))     drawMarker = 1;
            if(zoom === 0.1 && ((sec%15) === 0))    drawText = 1;

        }
        
        if(drawMarker)
        {
        //      if(min<10)min="0"+min;
                if(sec<10)sec="0"+sec;
                if(drawText)
                {
                    ctx.moveTo(n+3,7);
                    ctx.lineTo(n+3,20);
                    ctx.font = "900 11px Arial";
                    ctx.fillStyle = "#ccc";
                    ctx.textAlign="right"; 
                    ctx.fillText(min,n+1,17);
                    ctx.textAlign="left"; 
                    ctx.fillText(sec,n+5,17);
                }
                else
                {
                    ctx.moveTo(n+3,14);
                    ctx.lineTo(n+3,20);
                }
                lastMarkerX=n;
                ctx.stroke();
        }
            lastRemain=remain;
        // sätt ut text
    }
    context.clearRect(0, 0, 860, 21);
    context.fillStyle = '#555';
    context.beginPath();  
    context.fillRect(0,0,860,21);
    context.drawImage(buffer, 0, 0);
    context.stroke();
}

// When clicking status button left of the timeline
// id is the chn index starting at 0
var activeId = 0;
function statusClick(id) {
    var overlay = $("#autoOverlay");
    if(overlay.hasClass("hidden")){
        $("#autoOverlay").html(buildStatusPalette(id));
        overlay.removeClass("hidden");
        overlay.addClass("show");
        hlHuiStatus(id);
        activeId = id;
        statusColDragInhibit = 1;
    }
    else{
        if(id !== activeId){
            $("#autoOverlay").html(buildStatusPalette(id));
            hlHuiStatus(id);
            activeId = id;
        }
        else{
            overlay.removeClass("show");
            overlay.addClass("hidden");
            statusColDragInhibit = 0;
        }
    }
}
function huiStatusSet(id,status){
    
    sessionState.faderHuiStatuses[id]=status;
    $("#autoOverlay").html(buildStatusPalette(id));
    hlHuiStatus(id);
}
function huiRoute(id,status){
    
    sessionState.faderHuiRoute[id]=status+1;
    $("#autoOverlay").html(buildStatusPalette(id));
    hlHuiStatus(id);
}

function timeLineDragStart(xVal) {
    dragStartX=1;
    dragOffsetX = xVal;
};
function statusColumnDragStart(yVal) {
    if(!statusColDragInhibit){
       dragStartY=1;
       dragOffsetY = yVal;       
    }
};
function timeLineDragStop() {
    if(dragStartY){
        $("#autoStatuses").animate({
            top: '-'+((chnOffset*trackHeight)+1)+'px'
         }, 500);  
        $("#autoTracks").animate({
            top: '-'+((chnOffset*trackHeight))+'px'
         }, 500);  
         
         var tempBank = Math.floor(chnOffset/8)+1;
         if(tempBank<1)tempBank=1;
 //        faderBank.switch(tempBank);
    }
    startOfScopeY = (chnOffset*trackHeight);
    dragStartX=0;
    dragStartY=0;
};
function timeLineDrag(xVal,yVal) {
    if(dragStartX){
        if(xVal-dragOffsetX){
           startOfScope -= (xVal-dragOffsetX);
           dragOffsetX = xVal;
           if(startOfScope<0){
               startOfScope=0;
               dragOffsetX=0
           }
           rePaintFlag = 1;
        }
    }
    if(dragStartY){
        if(yVal-dragOffsetY){
            startOfScopeY -= (yVal-dragOffsetY); 
            chnOffset = (Math.round(startOfScopeY/trackHeight));
            
            
            rePaintFlag=1;
            if((yVal-dragOffsetY)!==0){
/*
                $("#autoStatuses").animate({
                   top: '-'+startOfScopeY+'px'
                }, 1);    
                $("#autoTracks").animate({
                   top: '-'+startOfScopeY+'px'
                }, 1);  
 */
                $("#autoStatuses").css('top', '-'+startOfScopeY+'px');
                $("#autoTracks").css('top', '-'+startOfScopeY+'px');
            }
            dragOffsetY = yVal;
        //    chnOffset = (Math.round(startOfScopeY/trackHeight));
            if(startOfScopeY<0){startOfScopeY=0;chnOffset=0;}


        }
    }
}


function getClosestPoint(time,points){
    var indx = points.length-1;
    while(indx>0){
        if(points[indx].time<(time+1)){
            return points[indx];
            break;
        }
        indx--;
    }
}

function resetTimelineOffset(){
    pageFlipInhibit=0;
    console.log("Reset timeline");
}

function setZoom(val){
    
    $("#zoom1").css(
        'background-color', BGR
    );
    $("#zoom1").css(
        'color', FGR
    );   
    $("#zoom2").css(
        'background-color', BGR
    );
    $("#zoom2").css(
        'color', FGR
    );   
    $("#zoom3").css(
        'background-color', BGR
    );
    $("#zoom3").css(
        'color', FGR
    );   
    $("#zoom4").css(
        'background-color', BGR
    );
    $("#zoom4").css(
        'color', FGR
    );   
    $("#zoom5").css(
        'background-color', BGR
    );
    $("#zoom5").css(
        'color', FGR
    );   
    zoom=val;
    rePaintFlag=1;
    if(val===0.1){
        $("#zoom1").css(
            'background-color', hlBGR
        );
        $("#zoom1").css(
            'color', hlFGR
        );        
    }
    if(val===0.5){
        $("#zoom2").css(
            'background-color', hlBGR
        );
        $("#zoom2").css(
            'color', hlFGR
        );        
    }
    if(val===1.0){
        $("#zoom3").css(
            'background-color', hlBGR
        );
        $("#zoom3").css(
            'color', hlFGR
        );        
    }
    if(val===2.0){
        $("#zoom4").css(
            'background-color', hlBGR
        );
        $("#zoom4").css(
            'color', hlFGR
        );        
    }
    if(val===5.0){
        $("#zoom5").css(
            'background-color', hlBGR
        );
        $("#zoom5").css(
            'color', hlFGR
        );        
    }
}
