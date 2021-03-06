function Recall(){
    var self = this;
    var recallId = 0;
    var recallBuffer = [];

    for(var n=0;n<8;n++){
        recallBuffer[n]=[];
        for(m=0;m<128;m++){
            recallBuffer[n][m]=0;
        }
    }
    console.log(recallBuffer);

/*** Recall Options loaded from current Region / Table */
    this.loadOptions = function (recallIdSelect){
	    recallIdSelect.options = [];
        /*
        for(var i=0;i<recall.obj[recallRegion].length;i++){
            recallIdSelect.options[i] = new Option(recall.obj[recallRegion][i]['name'], recall.obj[recallRegion][i]['id']);
        }      
        */
        for(var i=0;i<recallIdTable.length;i++){
            var option = new Option(recallNameTable[i]+" "+recallIndexTable[i], recallIdTable[i]);
            recallIdSelect.options[i] = option;
        }      
    }
/*** change ID */
    this.changeId = function (id){
        console.log("recall id change "+id);
        recallId = id;
    }
/*** update recall value */
    this.update = function (chn,value){
        recallBuffer[chn][recallId] = value;
    //    console.log("update id "+recallId+", chn "+chn+", val "+value);
    }
/*** update fetch values */
    this.fetch = function (bank,id){
        var buf = [];
        buf[56] = bank;
        buf[57] = id;
        for(var n=0;n<8;n++){
            buf[n] = 0;
            buf[8+(n*2)] = recallBuffer[(bank*8)+n][id] & 0xff;
            buf[9+(n*2)] = (recallBuffer[(bank*8)+n][id])>>8 & 0x3;
        }
        var wsObj = {
                "cmd":'recall',
                "buffer": buf
        }
        websocket.send(JSON.stringify((wsObj)));
    }




    /*** Recall Tables */

    var recallIdTable = [
    0x00,
    0x77,
    0x37,
    0x57,
    0x17,
    0x67,
    0x27,
    0x47,
    0x07,
    0x73,
    0x33,
    0x3D,
    0x7D,
    0x0B,
    0x4B,
    0x2B,
    0x6B,
    0x43,
    0x3,
    0x75,
    0x35,
    0x55,
    0x15,
    0x19,
    0x59,
    0x39,
    0x79,
    0x0D,
    0x4d,
    0x2D,
    0x6D,
    0x1D,
    0x5D,
    0x23,
    0x63,
    0x13,
    0x53,
    0x11,
    0x31,
    0x5,
    0x61,
    0x51,
    0x21,
    0x2E,
    0x7B,
    0x71,
    0x5E,
    0x6E,
    0x1E,
    0x3E,
    0x09,
    0x7E,
    0x49,
    0x29,
    0x69,
    0x65,
    0x3A,
    0x0E,
    0x1,
    0x76,
    0x36,
    0x41,
    0x4E,
    0x56,
    0x16,
    0x66,
    0x26,
    0x6,
    0x7A,
    0x4A,
    0x5A,
    0x1A,
    0x6A,
    0x2A,
    0x46,
    0x0A,
    0x7C,
    0x72,
    0x32,
    0x25,
    0x52,
    0x12,
    0x62,
    0x22,
    0x42,
    0x2,
    0x38,
    0x14,
    0x34,
    0x78,
    0x2C,
    0x0C,
    0x4C,
    0x6C,
    0x3C,
    0x1C,
    0x5C,
    0x50,
    0x10,
    0x70,
    0x30,
    0x68,
    0x60,
    0x40,
    0x48,
    0x58,
    0x28,
    0x8,
    0x24,
    0x20,
    0x18,
    0x44,
    0x4,
    0x64,
    0x54,
    0x74,
    0x3B,
    0x45,
    0x1B,
    0x5B
    ];

    var recallNameTable = [
    "internalResistor",
    "trackBus",
    "trackBus",
    "trackBus",
    "trackBus",
    "trackBus",
    "trackBus",
    "trackBus",
    "trackBus",
    "trackBus",
    "trackBus",
    "trackBus",
    "trackBus",
    "trackBus",
    "trackBus",
    "trackBus",
    "trackBus",
    "trackBus",
    "trackBus",
    "trackBus",
    "trackBus",
    "trackBus",
    "trackBus",
    "trackBus",
    "trackBus",
    "trackBus",
    "trackBus",
    "trackBus",
    "trackBus",
    "trackBus",
    "trackBus",
    "trackBus",
    "trackBus",
    "quad",
    "quad",
    "quad",
    "quad",
    "busPan",
    "busPan",
    "inputFlip",
    "lineTrim",
    "subGroup",
    "phaseSwitch",
    "micTrim",
    "spare",
    "phantom",
    "link",
    "compressor",
    "compressor",
    "compressor",
    "compressor",
    "expander",
    "expander",
    "expander",
    "expander",
    "expander",
    "dynamics",
    "dynamics",
    "dynamics",
    "hfFilter",
    "lfFilter",
    "split",
    "hmf",
    "hf",
    "hf",
    "hmf",
    "hmf",
    "hmf",
    "insert",
    "insert",
    "lmf",
    "lmf",
    "lmf",
    "lf",
    "lf",
    "lmf",
    "eq",
    "filter",
    "eq",
    "eq",
    "stereoCue",
    "stereoCue",
    "stereoCue",
    "stereoCue",
    "stereoCue",
    "cue1",
    "cue1",
    "cue1",
    "cue1",
    "cue2",
    "cue2",
    "cue2",
    "cue2",
    "cue3",
    "cue3",
    "cue3",
    "cue3",
    "cue4",
    "cue4",
    "cue4",
    "cue4",
    "group",
    "group",
    "group",
    "readyGroup",
    "readyTape",
    "channelInput",
    "channelOutput",
    "smallFaderSolo",
    "smallFaderCut",
    "smallFader",
    "frontBack",
    "frontBack",
    "leftRight",
    "vcaFaderSoloIsolate",
    "vcaCut",
    "vcaThumbwheel",
    "channelID",
    "dualLine",
    "spare"
    ];


    var recallIndexTable = [
    "",
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "10",
    "11",
    "12",
    "13",
    "14",
    "15",
    "16",
    "17",
    "18",
    "19",
    "20",
    "21",
    "22",
    "23",
    "24",
    "25",
    "26",
    "27",
    "28",
    "29",
    "30",
    "31",
    "32",
    "lf",
    "rf",
    "lb",
    "rb",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "ratio",
    "threshold",
    "release",
    "attack",
    "threshold",
    "range",
    "expandGate",
    "release",
    "attack",
    "toInput",
    "toOutput",
    "toMonitor",
    "",
    "",
    "",
    "x3",
    "gain",
    "frequency",
    "gain",
    "frequency",
    "q",
    "pre",
    "in",
    "gain",
    "frequency",
    "q",
    "gain",
    "frequency",
    "x3",
    "toChannel",
    "toDynamics",
    "toMonitor",
    "type",
    "pan",
    "pre",
    "smallFader",
    "level",
    "on",
    "pre",
    "smallFader",
    "level",
    "on",
    "pre",
    "smallFader",
    "level",
    "on",
    "pre",
    "smallFader",
    "level",
    "on",
    "pre",
    "smallFader",
    "level",
    "on",
    "trim",
    "float",
    "direct",
    "",
    "",
    "",
    "",
    "",
    "",
    "level",
    "pan",
    "pan",
    "pan",
    "",
    "",
    "",
    "channelID",
    "",
    ""
    ];
}
