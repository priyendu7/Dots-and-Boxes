const http = require('http');
const httpServer = http.createServer();
httpServer.listen(8080,()=>{
    console.log('listening to port 8080');
});
const app = require('express')();
app.get("/", (req,res) => {res.sendFile(__dirname +"/client.html")})
app.listen(8081, () => {console.log('listening to port 8081')});

const websocketServer = require('websocket').server;
const ws = new websocketServer({
    'httpServer':httpServer
});

const clients = {};
const game = {};
const line = [];



ws.on('request',request =>{
    var connection = request.accept(null,request.origin);
    connection.on('open',() => console.log('connection opened'));
    connection.on('close',() => console.log('connection closed'));
    connection.on('message',message => {
        const result = JSON.parse(message.utf8Data);
        if (result.method === 'create'){
            const clientID = result.clientID;
            const gameID = guid();
            game[gameID] = { 
                'gameID' : gameID,
                'clients' : [],
                'lines' : [],
                'boxes' :[]
            };
            const msg = {
                'game' : game[gameID],
                'method' : 'create'
            };
            clients[clientID].connection.send(JSON.stringify(msg));
        };
        if (result.method === 'join'){
            if(game[result.gameID].clients.length ===2){
                const msg={
                    'method' : 'joinError',
                    'message' : 'Game is full'
                };
                console.log('join error');
                clients[result.clientID].connection.send(JSON.stringify(msg));
                return ;
            }
            const color = {'0':'yellow','1':'green'}[game[result.gameID].clients.length];
            game[result.gameID].clients.push({
                'clientID' : result.clientID,
                'color' : color,
                'turn' : false,
                'score' : 0
            });
            if(game[result.gameID].clients.length===2){
                game[result.gameID].clients[0].turn = true;
            }
            //console.log(JSON.stringify(game[result.gameID]));
            var msg = {
                'game' : game[result.gameID],
                'method' : 'join'
            };

            game[result.gameID].clients.forEach(element => {
                clients[element.clientID].connection.send(JSON.stringify(msg));
            });
            
            
        };
        if(result.method === 'play'){
            console.log('play called in server');
            game[result.gameID].lines = result.lines;
            game[result.gameID].boxes = result.boxes;
            game[result.gameID].clients.forEach(element =>{
                if(element.clientID ===result.clientID){
                    element.turn = result.turn;
                    element.score = result.score;
                }
                else{
                    element.turn = !result.turn;
                }
            });
            var msg = {
                'game' : game[result.gameID],
                'method' : 'play'
            };
            game[result.gameID].clients.forEach(element => {
                clients[element.clientID].connection.send(JSON.stringify(msg));
            });
        }

        
    });

    const clientID = guid();
    clients[clientID]={
        'connection' : connection
    };
    const msg ={
        'clientID' :clientID,
        'method' : 'connect'
    };
    connection.send(JSON.stringify(msg));

})

function guid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }