var express=require('express')
var io = require("socket.io")();
var app=express();

app.use(express.static('public'))

var hserver=app.listen(process.env.PORT || 8080,()=>{
    console.log("Server is ready");
})

io.listen(hserver);

io.on('connection',(socket) => {
console.log("User Connected");
socket.join("chatroom");
socket.on('sendMessage',(payload) => io.in("chatroom").emit('message',payload));
socket.on('disconnect',() => console.log("User Disconnected"));
});

