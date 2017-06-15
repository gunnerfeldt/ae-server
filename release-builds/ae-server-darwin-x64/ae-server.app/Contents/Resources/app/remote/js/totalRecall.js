




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
    "snapshotScans":3,
    "sixk":1,
    "potBreakingPoint" : 410,
    "potScaleLo" : 2.6,
    "potScaleHi": 2.7 
  };

var holdit = 0;
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

    for(var i=0;i<8;i++)
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
    holdit = 1;
        clearCanvas();
        properties.recall.activeBank = wsObject.bank;
        properties.recall.activeRegion = wsObject.region;
        resetRecallLayout();
    holdit = 0;    
};  
  
  /*** NOT USED */
recall.newDeltaData = function(wsObject){
    properties.recall.activeRegion = wsObject.region;
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
                //     methodArray[callbackObject.guiMethod](callbackObject.args);
                } 
            });
    };
};  

recall.recallUpdates = function(wsObject){
        while(wsObject.updates.length){
            var thisUpdate = wsObject.updates.pop();
            var target = trObjects[thisUpdate.id][thisUpdate.chn];
            
            target.setCurrentValue(thisUpdate.val,
                function(callbackObject){
                    if(snapshotFlag) snapshotCycle();
                    else {
                        if(callbackObject.guiMethod && holdit == 0){
                                methodArray[callbackObject.guiMethod](callbackObject.args);
                        }
                    } 
                });
        }
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
    
    recallTemplate(properties.recall.activeBank);
        
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

for (var n = 0; n < 127; n++) {
    trObjects[n] = [];
    for (var i = 0; i < 96; i++) {
        trObjects[n][i] = new totalRecallClass(n, i);
        if ((trObjects[n][i].type & 1)) {
            trObjects[n][i].setRecallValue(Math.round(Math.random() * 800));
        }
        else {
            trObjects[n][i].setRecallValue(Math.round(Math.random()));
        }
        if      (n>0 && n<46) trObjects[n][i].region = 0;
        else if (n>45 && n<59) trObjects[n][i].region = 1;
        else if (n>58 && n<80) trObjects[n][i].region = 2;
        else if (n>79 && n<101) trObjects[n][i].region = 3;
        else if (n>100 && n<119) trObjects[n][i].region = 4;
    };
};

var potLink = [];
potLink[0x09] = 0x3e;
potLink[0x65] = 0x69;
potLink[0x42] = 0x22;
potLink[0x34] = 0x14;
potLink[0x4c] = 0x0c;
potLink[0x5c] = 0x1c;
potLink[0x30] = 0x70;
potLink[0x54] = 0x68;

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
  this.potOffset=120;
  this.guiIndex=null;
  this.index=0;
  this.alignBits=0;
  this.class="";
  this.idPre="";
  this.guiMethod="";
  this.dirty=0;
  this.switch = 0;
  var potScale = 2.7;
  if(trSettings.sixk && this.guiIndex ==0x44) this.potOffset = 180;
  
  
  for(var i=0;i<trAddressNames.length;i++){
      if(trAddress[i]===id){
          this.index = i;
          break;
      };
  };
  // if(id===0x44) this.potOffset = -240;
  
  
  this.name=trAddressNames[this.index];
  this.type=trAddressTypes[this.index];
  
  if(this.type===0){            // routing switch
      this.class="routingButton";
      this.idPre="switch";
      this.guiMethod="setRoutingSwitch";
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
  
  // Recall values should be stored in the right format. No need to convert the data here.
  this.setRecallValue = function(value){
    if((this.type&1)===0){   // switch
      this.recallValue=value;
    }
    else{               // pot
      this.recallValue=value;
      if(value<=trSettings.potBreakingPoint) potScale = trSettings.potScaleLo;
      else potScale = trSettings.potScaleHi;
      
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
        
        this.currentValue = value;
        var state = this.currentValue;
        if(this.recallValue !== this.currentValue) state = 2;

        callbackObject={
                "guiMethod":this.guiMethod,
                "redraw": true,
                "args": {
                    "guiIndex":this.address,
                    "currentValue": this.currentValue,
                    "recallValue": this.recallValue,
                    "region":this.region,
                    "switchState":state,
                    "chn": this.chn,
                }
        };   
    }
    // is a 10bit value (pot)
    else{
        if(this.class==="pot"){
        //    this.potAngle = Math.round(this.potAngle + ((value/3.41)+this.potOffset)*3)/4;
            if(value<=trSettings.potBreakingPoint) potScale = trSettings.potScaleLo;
            else potScale = trSettings.potScaleHi        
            this.potAngle = Math.round((value/potScale)+this.potOffset);
            
            if(this.guiIndex == 0x44) console.log(this.potAngle);
        }
        if(this.class==="thumbWheel"){
            this.vcaGroup = vcaGroupText[Math.floor((this.currentValue) / 102.4)];
        }
        if(1){   
          this.currentValue = value;
          callbackObject={
                "guiMethod":this.guiMethod,
                "redraw": true,
                "args": {
                    "guiIndex":this.address,
                    "currentValue": this.currentValue,
                    "recallValue": this.recallValue,
                    "potAngle":this.potAngle,
                    "potRingAngle":this.potRingAngle,
                    "vcaGroup":this.vcaGroup,
                    "chn": this.chn,
                    "region": this.region,
                    "switchState": this.switch
                    }
          };   
        }
     }
     if(callbackObject.redraw) {
         callback(callbackObject);
         this.dirty = 0;
     }
  };
  
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
                    if(args.guiIndex==0x44) {
                        if(trSettings.sixk){
                            args.potAngle /=4;
                            args.potAngle = 157 - args.potAngle;
                            args.potRingAngle /=4;
                            args.potRingAngle = 157 - args.potRingAngle;
                        }
                    }
                    drawKnob(args);
             },
        setSwitch: function(args){
                    if (!trSettings.sixk && (args.guiIndex != 0x04)){
                        drawButton(args);
                    }
                    else drawButton(args);

            },
        setRoutingSwitch: function(args){
                    drawRoutingButton(args);
            },
        setPullSwitch: function(args){
                    var id = args.guiIndex;
                    var chn = args.chn;
                    var linkedId = potLink[args.guiIndex];
                    var thisSwitch = trObjects[id][chn];
                    var linkedPot = trObjects[linkedId][chn];
                    linkedPot.switch = args.switchState;
                    args.guiIndex = linkedId;
                    args.potAngle = linkedPot.potAngle;
                    args.potRingAngle = linkedPot.potRingAngle;
                    drawKnob(args);
            },
        setSmallFader: function(args){
                    drawFader(args)  
             }, 
        setVcaFader: function(args){
             },
        setThumb: function(args){ 
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
