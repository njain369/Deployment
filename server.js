var express=require('express')
var io = require("socket.io")();
var app=express();

var bodyParser =require('body-parser');
app.use(bodyParser.urlencoded({extended:false}));
var cookieParser =require('cookie-parser');
app.use(cookieParser());
var session =require('express-session');
app.use(session({
    secret:"secret",
    resave:true,
    saveUninitialized:true
}));
var mongo =require("mongodb").MongoClient;
var url="mongodb://<heroku_qbrrdr1w>:<deep-dive@369>@ds229068.mlab.com:29068/heroku_qbrrdr1w" //"mongodb://localhost:27017";
(()=>{
    let conn;
    mongo.connect(url)
    .then((client)=>{
        conn=client;
        return client.db("test");
    })
    .then((db)=>db.collection("Login"))
    .then((collection) => collection.find())
    .then(cursor => cursor.toArray())
    .then(data => app.locals.users = data)
    .then(()=>conn.close());
})();

app.use(express.static('public'))
app.get("/",function(req,res){
    res.redirect("./index.html");
})
app.get("/Login",function(req,res){
if(req.session.isAuthenticated){
    res.redirect("/ind.html");
}else{
    if(req.session.try===undefined){
        req.session.try=0;
    }
    if(req.session.try===3) res.redirect("/Failure");
    else res.redirect("/login.html");
}
});


app.post("/authenticator",function(req,res){
   
    if(req.session.try === undefined){
    req.session.try=0;
    res.redirect("/login.html");
}
else if(req.session.try<3){
    var Name=req.body.name;
    var  Pass=req.body.pass;
    console.log("Name is :"+Name);
    console.log("Pass is :"+Pass);

    var userRecord=app.locals.users.filter(doc => Name === doc.username);
    if(userRecord[0]!==undefined){
        if(Pass === userRecord[0].password){
            req.session.isAuthenticated=true;
           // req.session.uname=Name;
            res.redirect("/ind.html");
        }else{
            req.session.try++;
            res.redirect("/login.html");
        }
    }else{
        req.session.try++;
        res.redirect("/login.html");
    }

}else{
    res.redirect("/Failure");
}
});
app.get("/Logout",function(req,res){
    req.session.destroy();
    res.redirect("/index.html")
})
app.get('/Failure',function(req,res){
    setTimeout(()=>req.session.destroy(),3000);
    res.redirect("/Failure.html");
});

app.get("/jsonajax",function(req,res){
    res.setHeader('Content-Header','application/json');
    var diabetes ={
        0:"thirst",
        1:"Hunger",
        2:"hunger",
        3:"Thirst",
        4:"weight",
        5:"Weight",
        6:"Irritable",
        7:"Skin Infection",
        8:"Infection",
        9:"infection",
        10:"Blurred Vision",
        11:"blurred vision"
    }
    var malaria={
      0:"HeadAche",
      1:"vomiting",
      3:"Diarrhea",
      4:"diarrhea",
      5:"Vomiting",
      6:"abdominal pain",
      7:"Abdominal pain",
      8:"anemia",
      9:"muscle pain",
      10:"fever"
    };
    var d3n={
      0:"Increase in temperature",
      1:"vomiting"
    };
    res.send(JSON.stringify({a:diabetes,b:malaria,c:d3n}));
  });
  
var hserver=app.listen(process.env.PORT || 8080,()=>{
    console.log("Server is ready");
});


io.listen(hserver);

io.on('connection',(socket) => {
console.log("User Connected");
socket.join("chatroom");
socket.on('sendMessage',(payload) => io.in("chatroom").emit('message',payload));
socket.on('disconnect',() => console.log("User Disconnected"));
})
