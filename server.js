const http = require("http");
const express = require("express");
const app = express();
const fs = require("fs");
const WebSocketServer = require("websocket").server;

// front end server on port 8080
app.get("/", (request, response) => {
    response.sendFile(__dirname + "/index.html");
})
app.listen(8080, ()=>console.log("server is listening on port 8080"));



// normal tcp 
const server = http.createServer((request, response) => {
    console.log("Connected ");
})

//handshake
const wsServer = new WebSocketServer({
    "httpServer" : server
})

//client hashmap

let clients = {}
let registered_users = []
let games = {}

// when client sends a request
wsServer.on("request", request => {
    const connection = request.accept(null, request.origin);
    connection.on("open", ()=>console.log("connection opened"));
    
    //when receving message from client 
    connection.on("message", (message) => {

        const result = JSON.parse(message.utf8Data);

        //user makes a connection
        if(result.method == "connect"){
            registered_users.push(result.clientId);
            clients[result.clientId] = {
                "userId" : result.clientId,
                "connection" : connection
            }
            console.log(`Id from client is ${result.clientId}`);
        }

        //user creates a game
        if(result.method == "create"){
            const clientId = result.clientId;
            const gameId = guid();
            games[gameId] = {
                "gameId" : gameId,
                "clients" : [],
                 
            }
     
            const payLoad = {
                "method" : "create",
                "game" : games[gameId]
            }
            console.log("Game create request received");
            
            const con = clients[clientId].connection;
            con.send(JSON.stringify(payLoad));
            
            writeGameDataToFile();
        }

        //user joins a game

        if(result.method == "join"){
            const clientId = result.clientId;
            const gameId = result.gameId;
            const game = games[gameId];
            const color = randomRGBA();

            game.clients.push({
                "clientId" : clientId,
                "color" : color,
                "x" : randomXPosition(),
                "y" : randomYPosition()
            })

            const payLoad = {
                "method" : "join",
                "game" : game
            }

            // loop through all clients and tell them that people joined
            game.clients.forEach(client => {
                clients[client.clientId].connection.send(JSON.stringify(payLoad));
            });
            writeGameDataToFile();

            
        }





        // connection.send(JSON.stringify(clients[registered_users[0].userId]));
    })


    connection.on("close", ()=>console.log("Closed"));
    
})

const guid=()=> {
    const s4=()=> Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);     
    return `${s4() + s4()}-${s4()}-${s4()}-${s4()}-${s4() + s4() + s4()}`;
  }

  function randomRGBA() {
    var r = Math.floor(Math.random() * 256);
    var g = Math.floor(Math.random() * 256);
    var b = Math.floor(Math.random() * 256);
    var a = Math.random().toFixed(2); // You can adjust the alpha precision as needed
    return `rgba(${r}, ${g}, ${b}, ${a})`;
}

function randomXPosition() {
    // Calculate the number of columns
    const numCols = 25;

    // Generate a random column index
    const randomCol = Math.floor(Math.random() * numCols);

    // Calculate the pixel coordinate based on the column index
    const pixelX = randomCol * 25; // Each column is 25 pixels wide

    return pixelX;
}

function randomYPosition() {
    // Calculate the number of rows
    const numRows = 30;

    // Generate a random row index
    const randomRow = Math.floor(Math.random() * numRows);

    // Calculate the pixel coordinate based on the row index
    const pixelY = randomRow * 25; // Each row is 25 pixels tall

    return pixelY;
}

// Example usage:
const randomX = randomXPosition();
const randomY = randomYPosition();
console.log("Random X position:", randomX);
console.log("Random Y position:", randomY);
  

function writeGameDataToFile() {
    try {
        fs.writeFileSync('games.json', JSON.stringify(games, null, 2), 'utf8');
        console.log('Game data written to file successfully');
    } catch (err) {
        console.error('Error writing game data to file:', err);
    }
}

server.listen(8081, ()=> console.log("websocket server is listening on port 8081"));