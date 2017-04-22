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
    var m = (chn-1) * 12;
    var o = (chn-1) * 8;
    var realChn = (bank-1)*8;
    
    var skin = 0;
    
    // AE
    if(skin===0){
        var filterImg = localStorage.pot;
        var loImg = localStorage.pot;
        var loMidImg = localStorage.pot;
        var hiMidImg = localStorage.pot;
        var hiImg = localStorage.pot;        
    }
    
    // 4000E - old
    if(skin===1){
        var filterImg = localStorage.potSslGray;
        var loImg = localStorage.potSslBrown;
        var loMidImg = localStorage.potSslBlue;
        var hiMidImg = localStorage.potSslGreen;
        var hiImg = localStorage.potSslRed;        
    }

    // 4000E
    if(skin===2){
        var filterImg = localStorage.potSslGray;
        var loImg = localStorage.potSslBlack;
        var loMidImg = localStorage.potSslBlue;
        var hiMidImg = localStorage.potSslGreen;
        var hiImg = localStorage.potSslRed;
    }
    // 4000G
    if(skin===3){
        var filterImg = localStorage.potSslGray;
        var loImg = localStorage.potSslBlack;
        var loMidImg = localStorage.potSslBlue;
        var hiMidImg = localStorage.potSslGreen;
        var hiImg = localStorage.potSslPink;
    }
    
    realChn += chn;
    var channel = '<div class="channelStrip" id="strip'+chn+'">';
    channel+='<img class="knobLPRing" id="potRing'+m+'" src="">';
    channel+='<img class="knobLP" id="pot'+m+'" src="'+filterImg+'">';
    channel+='<img class="knobHPRing" id="potRing'+(m+1)+'" src="">';
    channel+='<img class="knobHP" id="pot'+(m+1)+'" src="'+filterImg+'">';
    channel+='<img class="knobHFGainRing" id="potRing'+(m+2)+'" src="">';
    channel+='<img class="knobHFGain" id="pot'+(m+2)+'" src="'+hiImg+'">';
    channel+='<img class="knobHFRing" id="potRing'+(m+3)+'" src="">';
    channel+='<img class="knobHF" id="pot'+(m+3)+'" src="'+hiImg+'">';
    channel+='<img class="knobHMFGainRing" id="potRing'+(m+4)+'" src="">';
    channel+='<img class="knobHMFGain" id="pot'+(m+4)+'" src="'+hiMidImg+'">';
    channel+='<img class="knobHMFRing" id="potRing'+(m+5)+'" src="">';
    channel+='<img class="knobHMF" id="pot'+(m+5)+'" src="'+hiMidImg+'">';
    channel+='<img class="knobHMFQRing" id="potRing'+(m+6)+'" src="">';
    channel+='<img class="knobHMFQ" id="pot'+(m+6)+'" src="'+hiMidImg+'">';
    channel+='<img class="knobLMFGainRing" id="potRing'+(m+7)+'" src="">';
    channel+='<img class="knobLMFGain" id="pot'+(m+7)+'" src="'+loMidImg+'">';
    channel+='<img class="knobLMFRing" id="potRing'+(m+8)+'" src="">';
    channel+='<img class="knobLMF" id="pot'+(m+8)+'" src="'+loMidImg+'">';
    channel+='<img class="knobLMFQRing" id="potRing'+(m+9)+'" src="">';
    channel+='<img class="knobLMFQ" id="pot'+(m+9)+'" src="'+loMidImg+'">';
    channel+='<img class="knobLFGainRing" id="potRing'+(m+10)+'" src="">';
    channel+='<img class="knobLFGain" id="pot'+(m+10)+'" src="'+loImg+'">';
    channel+='<img class="knobLFRing" id="potRing'+(m+11)+'" src="">';
    channel+='<img class="knobLF" id="pot'+(m+11)+'" src="'+loImg+'">';
    
    channel+='<img class="buttSplit" id="butt'+(o+0)+'" src="'+localStorage.buttOff+'">';
    channel+='<img class="buttHmfx3" id="butt'+(o+1)+'" src="'+localStorage.buttOff+'">';
    channel+='<img class="buttEqPre" id="butt'+(o+2)+'" src="'+localStorage.buttOff+'">';
    channel+='<img class="buttEqIn" id="butt'+(o+3)+'" src="'+localStorage.buttOff+'">';
    channel+='<img class="buttLmfx3" id="butt'+(o+4)+'" src="'+localStorage.buttOff+'">';
    channel+='<img class="buttEqChn" id="butt'+(o+5)+'" src="'+localStorage.buttVertOff+'">';
    channel+='<img class="buttEqDyn" id="butt'+(o+6)+'" src="'+localStorage.buttVertOff+'">';
    channel+='<img class="buttEqMon" id="butt'+(o+7)+'" src="'+localStorage.buttVertOff+'">';
    
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
            var y=24+(p*39);
            var x2=x+4;
            var y2=y-14;
            id=(chn-1)+':'+no;
            var swImg="width: 18px; height: 18px;background: url('img/routingSwitch.png') 0 0";
            channel+='<img id="led'+id+'" style="position:absolute;left:'+x2+'px;top:'+y2+'px;" src="'+localStorage.ledRoutingOff+'">'; 
            channel+='<div id="switch'+id+'" style="position:absolute;left:'+x+'px;top:'+y+'px; '+swImg+'"/>'; 
        //    channel+='<img id="switch'+id+'" style="position:absolute;left:'+x+'px;top:'+y+'px;" src="'+localStorage.switchRoutingOff+'">'; 
            no++;
        }
    }
    
    var id=(chn-1)+':';
    channel+='<img class="knobPanRing" id="potRing'+id+0+'" src="">';
    channel+='<img class="knobPan" id="pot'+id+0+'" src="'+localStorage.pot+'">';
    channel+='<img class="knobLineRing" id="potRing'+id+1+'" src="">';
    channel+='<img class="knobLine" id="pot'+id+1+'" src="'+localStorage.pot+'">';
    channel+='<img class="knobMicRing" id="potRing'+id+2+'" src="">';
    channel+='<img class="knobMic" id="pot'+id+2+'" src="'+localStorage.pot+'">';
    channel+='<img class="buttPan" id="butt'+id+36+'" src="'+localStorage.buttOff+'">';
    channel+='<img class="buttFlip" id="butt'+id+37+'" src="'+localStorage.buttOff+'">';
    channel+='<img class="buttSub" id="butt'+id+38+'" src="'+localStorage.buttOff+'">';
    channel+='<img class="buttPhase" id="butt'+id+39+'" src="'+localStorage.buttOff+'">';
    channel+='<img class="butt48" id="butt'+id+40+'" src="'+localStorage.buttOff+'">';
   
    
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
    var id='';
     
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
    var id='';
     
    channel+='<div class="chnNo">';
    channel+='<p>'+realChn+'</p>';
    channel+='</div>';
    channel+='</div>';


    return channel;
}

function showFadersGUI (chn, bank){
    
    var m = (chn-1) * 5;
    var no = 0;
    var realChn = (bank-1)*8;
    realChn += chn;
    var channel = '<div class="channelStrip" id="strip'+chn+'">';
    var p, q;
    var id='';
     
    channel+='<div class="chnNo">';
    channel+='<p>'+realChn+'</p>';
    channel+='</div>';
    channel+='</div>';


    return channel;
}

