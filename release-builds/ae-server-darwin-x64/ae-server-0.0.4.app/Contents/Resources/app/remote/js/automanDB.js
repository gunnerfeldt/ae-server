
var AutomanDB = function() {    
    var user;
//    var databaseUrl = "http://ingrid.dyndns-server.com/automanDB.php";
    var databaseUrl = "http://automanefforts.com/automanDB.php";

    this.login = function(username, password, callback){
        var login = {
            "name"          : username,
            "password"      : password
        }
        var post = {
            "request"   : "login",
            "data"      : login
        }
        ajax(databaseUrl, {
            data: JSON.stringify(post),
            method: "POST",
            success: function(r){ 
                user = JSON.parse(r.responseText);
                callback(user); 
            }
        });
    }

    /* opts = {
        data: "x=1&y=yes",
        method: "GET",              // default POST
        success: function(req){...}, // status 2xx
        fail: function(req){...},    // status 5xx
        other: function(req){...},   // other status
    }
    */
    function ajax(url, opts){
        var req;
        if (window.XMLHttpRequest) req=new XMLHttpRequest();
        else req=new ActiveXObject("Microsoft.XMLHTTP");
        req.onreadystatechange = function(){
        if (req.readyState == 4){
            if (/^2/.test(req.status) && opts.success) opts.success(req);
            else if (/^5/.test(req.status) && opts.fail) opts.fail(req);
            else if (opts.other) opts.other(req);
        }
        };
        req.open(opts.method || 'POST', url, true);
        req.send(opts.data);
    }
}


