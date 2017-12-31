/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

var Files = function(){
    var self = this;
    var lastId = null;
    var fileObj;
    var activeTree = {
        'box'           : "",
        'reel'          : "",
        'mix'           : ""
    };
    
    
    this.on = function (name, callback){
        events.addListener(name, callback);
    };

    this.setFileObj = function(data){
        fileObj = data.fileObj;
    }

    function buildFilesWindow (option){   
        var html = '';
        html += '<div id="filesWrapper">';
        html += '<div id="favouritesPanel">';
        html += '<div class="fileHeader">';
        html += '</div>';
        html += '<div class="fileData">';
        html += '</div>';
        html += '</div>';
        html += '<div id="browserPanel">';
        html += '<div class="fileHeader">';
        
        if(option==="browser"){
            html += '<div class="fileIcon folderTree" style="left: 18px; top: 24px;"></div>';
            html += '<div class="fileLabel" style="left: 50px; top: 33px;">Automan Mixes</div>';
            
            html += '<div class="fileBrowserHeaderBlock" style="left: -246px; top: 76px; width: 247px;"></div>';
            html += '<div class="fileBrowserLabel" style="left: -238px; top: 94px;">Recent</div>';
            
            html += '<div class="fileBrowserHeaderBlock" style="left: 2px; top: 76px; width: 385px;"></div>';
            html += '<div class="fileBrowserLabel" style="left: 10px; top: 94px;">Open from reel</div>';
            
            html += '<div class="fileBrowserHeaderBlock" style="left: 387px; top: 76px; width: 341px;"></div>';
            html += '<div class="fileBrowserLabel" style="left: 396px; top: 94px;">Document</div>';
        }     
        
        if(option==="saveAs"){
            
            var path = properties.box + "/" + properties.reel;
            html += '<div class="fileLabelInputBox" style="left: -246px; top: 42px; width: 532px"></div>';
            html += '<div class="fileLabelLabel" style="left: -252px; top: 26px;">Reel</div>';
            html += '<div id="filePath" class="fileLabelInput" style="left: -248px; top: 50px;">'+path+'</div>';
            
            html += '<div class="fileLabelInputBox" style="left: 288px; top: 42px; width: 440px"></div>';
            html += '<div class="fileLabelLabel" style="left: 282px; top: 26px;">Mix label</div>';
            html += '<input id="fileLabel" class="fileLabelInput" style="left: 286px; top: 46px; z-index: 100;" value="'+properties.fileAttributes[0].value+'">';
            
            html += '<div class="fileBrowserHeaderBlock" style="left: -246px; top: 76px; width: 247px;"></div>';
            html += '<div class="fileBrowserLabel" style="left: -238px; top: 94px;"></div>';
            
            html += '<div class="fileBrowserHeaderBlock" style="left: 2px; top: 76px; width: 385px;"></div>';
            html += '<div class="fileBrowserLabel" style="left: 10px; top: 94px;">Save to reel</div>';
            
            html += '<div class="fileBrowserHeaderBlock" style="left: 387px; top: 76px; width: 341px;"></div>';
            html += '<div class="fileBrowserLabel" style="left: 396px; top: 94px;">Document</div>';
        }
        
        html += '</div>';
        html += '<div class="fileData leftRightBorders">';
        


        var indentCounter = 0;
        var lineCounter = 0;
        var lineHeight = 40;
        var browserOffset = 60;
        var id = 0;
        var title = "";

        for(var n=0;n<fileObj.boxes.length;n++){
            var box = fileObj.boxes[n];
            if(option==="saveAs"){
                title = '<input id="box '+n+'" class="labelInput rename" style="left: '+((0)+75)+'px; top: '+((lineCounter*lineHeight)+browserOffset+6)+'px;" value="'+box.title+'" ondblclick="this.focus();this.select()"/>';
            }
            else{
                title = '<div class="fileLabel" style="left: '+((0)+70)+'px; top: '+((lineCounter*lineHeight)+browserOffset+9)+'px;">'+box.title+'</div>';
            }
            if(!fileObj.boxes[n].expanded){
                html += '<div id="0 '+n+' 0" class="fileIcon collapsed" style="left: '+((0)+10)+'px; top: '+((lineCounter*lineHeight)+browserOffset)+'px;"></div>';
                html += '<div class="fileIcon boxClosed" style="left: '+((0)+40)+'px; top: '+((lineCounter*lineHeight)+browserOffset)+'px;"></div>';
                html += title;
            }
            else{
                html += '<div id="0 '+n+' 0" class="fileIcon expanded" style="left: '+((0)+10)+'px; top: '+((lineCounter*lineHeight)+browserOffset)+'px;"></div>';
                html += '<div class="fileIcon boxOpened" style="left: '+((0)+40)+'px; top: '+((lineCounter*lineHeight)+browserOffset)+'px;"></div>';
                html += title;
                indentCounter++;

                for(var m=0;m<box.reels.length;m++){
                    lineCounter++;
                    var reel = box.reels[m];
                    if(option==="saveAs"){
                        title = '<input input id="box '+n+' reel '+m+'" class="labelInput rename reelLabel" style="left: '+((indentCounter*30)+74)+'px; top: '+((lineCounter*lineHeight)+browserOffset+6)+'px;" value="'+reel.title+'" ondblclick="this.focus();this.select()"/>';
                    }
                    else{
                        title = '<div id="1 '+n+' '+m+'" class="fileLabel" style="left: '+((indentCounter*30)+69)+'px; top: '+((lineCounter*lineHeight)+browserOffset+9)+'px;">'+reel.title+'</div>';
                    }
                    
                    if(!reel.expanded){
                        html += '<div id="1 '+n+' '+m+'" class="fileIcon collapsed" style="left: '+((indentCounter*30)+10)+'px; top: '+((lineCounter*lineHeight)+browserOffset)+'px;"></div>';
                        html += '<div class="fileIcon reelClosed" style="left: '+((indentCounter*30)+40)+'px; top: '+((lineCounter*lineHeight)+browserOffset)+'px;"></div>';
                        html += title;
                    }
                    else{
                        html += '<div id="1 '+n+' '+m+'" class="fileIcon expanded" style="left: '+((indentCounter*30)+10)+'px; top: '+((lineCounter*lineHeight)+browserOffset)+'px;"></div>';
                        html += '<div class="fileIcon reelOpened" style="left: '+((indentCounter*30)+40)+'px; top: '+((lineCounter*lineHeight)+browserOffset)+'px;"></div>';
                        html += title;
                        indentCounter++;
                        
                     // if(option !== "saveAs")
                        {
                            for(var o=0;o<reel.mixes.length;o++){
                                var filePath = reel.mixes[o].filePath;
                                lineCounter++;
                            //    html += '<div class="selectableMix" id="selectableMix'+id+'" style="top: '+((lineCounter*lineHeight)+browserOffset)+'px;" onclick="files.selectFile('+n+','+m+','+o+','+fileObj.boxes[n].reels[m].mixes[o].id+',\'' + filePath + '\')"';
                                html += '<div class="selectableMix" id="'+n+' '+m+' '+o+'" style="top: '+((lineCounter*lineHeight)+browserOffset)+'px;"></div>';
                                html += '<div class="fileIcon mix" style="left: '+((indentCounter*30)+40)+'px; top: '+((lineCounter*lineHeight)+browserOffset)+'px;"></div>';
                                html += '<div class="fileLabel" style="left: '+((indentCounter*30)+69)+'px; top: '+((lineCounter*lineHeight)+browserOffset+9)+'px;">'+reel.mixes[o].title+'</div>';
                                id++;
                            }
                        }
                        indentCounter--;
                    }
                 }
                if(option==="saveAs"){
                    lineCounter++;
                //    html += '<div id="1 '+n+' '+m+'" class="fileIcon add" style="left: '+((indentCounter*30)+10)+'px; top: '+((lineCounter*lineHeight)+browserOffset)+'px;"></div>';
                    html += '<div id="reel '+n+'" class="fileIcon add" style="left: '+((indentCounter*30)+40)+'px; top: '+((lineCounter*lineHeight)+browserOffset)+'px;"></div>';
                    html += '<div class="fileLabel addLabel" style="left: '+((indentCounter*30)+69)+'px; top: '+((lineCounter*lineHeight)+browserOffset+9)+'px;">New...</div>';
                }
                indentCounter--;
            }
            lineCounter++;
        }
        if(option==="saveAs"){
         //   html += '<div id="0 '+n+' 0" class="fileIcon add" style="left: '+((0)+10)+'px; top: '+((lineCounter*lineHeight)+browserOffset)+'px;"></div>';
            html += '<div id="box" class="fileIcon add" style="left: '+((0)+40)+'px; top: '+((lineCounter*lineHeight)+browserOffset)+'px;"></div>';
            html += '<div class="fileLabel addLabel" style="left: '+((0)+70)+'px; top: '+((lineCounter*lineHeight)+browserOffset+9)+'px;">New...</div>';
            lineCounter++;
        }
        

        html +=         '</div>';   //fileData
        html +=     '</div>';   //browserPanel
        html +=     '<div id="infoPanel">';
        html +=         '<div class="fileHeader">';
        html +=         '</div>';   //fileHeader
        html +=         '<div class="fileData" id="mixInfo">';
        html +=         '</div>';   //fileData
        html +=     '</div>';   //infoPanel
        html += '</div>';   //filesWrapper
        lastId = null;
        return html;
    }
/*
    function fileArrowClick(key,boxI,reelI){
        if(key == 0){
            fileObj.boxes[boxI].expanded = !fileObj.boxes[boxI].expanded;        
        }
        if(key == 1){
            fileObj.boxes[boxI].reels[reelI].expanded = !fileObj.boxes[boxI].reels[reelI].expanded;        
        }
        self.buildFiles();
    }
    */
    function fileArrowClick(key,boxI,reelI){
        if(properties.state.activeMode !== "saveAs")
        {
            if(key == 0){
                var tree = {
                    'box'       : fileObj.boxes[boxI].title,
                    'reel'      : ""
                };
                events.fire("expand", tree);
            }
            if(key == 1){ 
                var tree = {
                    'box'       : fileObj.boxes[boxI].title,
                    'reel'      : fileObj.boxes[boxI].reels[reelI].title
                };
                events.fire("expand", tree);      
            }
        }
        else{
            if(key == 0){
                fileObj.boxes[boxI].expanded = !fileObj.boxes[boxI].expanded;        
            }
            if(key == 1){
                fileObj.boxes[boxI].reels[reelI].expanded = !fileObj.boxes[boxI].reels[reelI].expanded;        
            }
            self.buildSaveAs();
        }
    //    self.buildFiles();
    }
    
    
    
    function selectFile(box,reel,mix,id,filePath){
        var lineCounter = 0;
        var lineHeight = 52;
        var labelSpace = 22;
        var offset = 44;
        var mStr;

        console.log("file: ",fileObj.boxes[box].reels[reel].mixes[mix].filePath);
        
        var mTime = new Date(fileObj.boxes[box].reels[reel].mixes[mix].mTime);

        if(mTime.toDateString() === (new Date()).toDateString()){
            //today
            mStr = mTime.toTimeString();
        }
        else{
            //not today
            mStr = mTime.toDateString();
        }

        var html = '<div class="mixInfoLabel" style="left: 4px; top: '+((lineCounter*lineHeight)+offset)+'px;">Title</div>';
        html += '<div class="mixInfoData" style="left: 8px; top: '+((lineCounter*lineHeight)+labelSpace+offset)+'px;">'+fileObj.boxes[box].reels[reel].mixes[mix].title+'</div>';
        lineCounter++;
        html += '<div class="mixInfoLabel" style="left: 4px; top: '+((lineCounter*lineHeight)+offset)+'px;">Last saved</div>';
        html += '<div class="mixInfoData" style="left: 8px; top: '+((lineCounter*lineHeight)+labelSpace+offset)+'px;">'+mStr+'</div>';
        lineCounter++;
        html += '<div class="mixInfoLabel" style="left: 4px; top: '+((lineCounter*lineHeight)+offset)+'px;">Automation data</div>';
        html += '<div class="mixInfoData" style="left: 8px; top: '+((lineCounter*lineHeight)+labelSpace+offset)+'px;">'+fileObj.boxes[box].reels[reel].mixes[mix].automation+'</div>';
        lineCounter++;
        html += '<div class="mixInfoLabel" style="left: 4px; top: '+((lineCounter*lineHeight)+offset)+'px;">Recall data</div>';
        html += '<div class="mixInfoData" style="left: 8px; top: '+((lineCounter*lineHeight)+labelSpace+offset)+'px;">'+fileObj.boxes[box].reels[reel].mixes[mix].recall+'</div>';
        lineCounter++;
        html += '<div class="fileButtons">';
 //       html += '<div class="fileButton" onclick="loadFile(\'' + filePath + '\')">load</div>';
 //       html += '<div class="fileButton" onclick="deleteFile(\'' + filePath + '\')">delete</div>';
        html += '</div>';
        document.getElementById("mixInfo").innerHTML = html;
        

    }

    function loadFile(filePath){
        events.fire("loadFile", filePath);
     //   alert("Load: "+filePath);
    }
    function deleteFile(filePath){
        alert("Delete: "+filePath);
    }

    this.buildFiles = function(){
        document.getElementById("mainGUI").innerHTML = buildFilesWindow("browser");
        // html += 'ondblclick="loadFile('+n+','+m+','+o+','+filePath+')"></div>';
        
        var classname = document.getElementsByClassName("fileIcon");

        for(var i=0;i<classname.length;i++){
            classname[i].addEventListener('click', function() {
                var id = this.getAttribute("id");
                var key = (id.split(" "))[0];
                var index1 = (id.split(" "))[1];
                var index2 = (id.split(" "))[2];
                fileArrowClick(key,index1,index2);
            }, false);
        }
        var classname = document.getElementsByClassName("selectableMix");
        
        for(var i=0;i<classname.length;i++){
        //    html += 'ondblclick="loadFile(\'' + filePath + '\')"></div>';
            classname[i].addEventListener('click', function() {
                var id = this.getAttribute("id");
                var index1 = (id.split(" "))[0];
                var index2 = (id.split(" "))[1];
                var index3 = (id.split(" "))[2];
                selectFile(index1,index2,index3);
            }, false);
            classname[i].addEventListener('dblclick', function() {
                var id = this.getAttribute("id");
                var box = (id.split(" "))[0];
                var reel = (id.split(" "))[1];
                var mix = (id.split(" "))[2];
                var path = {
                    "box"       : fileObj.boxes[box].title,
                    "reel"      : fileObj.boxes[box].reels[reel].title,
                    "fileLabel" : fileObj.boxes[box].reels[reel].mixes[mix].title
                };
                loadFile(path);
            }, false);
        }
        
    };

    this.buildSaveAs = function(){
        document.getElementById("mainGUI").innerHTML = buildFilesWindow("saveAs");
        
        var classname = document.getElementsByClassName("reelLabel");
        for(var i=0;i<classname.length;i++){
            classname[i].addEventListener('click', function() {
                var id = this.getAttribute("id");
                var boxIndex = (id.split(" "))[1];
                var reelIndex = (id.split(" "))[3];
                var path = fileObj.boxes[boxIndex].title + "/" + fileObj.boxes[boxIndex].reels[reelIndex].title;
                properties.box = fileObj.boxes[boxIndex].title;
                properties.reel = fileObj.boxes[boxIndex].reels[reelIndex].title;
                events.fire("newFilePath", path);
            }, false);
        } 
        
        var classname = document.getElementsByClassName("fileIcon");

        for(var i=0;i<classname.length;i++){
            classname[i].addEventListener('click', function() {
                var id = this.getAttribute("id");
                var key = (id.split(" "))[0];
                var index1 = (id.split(" "))[1];
                var index2 = (id.split(" "))[2];
                fileArrowClick(key,index1,index2);
            }, false);
        } 
        
        var classname = document.getElementsByClassName("add");
        for(var i=0;i<classname.length;i++){
            classname[i].addEventListener('click', function() {
                var id = this.getAttribute("id");
                var folder = (id.split(" "))[0];
                var newFolder = {};
                if(folder === "box"){
                    // new box
                    var box = {};
                    box.title = "Box o'Reels";
                    box.expanded = true;
                    box.reels = [];
                    box.rename = true;
                    fileObj.boxes.push(box);
                    newFolder.path = box.title;
                    events.fire("newFolder", newFolder);
                }
                if(folder === "reel"){
                    var boxIndex = (id.split(" "))[1];
                    var path = fileObj.boxes[boxIndex].title;
                    // new reel
                    var reel = {};
                    reel.title = "Fresh Reel";
                    reel.expanded = true;
                    reel.mixes = [];
                    reel.rename = true;
                    fileObj.boxes[boxIndex].reels.push(reel);
                    newFolder.path = fileObj.boxes[boxIndex].title + "/" + reel.title;
                    events.fire("newFolder", newFolder);
                }
                self.buildSaveAs();
            }, false);
        } 
        
        var classname = document.getElementsByClassName("rename");

        for(var i=0;i<classname.length;i++){
            classname[i].addEventListener('change', function(e) {
                var id = this.getAttribute("id");
                var value = e.srcElement.value;
                var box = (id.split(" "))[0];
                var boxIndex = (id.split(" "))[1];
                var reel = (id.split(" "))[2];
                var reelIndex = (id.split(" "))[3];
                if(box === "box"){
                    var rename = {};
                    rename.box = boxIndex;
                    rename.title = value;
                    rename.oldPath = fileObj.boxes[boxIndex].title;
                    rename.newPath = "";
                    if(reel === "reel"){
                        rename.reel = reelIndex;
                        rename.oldPath += "/" + fileObj.boxes[boxIndex].reels[reelIndex].title;
                        fileObj.boxes[boxIndex].reels[reelIndex].title = value;
                        rename.newPath += fileObj.boxes[boxIndex].title + "/" + value;
                        properties.reel = value;
                    }
                    else{
                        fileObj.boxes[boxIndex].title = value;
                        rename.newPath += value;
                        properties.box = value;
                    }
                    events.fire("renameFolder", rename);
                    document.getElementById("filePath").innerHTML = properties.box+"/"+properties.reel;
                }
            }, false);
        } 
        
        document.getElementById("fileLabel").addEventListener('click', function(e){
            // var value = e.srcElement.value;
        });
        document.getElementById("fileLabel").addEventListener('dblclick', function(e){
            var element = e.srcElement;
            element.focus();
            element.select();
        });   
        document.getElementById("fileLabel").addEventListener('keyup', function(e){
            var value = e.srcElement.value;
            document.getElementById("fileAttr 0").value = value;
            events.fire("renameFile", value);
        });
        document.getElementById("mixInfo").innerHTML = buildFileInputForm();
        
        // file attributes change
        var classname = document.getElementsByClassName("fileAttrValue");
        for(var i=0;i<classname.length;i++){
            if(i===0){
                classname[i].addEventListener('keyup', function(e) {
                    var id = this.getAttribute("id");
                    var value = e.srcElement.value;
                    var index = parseInt((id.split(" "))[1]);
                    properties.fileAttributes[index].value = value;
                    if(index === 0) {
                        document.getElementById("fileLabel").value = value;
                        events.fire("renameFile", value);
                    }
                }, false);                
            }
            classname[i].addEventListener('change', function(e) {
                var id = this.getAttribute("id");
                var value = e.srcElement.value;
                var index = parseInt((id.split(" "))[1]);
                
                properties.fileAttributes[index].value = value;
                if(index === 0) {
                    document.getElementById("fileLabel").value = value;
                    events.fire("renameFile", value);
                }
            }, false);
        }
        var classname = document.getElementsByClassName("aeSwitch");
        for(var i=0;i<classname.length;i++){
            classname[i].addEventListener('click', function(e) {
                var id = this.getAttribute("id");
                var index = (id.split(" "))[1];
                properties.fileAttributes[index].value = !properties.fileAttributes[index].value;
                var value = properties.fileAttributes[index].value;
                
                var color;
                if(value) color = "#999";
                else color = "#555";
                
                document.getElementById("aeSwitchBase "+index).style.backgroundColor = color;
                document.getElementById("aeSwitchKnob "+index).style.left = (14+(value*22))+"px";
                
            }, false);
        }
        // file save button
        document.getElementById("aeFileSaveButton").addEventListener('click', function(){
            var saveButton = document.getElementById("aeFileSaveButton");
            if(saveButton.classList.contains("aeActive")){
                console.log("File "+properties.box+"/"+properties.reel+"/"+properties.fileAttributes[0].value);
                events.fire("saveFile", 0);
//                var tree = {
//                    'box'       : properties.box,
//                    'reel'      : properties.reel
//                };
//                events.fire("expand", tree);  
            }
        });
            
    };
    
    this.checkSaveButton = function(){
        
        var saveButton = document.getElementById("aeFileSaveButton");
        if(properties.fileAttributes[0].value !=="" && properties.reel !== ""){
           if(saveButton.classList.contains("aeNotActive")) {
               saveButton.classList.remove("aeNotActive");
               saveButton.classList.add("aeActive");
           }                           
        }
        else{
            if(saveButton.classList.contains("aeActive")) {
                saveButton.classList.remove("aeActive");
                saveButton.classList.add("aeNotActive");                         
            }                           
        }
    };   
};

function buildFileInputForm(){
    var lineHeight = 44;
    var offset = 60;
    var html = '';
    // file save and cancel
    html += '<div id="aeFileSaveButton" class="aeFileButton aeNotActive" style="left: 12px; bottom: 14px;">Save</div>';
    html += '<div id="aeFileCancelButton" class="aeFileButton aeActive" style="left: 180px; bottom: 14px;">Cancel</div>';
    
    
    // loop thru file attributes
    for(var i=0;i<properties.fileAttributes.length;i++){
        
        var label = properties.fileAttributes[i].label;
        var value = properties.fileAttributes[i].value;
        // label
        html += '<div class="fileAttrLabel" style="left: '+(0)+'px; top: '+(offset+(i*lineHeight))+'px;">'+label+'</div>';
        
        if(properties.fileAttributes[i].type === "text"){
            // input box
            html += '<input id="fileAttr '+i+'" class="fileAttrValue" style="left: '+(0)+'px; top: '+(offset+20+(i*lineHeight))+'px;" value="'+value+'"/>';
        }
        
        if(properties.fileAttributes[i].type === "checkbox"){
            // switch base
            var color;
            if(value) color = "999";
            else color = "555";
            
            html += '<div id="aeSwitchBase '+i+'" class="aeSwitchBase aeSwitch" style="left: '+(12)+'px; top: '+(offset+20+(i*lineHeight))+'px; background-color: #'+color+';"></div>';
            // switch base
            html += '<div id="aeSwitchKnob '+i+'" class="aeSwitchKnob aeSwitch" style="left: '+(14+(value*22))+'px; top: '+(offset+22+(i*lineHeight))+'px;"></div>';
        }
    }
    return html;
}

