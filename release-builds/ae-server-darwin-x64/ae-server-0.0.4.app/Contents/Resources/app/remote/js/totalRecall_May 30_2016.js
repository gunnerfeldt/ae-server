




/*
 *  *** *** *** Total Recall Data Class *** *** ***
 *  
 *  Constructor:
 *      One instance for each Total Recall Object
 *      Input: MUX address (0-126) from SSL MPX table
 *      
 *  
 *  Overview:
 *      Can be switch or Pot. The class sort out how to handle
 *      the difference based on tables. Both recall values
 *      and current values are inserted into the object.
 *      Some global parameters can be set in the trSettings object.
 *      
 *  Methods:
 *  
 *      setRecallValue(val): returns (null)
 *          val = unprocessed ADC 10 bit data. The class will pack it to fit it's kind.
 *          This value is fetched from the session mix document and should be stored formated
 *          to fit it's type. 
 *          
 *      setCurrentValue(val): returns (function)
 *          val = unprocessed ADC 10 bit data. The class will pack it to fit it's kind.
 *          This value is fetched from the CV96 server. 
 *          When a region (Routing, Dyn..,,,) is requested by sending the TR request(Region + Bank)
 *          to the CV96 server the CV96 server will scan all bundled addresses in a cycle.
 *          For each address read the server will output command 250 (0xFA) with Region, Bank, 
 *          Address, Array of 10 bit values for 8 channels in bank. 
 *          CV96 will send each packet in a rate of approx 8.3ms. A full cycle depends on how many
 *          addresses exist in the active region.
 *          This also returns a function for updating the GUI.
 *          
 *      getCurrentValue(): returns (int)
 *          Should return tr-formatted value for session mix document.
 *          
 *      aligned(): returns (int)
 *          If recall and current values are considered aligned this returns true.
 *          Is used by the total recall scanner. When an object returns false the GUI waits for correction.
 *          Returns 1=true or 0=false.
 *          
 *          
 *      Misc. info.
 *          type - Bitfield to set different formatting used by scanner and GUI.
 *              bit 0   - 0 =   Switch
 *                      - 1 =   Pot
 *                              (Switch)
 *                                  Routing Switch
 *                              (Pot)
 *                                  Rotating pot, 0 at -160 degrees and max at +160.
 *              bit 1   - 1 =   (Switch)
 *                                  Horizontal switch
 *                              (Pot)
 *                                  Fader
 *              bit 2   - 1 =   (Switch)
 *                                  Vertical switch
 *                              (Pot)
 *                                  Thumbwheel
 *              bit 3   - 1 =   (Switch)
 *                                  Cut
 *              bit 4   - 1 =   (Switch)
 *                                  Solo Isolate
 *              bit 5   - 1 =   (Switch)
 *                                  No switch, hidden parameters (EQ type etc..)
 *          
 *       
 */

var trSettings = {
    "tolerance":30,   // 10 to 100. 10 is tight and 100 broad
    "switchThreshold":512,
    "antiLog":0,
    "reverse":0      ,
    "alignBits":0x03,
    "snapshotScans":3
  };

var snapshotFlag = 0;
var recall = {};
recall.on = function (name, callback){
        events.addListener(name, callback);
    };
    
recall.newData = function(wsObject){
    
    var trRegion    = wsObject.region;
    var trBank      = wsObject.bank;
    var trAddress   = wsObject.address;
    var trData      = wsObject.data;      // array of 8 10 bit values
    //
    //
//    console.log("addr:"+trAddress+", data:"+trData[0]);

    for(var i=0;i<8;i++)
//var i = 0;
    { 
        
        trObjects[trAddress][(trBank*8)+i].dirty=1;   
        var guiObj = trObjects[trAddress][(trBank*8)+i].setCurrentValue(trData[i],
            function(callbackObject){
                if(snapshotFlag) snapshotCycle();
                else {
                     methodArray[callbackObject.guiMethod](callbackObject.args);
                } 
                
            });

    };

};
    
recall.updatePage = function(wsObject){
    
        properties.recall.activeBank = wsObject.bank;
        properties.recall.activeRegion = wsObject.region;
        resetRecallLayout();
};    
recall.newDeltaData = function(wsObject){
    
    var trAddress   = wsObject.address;
    var trEvents    = wsObject.events;      // dynamic array
   
    
    for(var i=0;i<trEvents.length;i++)
    { 
        trDeltaObject = trEvents[i];
        trObjects[trAddress][trDeltaObject.chn].dirty=1;   
        var guiObj = trObjects[trAddress][trDeltaObject.chn].setCurrentValue(trDeltaObject.val,
            function(callbackObject){
                if(snapshotFlag) snapshotCycle();
                else {
                     methodArray[callbackObject.guiMethod](callbackObject.args);
                } 
                
            });

    };

};

function recallTabClick(element){
//    properties.recall.activeRegion = parseInt(element.getAttribute("id").substring(3));
    var newRegion = parseInt(element.getAttribute("id").substring(3));
    var wsObject = {
                "cmd":250,
                "region":newRegion,
                "bank":properties.recall.activeBank
    };
    events.fire("setRecall", wsObject);
 //   resetRecallLayout();
}

function resetRecallLayout(){
    
    var regions = document.getElementById("banks");
    var activeRegion = document.getElementById("tab"+properties.recall.activeRegion);
  
    
    for(n=0;n<regions.childNodes.length;n++){
        regions.childNodes[n].style.backgroundColor = "#777";
        regions.childNodes[n].style.border = "1px solid #333";
    }
    activeRegion.style.backgroundColor = "#ffcc00";
    activeRegion.style.border = "none";    
    
        
    switch(properties.recall.activeRegion){
        case 0:
            showRouting(properties.recall.activeBank);
            break;
        case 1:
            showDyn(properties.recall.activeBank);
            break;
        case 2:
            showEq(properties.recall.activeBank);
            break;
        case 3:
            showSend(properties.recall.activeBank);
            break;
        case 4:
            showSmall(properties.recall.activeBank);
            break;
        case 5:
            showVca(properties.recall.activeBank);
            break;
    }
    document.getElementById("mainGUI").appendChild(recallBankOverlay(0));
    document.getElementById("mainGUI").appendChild(recallBankOverlay(1));

/*   
    var wsObject = {
                "cmd":250,
                "region":properties.recall.activeRegion,
                "bank":properties.recall.activeBank
    };
    events.fire("setRecall", JSON.stringify(wsObject));
*/

}
function shiftBank(dir){
//    properties.recall.activeBank+=dir;
    var newBank = properties.recall.activeBank + dir;
    var wsObject = {
                "cmd":250,
                "region":properties.recall.activeRegion,
                "bank":newBank
    };
    events.fire("setRecall", wsObject);
//    resetRecallLayout();
}

var trObjects = [];

for (var n=0;n<127;n++){
    trObjects[n]=[];
    for (var i=0;i<96;i++){
        trObjects[n][i]= new totalRecallClass(n,i);
        if((trObjects[n][i].type&1)){
            trObjects[n][i].setRecallValue(Math.round(Math.random()*800));
        }
        else{
            trObjects[n][i].setRecallValue(Math.round(Math.random()));
        }
    };
};



function totalRecallClass(id,chn) {
  this.name=null;
//  this.address=trAddress[id];
  this.address=id;
  this.chn=chn;
  this.isAligned=0;
  this.type=null;
  this.region=null;
  this.currentValue=null;
  this.recallValue=null;
  this.potAngle=0;
  this.potRingAngle=0;
  this.vcaGroup=0;
  this.potOffset=-150;
  this.guiIndex=null;
  this.index=0;
  this.alignBits=0;
  this.class="";
  this.idPre="";
  this.guiMethod="";
  this.dirty=0;
  var potScale = 2.6;
  
  for(var i=0;i<trAddressNames.length;i++){
      if(trAddress[i]===id){
          this.index = i;
          break;
      };
  };
  if(id===0x44) this.potOffset = -240;
  
  
  this.name=trAddressNames[this.index];
  this.type=trAddressTypes[this.index];
  
  if(this.type===0){            // routing switch
      this.class="routingButton";
      this.idPre="switch";
      this.guiMethod="setSwitch";
  }
  if(this.type===1){            // standard knob
      this.class="pot";
      this.idPre="pot";
      this.alertIdPre="potRing";
      this.guiMethod="turnPot";
  }
  if(this.type===2){            // standard switch
      this.class="horizButton";
      this.idPre="switch";
      this.guiMethod="setSwitch";
  }
  if(this.type===3){            // small fader
      this.class="smallFader";
      this.idPre="smallFader";
      this.alertIdPre="smallFaderAlert";
      this.guiMethod="setSmallFader";
  }
  if(this.type===4){            // vertical switch
      this.class="vertButton";
      this.idPre="switch";
      this.guiMethod="setSwitch";
  }
  if(this.type===5){            // thumbWheel
      this.class="thumbWheel";
      this.idPre="group";
      this.idPreAlert="GroupAlert";
      this.guiMethod="setThumb";
  }
  if(this.type===7){            // vcaFader
      this.class="vcaFader";
      this.idPre="vcaFader";
      this.alertIdPre="vcaFaderAlert";
  }
  if(this.type===8){            // SSL square switch
      this.class="squareButton";
      this.idPre="switch";
      this.guiMethod="setSwitch";
  }
  if(this.type===16){            // pull pot
      this.class="pullButton";
      this.idPre="switch";
      this.guiMethod="setPullSwitch";
  }
  
  
  // scanner check
  this.aligned = function(){
    var bit = 0;
    if((this.type&1)===0){   // switch
      if(this.currentValue===this.recallValue)bit = 1;
      else bit = 0;
    }
    else{               // pot
      // tolerance is fetched from the trSettings object
//      if((Math.floor(this.currentValue/trSettings.tolerance))===(Math.floor(this.recallValue/trSettings.tolerance)))bit = 1;
        var diff = Math.floor(Math.abs(this.currentValue - this.recallValue) / trSettings.tolerance);
        if(diff === 0) bit = 1;
        else bit = 0;
    };
    
    this.alignBits = (this.alignBits << 1) + bit;
 //   return bit;
    
    if((this.alignBits & trSettings.alignBits) === trSettings.alignBits) return 1;
    else return 0;
    
  };
  
  // Recall values should be stored in the right format. No need to convert the data here.
  this.setRecallValue = function(value){
    if((this.type&1)===0){   // switch
      this.recallValue=value;
    }
    else{               // pot
      this.recallValue=value;
      this.potRingAngle = Math.round(value/potScale)+this.potOffset;
    };
  };
 
  
  // Current values comes in raw. Must be formatted
  // 
  this.setCurrentValue = function(value, callback){
    var analogBit = this.type & 1;
    var typeBits = (this.type>>1) & 0x0F;
    var callbackObject = {
                    "redraw": false
    };
    
    // is a 1bit value (switch)
    if(!analogBit){
      var temp = 0;
      // switch value is set when ADC value is over a threshold
      // threshold is fetched from the trSettings object
      if(value>trSettings.switchThreshold)temp=1;
      
      // check to see if current value has changed or dirty
      if(temp !== this.currentValue || this.dirty){
        this.currentValue = temp;
        var state = ((this.recallValue !== this.currentValue)<<1) + this.currentValue;
        // is aligned?
        callbackObject={
                "guiMethod":this.guiMethod,
                "redraw": true,
                "args": {
                    "class":this.class,
                    "idPre":this.idPre,
                    "guiIndex":this.address,
                    "cssId": "" + this.idPre + this.chn + ":" + this.address,
                    "cssIdAlert": "" + this.alertIdPre + this.chn + ":" + this.address,
                    "currentValue": this.currentValue,
                    "recallValue": this.recallValue,
                    "switchState":state,
                    "aligned": this.aligned()
                    }
        };      
      }     
    }
    // is a 10bit value (pot)
    else{
        if(this.class==="pot"){
        //    this.potAngle = Math.round(this.potAngle + ((value/3.41)+this.potOffset)*3)/4;
            this.potAngle = Math.round((value/potScale)+this.potOffset);
        }
        if(this.class==="thumbWheel"){
            this.vcaGroup = vcaGroupText[Math.floor((this.currentValue) / 102.4)];
        }
              // check to see if current value has changed or dirty
        if(value !== this.currentValue || this.dirty){
          this.currentValue = value;
          callbackObject={
                "guiMethod":this.guiMethod,
                "redraw": true,
                "args": {
                    "class":this.class,
                    "idPre":this.idPre,
                    "alertIdPre":this.alertIdPre,
                    "guiIndex":this.address,
                    "cssId": "" + this.idPre + this.chn + ":" + this.address,
                    "cssIdAlert": "" + this.alertIdPre + this.chn + ":" + this.address,
                    "currentValue": this.currentValue,
                    "recallValue": this.recallValue,
                    "potAngle":this.potAngle,
                    "potRingAngle":this.potRingAngle,
                    "vcaGroup":this.vcaGroup,
                    "aligned": this.aligned()
                    }
          };   
        }
     }
     if(callbackObject.redraw) {
         callback(callbackObject);
         this.dirty = 0;
     }
  };
  
  /*
  // Current values comes in raw. Must be formatted
  this.setCurrentValue = function(value){
    var returnObj;
    if((this.type&1)===0){   // switch
      // switch value is set when ADC value is over a thershold
      // threshold is fetched from the trSettings object
      if(value>trSettings.switchThreshold)this.currentValue=1;
      else this.currentValue=0;
    }
    else{  
        if((this.type&2)===0){
        // pot
            this.currentValue=value;
            this.potAngle = Math.round(this.potAngle + (this.currentValue/3.41)+this.potOffset)/2;
        }
        else{
        // fader   
            this.currentValue=value;
        }
    };
    
    if((this.type&1)===0){    // switch
        var state = ((this.recallValue !== this.currentValue)<<1) + this.currentValue;
    //    var state = this.currentValue;
        returnObj={
                    "type":this.type,
                    "guiIndex":this.index,
                    "switchState":state,
                    "class":this.class
        };
    }
    else{                   // pot
        returnObj={
                    "type":this.type,
                    "guiIndex":this.index,
                    "potAngle":this.potAngle,
                    "potRingAngle":this.potRingAngle,
                    "currentValue":this.currentValue,
                    "recallValue":this.recallValue,
                    "class":this.class,
                    "idPre":this.idPre
        };
    };
    return returnObj;
  };
  */
 
 
    // value is formatted and ready to export
  this.getCurrentValue = function(){
    return this.currentValue;
  };    // value is formatted and ready to export
  this.getClass = function(){
    return this.class;
  };

};

var methodArray = {
        turnPot: function(args){
                rotateAnimation(args.cssId,args.potAngle);
                
                var alertElem = document.getElementById(args.cssIdAlert);
                if(args.aligned) {
                    hideElem(alertElem);
                }
                else{
                    showElem(alertElem);
                    rotateAnimation(args.cssIdAlert,args.potRingAngle);
                }
             },
        setSwitch: function(args){
                // Find element
                if(document.getElementById(args.cssId)){
                    var targetElement = document.getElementById(args.cssId);
                // Clear classes
                // set Base class
                    targetElement.className = args.class;
                // add classes
                    targetElement.classList.add(switchClass[args.switchState]);
                // Done
                }
            },
        setPullSwitch: function(args){
   
                // Find element
                if(document.getElementById(args.cssId)){
                    var targetElement = document.getElementById(args.cssId);
                // Clear classes
                // set Base class
             //       targetElement.className = args.class;
                // add classes
             //       targetElement.classList.add(switchClass[args.switchState]);
                // Done
                }
                
            },
        setSmallFader: function(args){
                var elem = document.getElementById(args.cssId);
                var top = (426-(args.currentValue/3.3))+"px";    
                elem.style.top = top;
                
                var alertElem = document.getElementById(args.cssIdAlert);
                if(args.aligned){
                    hideElem(alertElem);
                }
                else{
                    showElem(alertElem);
                    var top = (421-(args.recallValue/3.3))+"px";    //4.09
                    alertElem.style.top = top;
                }
             }, 
        setVcaFader: function(args){
                var elem = document.getElementById(args.cssId);
                var top = (488-(args.currentValue/2.2143))+"px";    
                elem.style.top = top;
                
                var alertElem = document.getElementById(args.cssIdAlert);
                if(args.aligned){
                    hideElem(alertElem);
                }
                else{
                    showElem(alertElem);
                    var top = (484-(args.recallValue/2.2143))+"px";    
                    alertElem.style.top = top;
                }                
             },
        setThumb: function(args){
                var elem = document.getElementById(args.cssId);
                elem.innerHTML = args.vcaGroup;
                
                var alertElemUp = document.getElementById("up"+args.cssIdAlert);
                var alertElemDown = document.getElementById("down"+args.cssIdAlert);
        
                if(args.aligned){
                    hideElem(alertElemUp);
                    hideElem(alertElemDown);
                }
                else{
                    if(args.currentValue<args.recallValue){
                        hideElem(alertElemDown);
                        showElem(alertElemUp);             
                    }
                    else{
                        hideElem(alertElemUp);
                        showElem(alertElemDown);                        
                    }
                }  
             }
      };
      
    var switchClass = [
            "off","on","offAlert","onAlert"
        ];
    function hideElem(elem){
            if(!elem.classList.contains('hidden'))
                {
                   elem.classList.add("hidden");
                }  
                
                console.log("hide");
         }
    function showElem(elem){
            if(elem.classList.contains('hidden'))
                {
                   elem.classList.remove("hidden");
                }  
         }
         
  function drawKnob(ctx,x,y,deg,color,knobNull,target,glow){
    // drawKnob args
    // ctx = context of canvas to draw to
    // x coord (center of knob)
    // y coord (center of knob)
    // angle of marker (0 is right, 270 up, etc..)
    // color of knob
    // type of knob. Null angle where a pan is 'up', etc..
    //    arg could be 'volume', 'up', 'left', 'right', 'down',
    //    where 'volume' is 130deg for now.
    // angle of target - if left out (no ring)
    // glow 0-100 opacity of target ring 
    
    // Knob marker coords
    Math.TAU = 2 * Math.PI;
    var hArmRadians = Math.TAU * (deg / 360);
    var hArmStart = 3;
    var hArmLength = ballDim + 1;
    var startX = (x) + Math.cos(hArmRadians - (Math.TAU)) * hArmStart;
    var startY = (y) + Math.sin(hArmRadians - (Math.TAU)) * hArmStart;
    var targetX = (x) + Math.cos(hArmRadians - (Math.TAU)) * hArmLength;
    var targetY = (y) + Math.sin(hArmRadians - (Math.TAU)) * hArmLength;
    
    // clear area
    ctx.fillStyle = backG;
    ctx.fillRect(x-(ballDim)-(lineW*2),y-(ballDim)-(lineW*2),(ballDim*2)+(lineW*4),(ballDim*2)+(lineW*4));
    
    // do filled circle
    ctx.beginPath();
    ctx.lineWidth = 1;
    ctx.strokeStyle = color;
    ctx.arc(x, y, ballDim, 0 ,2*Math.PI);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.stroke();  
    
    // do knob marker
    ctx.beginPath();
    ctx.lineWidth = lineW;
    if(!target) ctx.strokeStyle = backG;
    else ctx.strokeStyle = "#ffcc00";
    ctx.moveTo(startX,startY);
    ctx.lineTo(targetX,targetY);
    ctx.stroke();
    
    // target ring
    if(target) 
    {
      var glowColor = 'rgba(255,204,0,'+(glow/matchTolerance)+')'
      ctx.beginPath();
      ctx.lineWidth = lineW;
      ctx.strokeStyle = glowColor;
      if (knobNull == 'up') {
        if (target >= 270 || target <= 90) ctx.arc(x, y, (ballDim+(lineW/2)), degToRad(270), degToRad(target));
        else ctx.arc(x, y, (ballDim+(lineW/2)), degToRad(target), degToRad(270));
      }
      else if (knobNull == 'down') {
        if (target >= 270 || target <= 90) ctx.arc(x, y, (ballDim+(lineW/2)), degToRad(target), degToRad(90));
        else ctx.arc(x, y, (ballDim+(lineW/2)), degToRad(90), degToRad(target));
      }
      else if (knobNull == 'left') {
        if (target >= 180) ctx.arc(x, y, (ballDim+(lineW/2)), degToRad(180), degToRad(target));
        else ctx.arc(x, y, (ballDim+(lineW/2)), degToRad(target), degToRad(180));
      }
      else if (knobNull == 'right') {
        if (target >= 180) ctx.arc(x, y, (ballDim+(lineW/2)), degToRad(target), degToRad(360));
        else ctx.arc(x, y, (ballDim+(lineW/2)), degToRad(0), degToRad(target));
      }
      else if (knobNull == 'volume') {
        ctx.arc(x, y, (ballDim+(lineW/2)), degToRad(130), degToRad(target));
      }   
      ctx.stroke();
    }
  } 