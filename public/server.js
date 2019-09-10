var rpise={};
rpise.http=require("http");
rpise.fs=require("fs");
rpise.http.createServer(
    function(request,response){
        response.writeHead(200,{'Content-Type':'text/html'});
        response.end(rpise.fs.readFileSync("home.html"));

    }).listen(8081,"127.0.0.1");
