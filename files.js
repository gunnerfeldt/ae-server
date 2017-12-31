var events = require('events');
var fs = require('fs');
var util = require('util');
var exports = module.exports;
var change;
var remote;
var conf = {};

var Sw96File = function() {
    var self = this;
    this.path = {
        "box": "",
        "reel": "",
        "fileLabel": ""
    }
    this.appVersion;
    this.systemID;
    this.userID;
    this.userName;
    this.systemConfig;
    this.mtcData;
    this.activeBank;
    this.faderStates;
    this.automationData;
    this.recallData = {
        "bank": 0,
        "region": 0,
        "data": []
    };
    this.huiStates;
};

var file = new Sw96File();

exports.on = function(val, callback) {
    emit = callback;
}

exports.expandFileTree = function(tree) {
    // box or reel?
    if (tree.reel) {
        // reel
        if (conf.expandedTree.reel !== tree.reel) {
            conf.expandedTree.reel = tree.reel;
        } else conf.expandedTree.reel = "";
    } else {
        //box
        if (conf.expandedTree.box !== tree.box) {
            conf.expandedTree.box = tree.box;
            conf.expandedTree.reel = "";
        } else {
            conf.expandedTree.box = "";
            conf.expandedTree.reel = "";
        }
    }
    saveConf(conf);
}

exports.packFaderData = function(faders) {
    file.faderStates = {
        "fader": []
    };
    file.huiStates = {
        "fader": []
    };
    for (var i = 0; i < faders.fader.length; i++) {
        file.faderStates.fader[i] = {
            "activeBank": 0,
            "vcaIn": faders.fader[i].in,
            "vcaOut": faders.fader[i].out,
            "status": faders.fader[i].status,
            "mute": faders.fader[i].mute
        };
        if (faders.fader[i].hui) {
            file.huiStates.fader[i] = {
                "huiPort": faders.fader[i].hui.port,
                "huiChn": faders.fader[i].hui.chn,
                "huiMode": faders.fader[i].hui.mode
            };
        } else {
            file.huiStates.fader[i] = {
                "huiPort": 0,
                "huiChn": 0,
                "huiMode": 0
            };
        }

    }

    return 1;
}

exports.getCurrentSessionData = function() {
    var sessionData = {
        "path": file.path,
        "faders": []
    };
    return sessionData;
}

exports.packAutomationData = function(automation) {
    file.automationData = {
        "autoPts": {}
    };
    for (var i = 0; i < 96; i++) {
        file.automationData.autoPts[i] = automation.getPts(i);
    }
    return 1;
}
exports.packRecallData = function(obj) {
    if (file.recallData.data[obj.chn] == null) {
        file.recallData.data[obj.chn] = [];
    }
    file.recallData.data[obj.chn][obj.id] = obj.val;
}

exports.getPath = function() {
    return file.path;
}
exports.setPath = function(path) {
    file.path = path;
}
exports.setBox = function(box) {
    file.path.box = box;
}
exports.setReel = function(reel) {
    file.path.reel = reel;
}
exports.setFileLabel = function(fileLabel) {
    file.path.fileLabel = fileLabel;
}
exports.packMtc = function(mtcData) {
    file.mtcData = mtcData;
}

exports.saveFile = function() {
    var filePath = "./aeFiles/tempFile.json";
    var checkPath = makeFilePath(file);
    if (checkPath) filePath = checkPath;

    fs.writeFile(filePath, JSON.stringify(file, null, 4), function(err) {
        if (err) {
            console.log(err);
        } else {
            console.log("JSON saved to " + filePath);
            file.dirty = 0;
        }
    });
    return 1;
}


// Please!! send conf as argument!!!
function saveConf(cnf) {
    var filePath = "./aeFiles/conf.json";
    fs.writeFile(filePath, JSON.stringify(cnf, 3), 'utf8', function(err) {
        if (err) {
            console.log(err);
        } else {
            console.log("conf saved to " + filePath);
        }
    });
    return 1;
}
exports.saveConf = function(arg) {
    saveConf(arg);
}
exports.openConf = function() {
    var filePath = "./aeFiles/conf.json";
    if (fs.existsSync(filePath)) {
        var data = fs.readFileSync(filePath, 'utf8')
        if (data) {
            conf = JSON.parse(data);
            console.log("conf file loaded");
            return 1;
        }

    }
    console.log("no conf file");
    return 0;
}

exports.getConf = function() {
    this.openConf();
    return conf;
}
exports.setConf = function(arg) {
    conf = arg;
}

exports.openFile = function(path, faders, automation, callback) {

    var fileName;
    if (!path) {
        if (!file.path.fileLabel) return false;
    } else {
        file.path = path;
    }
    fileName = makeFilePath(file);
    var fileRead;
    console.log("Open file: " + fileName);
    fs.readFile(fileName, 'utf8', function(err, data) {
        if (err) throw err;
        fileRead = JSON.parse(data);
        for (var i = 0; i < fileRead.faderStates.fader.length; i++) {
            faders.fader[i].status = fileRead.faderStates.fader[i].status;
            //    faders.fader[i].in = fileRead.faderStates.fader[i].vcaIn;
            faders.fader[i].out = fileRead.faderStates.fader[i].vcaOut;
            faders.fader[i].mute = fileRead.faderStates.fader[i].mute;
            if (fileRead.huiStates.fader[i].huiMode != 0) {
                faders.fader[i].hui = {
                    mode: fileRead.huiStates.fader[i].huiMode,
                    port: fileRead.huiStates.fader[i].huiPort,
                    chn: fileRead.huiStates.fader[i].huiChn
                }
            }
            automation.setPts(i, fileRead.automationData.autoPts[i]);
            /*
                        var keys = [];
                        for (var k in fileRead.automationData.autoPts[i]) keys.push(k);
                        //   console.log('length '+keys.length);

                        if (keys.length > 0) {
                            //    faders.setDirty(i, 1);
                            var s = faders.fader[i].status;
                            // faders.fader[i].vcaOut = fileRead.automationData.autoPts[i][0];
                        } else {
                            //    faders.setDirty(i, 0);
                        }
                        */
            /*
                var statusObject = {
                    'tag': 'status',
                    'fader': faders.fader[i],
                    'oldStatus': faders.fader[i].status,
                    'MF08bank': faders.fader[i].base.MF08bank
                };
                emit(statusObject);
                emit({
                    'tag': 'vcaOut',
                    'fader': faders.fader[i],
                });
                */
        }

        console.log("File read!");
        //     file.dirty = 0;
        callback();
    });
    return 1;
}

exports.getRecallData = function() {
    return file.recallData;
}

exports.getFile = function() {
    return file;
}

exports.readdir = function(dir) {
    var fileObj = {
        "boxes": []
    };
    var boxID = 0;
    var reelID = 0;
    var mixID = 0;

    // read all files & dirs in dir
    var files = fs.readdirSync(dir);

    for (var n = 0; n < files.length; n++) {
        var fileStats = fs.statSync(dir + "/" + files[n]);
        if (fileStats.isDirectory()) {
            // box
            var box = {};
            box.title = files[n];
            box.expanded = false;
            box.reels = [];
            if (conf.expandedTree.box == box.title) box.expanded = true;

            var filesInBox = fs.readdirSync(dir + "/" + files[n]);

            for (var i = 0; i < filesInBox.length; i++) {
                var fileInBoxStats = fs.statSync(dir + "/" + files[n] + "/" + filesInBox[i]);
                if (fileInBoxStats.isDirectory()) {
                    // reel
                    var reel = {};
                    reel.title = filesInBox[i];
                    reel.expanded = false;
                    reel.mixes = [];
                    if (conf.expandedTree.reel == reel.title) reel.expanded = true;

                    var mixesInReel = fs.readdirSync(dir + "/" + files[n] + "/" + filesInBox[i]);

                    for (var j = 0; j < mixesInReel.length; j++) {
                        var mixInReelStats = fs.statSync(dir + "/" + files[n] + "/" + filesInBox[i] + "/" + mixesInReel[j]);
                        if (mixInReelStats.isFile()) {

                            var cTime = mixInReelStats.ctime.getTime();
                            var mTime = mixInReelStats.mtime.getTime();

                            var splits = mixesInReel[j].split(".");
                            var ext = splits[splits.length - 1];
                            var fileName = mixesInReel[j].replace(("." + ext), "");
                            if (ext === "json" || ext === "JSON" || ext === "Json") {
                                // New Mix found!!
                                var mix = {
                                    "id": "0",
                                    "title": "" + fileName + "",
                                    "cTime": cTime,
                                    "mTime": mTime,
                                    "automation": "Yes",
                                    "recall": "Yes",
                                    "fileName": fileName,
                                    "filePath": dir + "/" + files[n] + "/" + filesInBox[i] + "/" + mixesInReel[j]
                                }
                                reel.mixes.push(mix);
                                mixID++;
                            }
                        }
                    }
                    box.reels.push(reel);
                    reelID++;
                }
            }
            fileObj.boxes.push(box);
            boxID++;
        }
    }
    return fileObj;
}

function getMetaData(path, filename) {
    var metaObj = {};
    var fileRead;
    var data = fs.readFileSync(path + "/" + filename);
    fileRead = JSON.parse(data);

    /*
    metaObj.id = "";
    metaObj.creation = "";
    metaObj.saved = "";
    metaObj.fps = fileRead.fps;
    metaObj.automation = fileRead.automation;
    metaObj.recall = fileRead.recall;
    metaObj.filename = filename;
    metaObj.filepath = path;
    */
}

exports.aeFilesCheck = function() {
    // Working directory
    var basePath = process.cwd();
    var aeFilesPath = basePath + "/aeFiles";

    // is there a directory?
    if (fs.existsSync(aeFilesPath)) {
        console.log("aeFiles found");
        // yes. return
        return;
    }
    // no, create and return
    fs.mkdir(aeFilesPath, function(e) {
        if (e) {
            if (e.code === 'EEXIST') {
                console.log("Can't create aeFiles");
            }
        } else {
            console.log("aeFiles created");
        }

    });
}

exports.renameFolder = function(data) {
    // Working directory
    var basePath = process.cwd();
    var aeFilesPath = basePath + "/aeFiles";
    var fromPath = aeFilesPath + "/" + data.oldPath;
    var toPath = aeFilesPath + "/" + data.newPath;

    console.log("change name of " + fromPath);
    console.log("to " + toPath);

    // is there a directory?
    if (fs.existsSync(fromPath)) {
        fs.rename(fromPath, toPath, function(err) {
            if (err) console.log('ERROR: ' + err);
        });
    }
}
exports.newFolder = function(data) {
    // Working directory
    var basePath = process.cwd();
    var aeFilesPath = basePath + "/aeFiles";
    var folderPath = aeFilesPath + "/" + data.path;

    console.log("new folder " + folderPath);

    // is there a directory?
    if (!fs.existsSync(folderPath)) {
        fs.mkdir(folderPath, function(e) {
            if (e) {
                console.log("Can't create folder");
            }
        });
    }
}

function makeFilePath(thisFile) {
    // Working directory
    var path = ""
    var basePath = process.cwd();
    var aeFilesPath = basePath + "/aeFiles";
    path = aeFilesPath + "/" + thisFile.path.box + "/" + thisFile.path.reel + "/";
    path += thisFile.path.fileLabel + ".json";
    return path;
}



exports.remote = function(link) {
    remote = link;
    remote.on("expandFileTree", function(data) {
        Files.expandFileTree(data.tree);
        var fileObj = Files.readdir('./aeFiles');
        var wsObj = {
            "cmd": 0x51,
            "fileObj": fileObj,
            "updateFileBrowser": true
        };
        remote.broadcast((wsObj));
    });

    remote.on("renameFolder", function(data) {
        Files.renameFolder(data);
    });
    remote.on("newFolder", function(data) {
        Files.newFolder(data);
    });

    remote.on("newTitle", function(data) {
        console.log("New Title: " + data.title);
        Files.setTitle(data.title);
        var wsObj = {
            "cmd": 0x81,
            "title": data.title
        }
        remote.broadcast((wsObj));
    });
    remote.on("newVersion", function(data) {
        console.log("New Version: " + data.version);
        Files.setVersion(data.version);
        var wsObj = {
            "cmd": 0x82,
            "version": data.version
        }
        remote.broadcast((wsObj));
        //    setDirty(1);
    });
}