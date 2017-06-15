var Engine = require("./engine-hub-model.js");

var engine = new Engine();


var STATE_IDLE = 0;
var STATE_START = 1;
var STATE_RUN = 2;
var STATE_STOP = 3;
var STATE_JUMP = 4;