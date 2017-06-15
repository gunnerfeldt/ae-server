    var events = {
        "listeners": {},
        "fire": function (name, payload){
            if(this.listeners[name] !== undefined){
                for(n=0;n<this.listeners[name].length;n++){
                    this.listeners[name][n](payload);
                }
            }
            else{
                console.log("no event");
            }
        },
        "addListener": function(name, listener){
            if(this.listeners[name] === undefined){
                this.listeners[name]=[];
            }
            this.listeners[name].push(listener);
        //    this.listeners[name] = listener;
        }
    };
    
    // 16,77
    // 38,10