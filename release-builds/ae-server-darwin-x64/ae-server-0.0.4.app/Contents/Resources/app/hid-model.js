/*

  Module - Cv96
  
  USB - HID stuff
  some basic Automan CV96 protocol stuff

*/
var HID = require("node-hid");
var util = require("util");
var events = require("events");
// Makes HidModel also an EventEmitter
util.inherits(HidModel, events.EventEmitter)

module.exports = HidModel;

var base;
var hardwareScanTimer;
var dataParser;

function HidModel() {
    base = this;
}

HidModel.prototype.init = function init(callback) {
    dataParser = callback;
    console.log("init CV96...");
    hardwareScanLoop();
}

function hardwareScanLoop() {
    var device = scanHidDevices();
    // Found !!
    if (device != -1) {
        clearInterval(hardwareScanTimer);
        // create handle to hid device
        initHidLoop(device);
    } else setTimeout(hardwareScanLoop, 1000);
}

// search for hardware
function scanHidDevices() {
    var result = -1; // if device not found, return -1
    var product = 'Automan CV96' // product string in PIC
    var devices = HID.devices(); // search for cv96
    devices.forEach(function(dev) {
        if (dev.product == product) {
            var device = new HID.HID(dev['path']); // return device object
            result = device;
        };
    });
    return result; // return always
}

function initHidLoop(device) {
    var cv96 = device;
    // give HID module callbacks for incoming USB packet events
    cv96.on('data', function(inBuf) {
        // share function with simulator
        // args are inBuffer, func (outBuffer)
        if (inBuf.length === 64) {
            var outBuf = dataParser(inBuf, outBuf);
            cv96.write(outBuf);
        }
    });
}