const http = require('http');
const httpServer = http.createServer();
httpServer.listen(8080,()=>{
    console.log('listening to port 8080');
});

const websocketServer = require('websocket').server;
const ws = new websocketServer({
    'httpServer':httpServer
});

ws.on('request',request =>{
    var connection = request.accept(null,request.origin);
    connection.on('open',() => console.log('connection opened'));
    connection.on('close',() => console.log('connection closed'));
    connection.on('message',() => {

        
    });
})