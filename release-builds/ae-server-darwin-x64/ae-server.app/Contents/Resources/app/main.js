const electron = require('electron');
const { app, BrowserWindow } = electron;
const Menu = electron.Menu;
var rl = require("readline");
var appWin;
var remote96Win;
var simWin = {};
var fs = require('fs');

var Engine = require("./engine-hub-model.js");
var engine;
var conf;

var outBuf = [];

for (var q = 0; q < 4; q++) {
    outBuf[q] = [];
    for (var i = 0; i < 64; i++) {
        outBuf[q][i] = 0;
    }
    outBuf[q][1] = q;
}


require('crashreporter').configure({
    exitOnCrash: true, // if you want that crash reporter exit(1) for you, default to true, 
    maxCrashFile: 5, // older files will be removed up, default 5 files are kept,
    outDir: process.env.HOME + "/aeFiles"
});

process.on('exit', function() {
    engine.saveConf(conf);
});


app.on('ready', function() {
    var menu = Menu.buildFromTemplate(menuTemplate);
    Menu.setApplicationMenu(menu);

    // main CV96 engine - handles all in / out 
    engine = new Engine();
    conf = engine.getConf();
    simWin = makeSimWindow();
    remote96Win = makeRemoteWindow();

    // Exposed function to the app
    exports.call = function(obj) {
        if (obj.cmd) {
            // Called from the simMtc module
            if (obj.cmd == "buffer") {
                // send CV96 64bytes array to the engine
                engine.go(obj.inBuf, outBuf);
                // send 64bytes array back to the simulator
                callSim({
                    cmd: "buffer",
                    outBuf: outBuf[obj.inBuf[1] & 3] // just send back buffer for testing
                })
            }
        }
    }
})

function callSim(obj) {
    simWin.webContents.send('call', obj);
}



var menuTemplate = [{
    label: 'Main App',
    submenu: [{
        label: 'About ...',
        role: 'about',
        click: () => {
            console.log('About Clicked');
        }
    }, {
        type: 'separator'
    }, {
        label: 'Quit',
        role: 'quit',
        click: () => {
            app.quit();
        }
    }]
}, {
    label: 'Options',
    submenu: [{
        label: 'HUI',
        click: () => {}
    }]
}, {
    label: 'View',
    submenu: [{
        label: 'Simulator',
        click: () => {
            toggleWindow(simWin);
        }
    }, {
        label: 'Remote 96',
        click: () => {
            toggleWindow(remote96Win);

        }
    }]
}];


function toggleWindow(win) {
    if (win.isDestroyed()) {
        if (win.name == "remoteWindow") {
            remote96Win = makeRemoteWindow();
            remote96Win.show();
            conf.remoteWindow.show = true;
        }
        if (win.name == "simWindow") {
            simWin = makeSimWindow();
            simWin.show();
            conf.simWindow.show = true;
        }
        return;
    }

    if (win.isVisible()) {
        win.hide();
    } else {
        win.show();
        //    win.webContents.openDevTools();
    }
    conf[win.name].show = win.isVisible();

}



function makeRemoteWindow() {
    var win = new BrowserWindow({
        width: conf.remoteWindow.width,
        height: conf.remoteWindow.height,
        show: conf.remoteWindow.show,
        resizable: conf.remoteWindow.resizable,
        acceptFirstMouse: true,
        x: conf.remoteWindow.x,
        y: conf.remoteWindow.y
    });
    win.loadURL(conf.remoteWindow.remoteUrl);
    win.name = "remoteWindow";

    win.on("move", function(e) {
        var pos = win.getPosition();
        conf.remoteWindow.x = pos[0];
        conf.remoteWindow.y = pos[1];
    });
    return win;
}

function makeSimWindow() {
    console.log("WHAT:");
    console.log(conf);
    conf.simWindow.width.show = 0;
    var win = new BrowserWindow({
        width: conf.simWindow.width,
        height: conf.simWindow.height,
        show: conf.simWindow.show,
        acceptFirstMouse: true,
        x: conf.simWindow.x,
        y: conf.simWindow.y
    });
    //    win.webContents.openDevTools();
    win.loadURL(conf.simWindow.localUrl);
    win.name = "simWindow";
    win.on("move", function(e) {
        var pos = win.getPosition();
        conf.simWindow.x = pos[0];
        conf.simWindow.y = pos[1];
    });
    return win;
}