
var properties = {
    "box"               : "",
    "reel"              : "",
    "fileLabel"         : "",
    "fileAttributes"    : [
        {
            "type"      : "text",
            "label"     : "Mix label",
            "value"     : ""
        },
        {
            "type"      : "text",
            "label"     : "Operator",
            "value"     : ""
        },
        {
            "type"      : "text",
            "label"     : "Comment",
            "value"     : ""
        },
        {
            "type"      : "checkbox",
            "label"     : "Automation",
            "value"     : true
        },
        {
            "type"      : "checkbox",
            "label"     : "Recall",
            "value"     : false
        }
    ],
    "sessionState"      : {},
    "browser":{
        "height"        : 0,
        "width"         : 0
    },
    "state":{
        "activeMode"    : "none",
        "bankPage"      : 0
    },
    "recall":{
        "activeRegion"  : 0,
        "activeBank"    : 0
    },
    "hui":{
        "inputs"        : {
            "units"         : [],
            "numOfTracks"   : 0,
            "list"          : [],
            "activeLink"    : 0,
            "activeMode"    : 0,
            "trackLinks"    : []
        },
        "outputs"       : {
            "units"         : [],
            "numOfTracks"   : 0,
            "list"          : [],
            "activeLink"    : 0,
            "activeMode"    : 0,
            "trackLinks"    : []
        }
    }
};

var cv96 = {
    "server"        :{
        "connected"     : false,
        "ip"            : "localhost"
    },
    "numOfBanks"    : 12,
    "numOfTracks"   : 0,
    "bank"          : 0,
    "localStates"   : {
        "tracks"        :[]
    }
    
};

properties.sessionState = {
    "faders"    : []
}
for(var i = 0;i<(cv96.numOfBanks*8);i++){
    properties.sessionState.faders[i] = {};
    properties.sessionState.faders[i].level = 0;
    properties.sessionState.faders[i].hui = {
        "huiMode"   : 0
    };
}
console.log("Init "+properties.sessionState.faders.length+" faders");

function storeRecallData(data){
    var arr = [];
    var recallData = ((data[0]&0x08)>3); // bit 3 sets Recall Data. Otherwise it's current status.
    switch(data[1]) {                   // index 1 contains Region
    case 0:                             // Routing
        if(recallData){
            switchRecs=getValues(data,3,48);
            potRecs=getValues(data,51,3);
        }
        else{
            switches=getValues(data,3,48);
            pots=getValues(data,51,3);
        }
        break;
    case 1:                             // Dynamics
        if(recallData){
            switchRecs=getValues(data,3,0);
            potRecs=getValues(data,0,0);
        }
        else{
            switches=getValues(data,3,0);
            pots=getValues(data,0,0);
        }
        break;
    case 2:                             // Eq
        if(recallData){
            switchRecs=getValues(data,3,12);
            potRecs=getValues(data,15,8);
        }
        else{
            switches=getValues(data,3,12);
            pots=getValues(data,15,8);
        }
        break;
    case 3:                             // Sends
        if(recallData){
            switchRecs=getValues(data,3,0);
            potRecs=getValues(data,0,0);
        }
        else{
            switches=getValues(data,3,0);
            pots=getValues(data,0,0);
        }
        break;
    case 4:                             // Faders
        if(recallData){
            switchRecs=getValues(data,3,0);
            potRecs=getValues(data,0,0);
        }
        else{
            switches=getValues(data,3,0);
            pots=getValues(data,0,0);
        }
        break;
    default:
        return -1;
    } 
    
    return 0;
}

function getValues(data, start, length){
    var arr = [];
    for (var n = 0;n<length;n++){
        arr[n] = data[start+n];
    }
    return arr;
}

function newSwitchData(data){
    var arr = [];
    var recallData = ((data[0]&0x08)>3); // bit 3 sets Recall Data. Otherwise it's current status.
    switch(data[1]) {                   // index 1 contains Region
    case 0:                             // Routing
        if(recallData){
            switchRecs=getValues(data,3,48);
            potRecs=getValues(data,51,3);
        }
        else{
            switches=getValues(data,3,48);
            pots=getValues(data,51,3);
        }
        break;
    case 1:                             // Dynamics
        if(recallData){
            switchRecs=getValues(data,3,0);
            potRecs=getValues(data,0,0);
        }
        else{
            switches=getValues(data,3,0);
            pots=getValues(data,0,0);
        }
        break;
    case 2:                             // Eq
        if(recallData){
            switchRecs=getValues(data,3,12);
            potRecs=getValues(data,15,8);
        }
        else{
            switches=getValues(data,3,12);
            pots=getValues(data,15,8);
        }
        break;
    case 3:                             // Sends
        if(recallData){
            switchRecs=getValues(data,3,0);
            potRecs=getValues(data,0,0);
        }
        else{
            switches=getValues(data,3,0);
            pots=getValues(data,0,0);
        }
        break;
    case 4:                             // Faders
        if(recallData){
            switchRecs=getValues(data,3,0);
            potRecs=getValues(data,0,0);
        }
        else{
            switches=getValues(data,3,0);
            pots=getValues(data,0,0);
        }
        break;
    default:
        return -1;
    } 
    
    return 0;
}

function newRecallUpdate(chnIndex, objectIndex, posValue){
         // 0xF9 = Realtime Pot event
        var pot='pot'+chnIndex+':'+objectIndex;
        // var pots = localStorage.pots;
        // pots[arr[1]]=arr[2];

        // localStorage.setItem('pots', pots);  
        
        rotateAnimation(pot, 210 + (1.17*posValue));  
}
var bubbleDiv = document.createElement('div');
bubbleDiv.id = "bubbleDiv";
bubbleDiv.style.position = "absolute";
bubbleDiv.style.width = "100%";
bubbleDiv.style.height = "100%";
bubbleDiv.style.left = "0px";
bubbleDiv.style.top = "0px";
bubbleDiv.style.zIndex = "90";
