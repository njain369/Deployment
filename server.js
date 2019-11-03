var express = require('express')
var io = require("socket.io")();
var assert = require('assert');
var app = express();
const Nexmo = require('nexmo');

var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));
var cookieParser = require('cookie-parser');
app.use(cookieParser());
var session = require('express-session');
app.use(session({
    secret: "secret",
    resave: true,
    saveUninitialized: true
}));
var mongo = require("mongodb").MongoClient;
var url = process.env.MONGODB_URI || "mongodb://localhost:27017";


function init() {

    let conn;
    mongo.connect(url)
        .then((client) => {
            conn = client;
            return client.db("heroku_qbrrdr1w");
        })
        .then((db) => db.createCollection("Login"))
        .then(() => conn.close())
        .then(() => test());

    mongo.connect(url)
        .then((client) => {
            conn = client;
            return client.db("heroku_qbrrdr1w");
        })
        .then((db) => db.createCollection("Doctors"))
         
        .then(() => conn.close())
        .then(() => test1());

        mongo.connect(url)
        .then((client) => {
            conn = client;
            return client.db("heroku_qbrrdr1w");
        })
        .then((db) => db.createCollection("Schedule"))
        .then(() => conn.close())
        .then(() => test2());

        
}
function test() {
    let conn;
    mongo.connect(url)
        .then((client) => {
            conn = client;
            return client.db("heroku_qbrrdr1w");
        })
        .then((db) => db.collection("Login"))
        .then((collection) => collection.find())
        .then(cursor => cursor.toArray())
        .then(data => app.locals.users = data)
        .then(() => conn.close());
}
function test1() {
    let conn;
    mongo.connect(url)
        .then((client) => {
            conn = client;
            return client.db("heroku_qbrrdr1w");
        })
        .then((db) => db.collection("Doctors"))
        .then((collection) => collection.find())
        .then(cursor => cursor.toArray())
        .then(data => app.locals.userdoc = data)
        .then(() => conn.close());
}
//db access for getting schedule of the doctor;

function test2(){
    let conn;
    mongo.connect(url)
    .then((client)=>{
        conn=client;
        return client.db("heroku_qbrrdr1w");
    })
    .then((db)=>db.collection("Schedule"))
    .then((collection)=>collection.find())
    .then(cursor => cursor.toArray())
    .then(data => app.locals.docdata = data)
    .then(()=>conn.close());
    console.log("Done");
} 


init();
app.post("/registeration", function (req, res) {
    var item = {
        username: req.body.name,
        phone_number: req.body.phno,
        Dob: req.body.dob,
        password: req.body.pass
    };
    let conn;
    mongo.connect(url)
        .then((client) => {
            conn = client;
            return client.db("heroku_qbrrdr1w");
        })
        .then((db) => db.collection("Login"))
        .then((collection) => { collection.insertOne(item) })
        .then(() => conn.close())
        .then(() => test());

    function test() {
        let conn;
        mongo.connect(url)
            .then((client) => {
                conn = client;
                return client.db("heroku_qbrrdr1w");
            })
            .then((db) => db.collection("Login"))
            .then((collection) => collection.find())
            .then(cursor => cursor.toArray())
            .then(data => app.locals.users = data)
            .then(() => conn.close());
    }
    res.redirect("/Login");
});
app.get("/skincare", function (req, res) {
    res.send("<h1>Reached here</h1>");
});
app.use(express.static('public'))
app.get("/", function (req, res) {
    res.redirect("./index.html");
})
app.get("/Login", function (req, res) {
    if (req.session.isAuthenticated) {
        res.redirect("/ind.html");
    } else {
        if (req.session.try === undefined) {
            req.session.try = 0;
        }
        if (req.session.try === 3) res.redirect("/Failure");
        else res.redirect("/login.html");
    }
});

var uname="";
app.post("/authenticator", function (req, res) {

    if (req.session.try === undefined) {

        res.redirect("/login.html");
    }
    else if (req.session.try < 3) {
        var Name = req.body.name;
        var Pass = req.body.pass;
        console.log("Name is :" + Name);
        console.log("Pass is :" + Pass);

       var userRecord = app.locals.users.filter(doc => Name === doc.username);
        if (userRecord[0] !== undefined) {
            if (Pass === userRecord[0].password) {
                uname=userRecord[0].username;
                req.session.isAuthenticated = true;
                // req.session.uname=Name;
                res.redirect("/ind.html");
            } else {
                req.session.try++;
                res.redirect("/login.html");
            }
        } else {
            req.session.try++;
            res.redirect("/login.html");
        }

    } else {
        res.redirect("/Failure");
    }
});
app.get("/Logout", function (req, res) {
    req.session.destroy();
    res.redirect("/index.html")
})
app.get('/Failure', function (req, res) {
    setTimeout(() => req.session.destroy(), 3000);
    res.redirect("/Failure.html");
});

app.get("/jsonajax", function (req, res) {
    res.setHeader('Content-Header', 'application/json');
    var diabetes = {
        0: "thirst",
        1: "Hunger",
        2: "hunger",
        3: "Thirst",
        4: "weight",
        5: "Weight",
        6: "Irritable",
        7: "Skin Infection",
        8: "Infection",
        9: "infection",
        10: "Blurred Vision",
        11: "blurred vision"
    }
    var malaria = {
        0: "HeadAche",
        1: "vomiting",
        3: "Diarrhea",
        4: "diarrhea",
        5: "Vomiting",
        6: "abdominal pain",
        7: "Abdominal pain",
        8: "anemia",
        9: "muscle pain",
        10: "fever"
    };
    var d3n = {
        0: "Increase in temperature",
        1: "vomiting"
    };
    res.send(JSON.stringify({ a: diabetes, b: malaria, c: d3n }));
});

var see="";
var no1="";
app.post("/sendsms",function(req,res){
    const nexmo = new Nexmo({
      apiKey: 'e06ccb19',
      apiSecret: 'i5BjToAg2JmrEXhW',
    });
     no1=req.body.phno;
    nexmo.verify.request({
        number: no1,
        brand: 'MEDIT',
        code_length:'4'
        
      }, (err, result) => {
        console.log(err ? err : result)
         see=result;
    });
      res.redirect("/appointment1.html");
});
var see2="";//for authhentication
app.post("/verifysms",function(req,res){
    var rid=see.request_id;
    const nexmo = new Nexmo({
        apiKey: 'e06ccb19',
        apiSecret: 'i5BjToAg2JmrEXhW',
      });
    var cde =req.body.code;
    nexmo.verify.check({
        request_id: rid,
        code: cde
      }, (err, result) => {
        console.log(err ? err : result)
        see=err;
        see2=result;  
    });
    if(see.status=='0' || see2.status=='0' ){
res.redirect("/appointment2.html"+"?phno="+no1);
    }else{
res.redirect("/appointment1.html");
    }
});

var Place="";
app.post("/doctorslist",function(req,res){
Place= req.body.place;

   
  res.redirect("/doctors.html");
});
app.get("/doctor",function(req,res){
    console.log("Inside doctor")
  var docname=app.locals.userdoc.filter(doc=> Place===doc.place);
  console.log(docname["0"].place);
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify({m:docname}));
});

//Schedule Logic Over here
var s="";
app.get("/Schedule",function(req,res){
 s=req.query.cid;
console.log(s);
res.redirect("/tableview2.html");
});
var docn="";
app.get("/ViewingData",function(req,res){
    var result=s.slice(1);
    console.log(result)
    var docrecords= app.locals.docdata.filter(doc => result===doc.docid);
  docn=docrecords[0].docname;
    console.log(docrecords[0].schedule.Monday.MorningFrom);
    var today = new Date();
    if(today.getDay() == 0){
        if(today.getHours()>=9 && today.getHours()<=13){
             var tim= today.getHours();
             docrecords[0].schedule.Thursday.MorningFrom=tim; 
              
            res.send(JSON.stringify({m:docrecords}));
        }else if(today.getHours()>=14 && today.getHours()<=17){
            var tim =today.getHours();
            console.log(docrecords[0]);
            docrecords[0].schedule.Thursday.AfternoonFrom=tim;
            res.send(JSON.stringify({m:docrecords}));
        }else{
            var tim =today.getHours();
            docrecords[0].schedule.Thursday.EveningFrom=tim;
            res.send(JSON.stringify({m:docrecords}));
        }
    }
    

})
var val="";
var valu="";
//Final Booking ofSlots
app.get("/Confirm",function(req,res){
     val=req.query.c;
     valu=req.query.d;
    console.log(val,valu);

    res.redirect("/final.html");
})

app.get("/finaldata",function(req,res){
    var today = new Date();
    var now = today.getDate()+1;

    res.send(JSON.stringify({x:now,y:val,z:valu}));
})
var hserver = app.listen(process.env.PORT || 8080, () => {
    console.log("Server is ready");
});

app.get("/BookedSlot",function(req,res){
    console.log(uname);
    console.log(docn);
    var today=new Date();

    var item={
        Patientname:uname,
        Doctorname:docn,
        DoctorId:s.slice(1),
        Date:today.getDate(),
        Day:today.getDay()
    }
    let conn;
    mongo.connect(url)
        .then((client) => {
            conn = client;
            return client.db("heroku_qbrrdr1w");
        })
        .then((db) => db.collection("Appointment"))
        .then((collection) => { collection.insertOne(item) })
        .then(() => conn.close());
        
      
    res.redirect("/final.html")
  
})


io.listen(hserver);

io.on('connection', (socket) => {
    console.log("User Connected");
    socket.join("chatroom");
    socket.on('sendMessage', (payload) => io.in("chatroom").emit('message', payload));
    socket.on('disconnect', () => console.log("User Disconnected"));
})