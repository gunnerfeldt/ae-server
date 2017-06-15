var mf08 = new MF08();
var app = new function() {
    this.go = function() {
        console.log("start app");
        setGuiTemplate();
        mtc.init();
        sslFaders.init();
        document.getElementById("guiApp").appendChild(mf08.createMfPanel(445));

    }
}

function setGuiTemplate() {
    var gui = document.createElement('div');
    var upperStrip = document.createElement('div');
    var autoFaders = document.createElement('div');
    gui.id = "guiApp";
    upperStrip.id = "upperStrip";
    autoFaders.id = "autoFaders";
    gui.appendChild(upperStrip);
    gui.appendChild(autoFaders);
    document.body.appendChild(gui);
}