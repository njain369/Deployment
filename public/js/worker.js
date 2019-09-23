function Loop(){
    for(var i=0;i<=5;i++){
        console.log("Message reached");
    }
    postMessage("Hello");
}
onmessage=Loop;