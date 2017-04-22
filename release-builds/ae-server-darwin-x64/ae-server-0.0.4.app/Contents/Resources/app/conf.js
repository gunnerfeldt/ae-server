module.exports = Conf;

function Conf() {}

Conf.prototype.check = function(conf) {
    // go thru all attributes in template
    for (var attr in template) {
        // if exist, fine
        if (conf.hasOwnProperty(attr)) {}
        // else, extend the missing attribute
        else {
            conf[attr] = template[attr];
            console.log("Added property of " + attr);
        }
    }
    return conf;
}

var template = {
    numOfTracks: 96,
    mf08slot: 12,
    trSupport: false,
    sim: false,
    automation: {
        stopDropOut: 1,
        bankSwitchDropOut: 1
    },
    expandedTree: {
        box: "",
        reel: ""
    },
    remoteWindow: {
        width: 1010,
        height: 768,
        show: true,
        resizable: false,
        remoteUrl: 'http://automanefforts.com/beta/remote96.html',
        localUrl: 'file://' + __dirname + '/remote/remote96.html',
        x: 100,
        y: 100
    },
    simWindow: {
        width: 986,
        height: 486,
        show: true,
        localUrl: 'file://' + __dirname + '/sim.html',
        x: 100,
        y: 100
    }
}