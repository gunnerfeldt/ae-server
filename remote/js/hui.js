
var self = this;
this.on = function (name, callback){
    events.addListener(name, callback);
};

function initHui(){
    
    properties.hui.inputs.units[0] = {
        "name"          : "AE In 1",
        "channels"      : 8
    };
    properties.hui.inputs.units[1] = {
        "name"          : "AE In 2",
        "channels"      : 8
    };    
    properties.hui.inputs.units[2] = {
        "name"          : "AE In 3",
        "channels"      : 8
    };
    properties.hui.inputs.units[3] = {
        "name"          : "AE In 4",
        "channels"      : 8
    };    
    properties.hui.outputs.units[0] = {
        "name"          : "AE Out 1",
        "channels"      : 8
    };
    properties.hui.outputs.units[1] = {
        "name"          : "AE Out 2",
        "channels"      : 8
    };
    properties.hui.outputs.units[2] = {
        "name"          : "AE Out 3",
        "channels"      : 8
    };
    properties.hui.outputs.units[3] = {
        "name"          : "AE Out 4",
        "channels"      : 8
    };
    
    properties.hui.inputs.numOfTracks = 0;
    properties.hui.outputs.numOfTracks = 0;
    
    var index=0;
    
    for(n=0;n<properties.hui.inputs.units.length;n++){
        for(m=0;m<properties.hui.inputs.units[n].channels;m++){
            properties.hui.inputs.list[index] = {
                "unitIndex" : n,
                "name"      : properties.hui.inputs.units[n].name + " - "+(index+1),
                "channel"   : m,
                "vca"       : 0,
                "set"       : 0,
                "mode"       : 0,
                "trackLinks": []
            };
            properties.hui.outputs.list[index] = {
                "unitIndex" : n,
                "name"      : properties.hui.inputs.units[n].name + " - "+(index+1),
                "channel"   : m,
                "vca"       : 0,
                "set"       : 0,
                "mode"       : 0,
                "trackLinks": []
            };
            index++;
        }
        properties.hui.inputs.numOfTracks += properties.hui.inputs.units[n].channels;
        properties.hui.outputs.numOfTracks += properties.hui.outputs.units[n].channels;
    }
    
    for(n=0;n<cv96.numOfTracks;n++){
        properties.hui.inputs.trackLinks[n] = {
            "mode"          :0,
            "index"         :-1
        };
    }
    
    for(var i=0;i<properties.hui.inputs.list.length;i++){
        properties.hui.inputs.list[i].trackLinks = [];
    }
}

/************************************************************************************************************************
 * 
 * 
 *          ***   ***   ***  ***   ***   ***  ***  ***   HUI HUI HUI   ***   ***   ***  ***   ***   ***  ***   ***  
 * 
 *  Open first menu
 *  When hover, close all menus sub to this, open submenu
 * 
 * 
 * 
 * 
 ************************************************************************************************************************/
var openMenu = 0;
var openMenuLevel = -1;
var statusItems;
var huiIitems;

function initStatusItems(){
    statusItems = {
        "name"      : "Status menu",
        "id"        : 0,
        "items"     :[{
            "name"      : "CV96 Status",
            "id"        : 0,
            "items"     :[{
                            "name"  : "Manual",
                            "id"    : 0,
                            "parent"    :{},
                            "status"    : function(track){
                                 if(cv96.localStates.tracks[track].status === 0) return "#fff";
                            },
                            "clickMethod"    : function(track){
                                var data = {
                                    "cmd"       : 0x42,
                                    "track"     : track,
                                    "status"    : 0
                                };
                                events.fire("huiLink", data);
                            },
                            "color"     : function(){
                            //    return "#999";
                            }
                        },{
                            "name"  : "Auto",
                            "id"    : 1,
                            "parent"    :{},
                            "status"    : function(track){
                                 if(cv96.localStates.tracks[track].status === 1) return "#fff";
                            },
                            "clickMethod"    : function(track){
                                var data = {
                                    "cmd"       : 0x42,
                                    "track"     : track,
                                    "status"    : 1
                                };
                                events.fire("huiLink", data);
                            },
                            "color"     : function(){
                            //    return "#999";
                            }
                        },{
                            "name"  : "Touch",
                            "id"    : 2,
                            "parent"    :{},
                            "status"    : function(track){
                                 if(cv96.localStates.tracks[track].status === 2) return "#fff";
                            },
                            "clickMethod"    : function(track){
                                var data = {
                                    "cmd"       : 0x42,
                                    "track"     : track,
                                    "status"    : 2
                                };
                                events.fire("huiLink", data);
                            },
                            "color"     : function(){
                            //    return "#999";
                            }
                        },{
                            "name"  : "Write",
                            "id"    : 3,
                            "parent"    :{},
                            "status"    : function(track){
                                 if(cv96.localStates.tracks[track].status === 3) return "#fff";
                            },
                            "clickMethod"    : function(track){
                                var data = {
                                    "cmd"       : 0x42,
                                    "track"     : track,
                                    "status"    : 3
                                };
                                events.fire("huiLink", data);
                            },
                            "color"     : function(){
                            //    return "#999";
                            }
                        }],
            "parent"    :{} ,
            "color"     : function(){
            //    return "#999";
            }
        },{
            "name"      : "HUI input",
            "id"        : 1,
            "items"     :[],
            "parent"    :{},
            "color"     : function(track){
                            if(properties.sessionState.faders[track].hui.huiMode === 1) return "#ffcc00";
                        }
        },{
            "name"      : "HUI VCA style",
            "id"        : 2,
            "items"     :[] ,
            "parent"    :{},
            "color"     : function(track){
                            if(properties.sessionState.faders[track].hui.huiMode === 2) return "#ffcc00";
             }
        }]
    };
    
    function setParents(item){
        // har jag subItems?
        if(item.items){
            // räkna igen dem
            for(var n=0;n<item.items.length;n++){
                // länka alla subItems till this
                item.items[n].parent = item;
                // console.log("Set parent="+item.name+", for "+item.items[n].name);
                // har subItem egna subItems ?
                if(item.items[n].items) setParents(item.items[n]);
            }
        }
    }  
    
    
    function pickColor(item, track, mode){
        var huiIndex = item.id;
        var huiListId = (properties.sessionState.faders[track].hui.huiPort*8) + properties.sessionState.faders[track].hui.huiChn;
        
        if((properties.sessionState.faders[track].hui.huiMode === mode) && (huiIndex === huiListId)) return "#fff";
        
        for(var n=0;n<properties.sessionState.faders.length;n++){
           if(properties.sessionState.faders[n].hui.huiMode){
                var listId = (properties.sessionState.faders[n].hui.huiPort*8) + properties.sessionState.faders[n].hui.huiChn;
                if(listId === huiIndex) return "#ffcc00";
           }  
        }
        return "#999";
    }    
    
    for(n=0;n<properties.hui.inputs.list.length;n++){
       statusItems.items[1].items[n] = {
           "name"   : properties.hui.inputs.list[n].name,
           "id"     : n,
           "parent" : {},  
           
           "clickMethod"    : function(track){
       
                var huiIndex = this.id;
                var mode = 1;
                var huiChn = huiIndex % 8;
                var huiPort = Math.floor(huiIndex/8);
               
                var data = {
                    "cmd"   : 0x41,
                    "track" : track,
                    "port"  : huiPort,
                    "chn"   : huiChn,
                    "mode"  : mode
                };
                
                events.fire("huiLink", data);
                
           },
            "color"         : function(track){
                return pickColor(this, track, 1);
            }
       };
       statusItems.items[2].items[n] = {
           "name"   : properties.hui.inputs.list[n].name,
           "id"     : n,
           "parent" :{}, 
           "clickMethod"    : function(track){
       
                var huiIndex = this.id;
                var mode = 2;
                var huiChn = huiIndex % 8;
                var huiPort = Math.floor(huiIndex/8);

                var data = {
                    "cmd"   : 0x41,
                    "track" : track,
                    "port"  : huiPort,
                    "chn"   : huiChn,
                    "mode"  : mode
                };
                
                events.fire("huiLink", data);
           },
            "color"         : function(track){
                return pickColor(this, track, 2);
            }
       };
    }
    
    setParents(statusItems);
}

function setHuiData(chn, huiPort, huiChn, huiMode){
   var index = (huiPort*8)+huiChn;

    properties.sessionState.faders[chn].hui.huiMode = huiMode;
    properties.sessionState.faders[chn].hui.huiPort = huiPort;
    properties.sessionState.faders[chn].hui.huiChn = huiChn;
    setHuiStatus(chn, (huiMode>0)*1);
   
}

function getHuiListIndex(){
    
}
