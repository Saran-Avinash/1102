const http = require("http");
const express = require("express");
const app = express();
const fs = require("fs");
const WebSocketServer = require("websocket").server;
const MAX_USERS = 4;
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
let foodX = 0;
let foodY = 0;
let clientIds = []
let formattedClientData = {};


// when client sends a request
wsServer.on("request", request => {
    if(Object.keys(clients).length >= MAX_USERS){
        request.reject(403, "Server Full");
        console.log("Rejected connection - max players reached");
        return;
    }
    const connection = request.accept(null, request.origin);
    connection.on("open", ()=>console.log("connection opened"));
    connection.on('error', function error(err) {
        console.error('WebSocket encountered an error:', err.message);
    });
      
    //when receving message from client 
    connection.on("message", (message) => {

        const result = JSON.parse(message.utf8Data);

        //user makes a connection
        if(result.method == "connect"){
             
            if(clients.hasOwnProperty(result.clientId)){
                connection.close();
            }
            clients[result.clientId] = {
                "userId" : result.clientId,
                "connection" : connection
            }
            // for (const clientId in clients) {
            //     formattedClientData[clientId] = {
            //         "clientId": clients[clientId].userId,
                     
            //     };
            // }
            // writeUserDataToFile();

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

        if(result.method == "play"){
            /*expecting data to send to all the clients for that i have to know which 
            client is play by their "play request", if that client is playing then 
            he should trigger keyboard events, on trigeering i should initiate play 
            request,
            ->to broadcast the data to all clients i think i should have a structure like
            ->check for their x and y direction 
            const payLoad = {
                "clientId" : clientId,
                ""
            }
            */
            const  gameId = result.gameId;
            const game = games[gameId]; 
            // let users = {}
            // users[result.userId] = {
        
            //     "xdirection" : result.xdirection,
            //     "ydirection" : result.ydirection
            // }
            const clientToUpdate = game.clients.find(client => client.clientId == result.clientId);

            if(clientToUpdate){
                clientToUpdate.x = result.x;
                clientToUpdate.y = result.y;
                clientToUpdate.xdirection = result.xdirection;
                clientToUpdate.ydirection = result.ydirection;
            }
            console.log(game);

            const payLoad = {
                "method" : "update",
                "game" : game
            }
       
            // setInterval(() => {

                game.clients.forEach(client => {
                    clients[client.clientId].connection.send(JSON.stringify(payLoad));
                });
            // }, 500);
         
          
            
            /*
            structure of 
            const result = {
                "method" : "play",
                "clientId" : clientId,
                "xdirction" : 1,
                "ydirection" : 0
                "gameId" : particularGameId,
            }
            */
           
        }

        if(result.medthod == "update"){
            const clientId = result.clientId;
           const game = games[clientId];
           const clientToUpdate = game.clients.find(client => client.clientId == result.clientId);

            if(clientToUpdate){
                console.log(result.x);
                console.log(result.y);
                clientToUpdate.x = result.x;
                clientToUpdate.y = result.y;
            }
        }





    })


    connection.on("close", ()=>console.log("Closed"));
    
})
function generateRandomFoodPosition() {
    const numRows = 20; // Number of rows in the game grid
    const numCols = 15; // Number of columns in the game grid

    const randomRow = Math.floor(Math.random() * numRows);
    const randomCol = Math.floor(Math.random() * numCols);

    
    foodX =  randomCol * 25, // Each column is 25 pixels wide
        foodY = randomRow * 25  // Each row is 25 pixels tall


    
}

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
    const numCols = 15;

    // Generate a random column index
    const randomCol = Math.floor(Math.random() * numCols);

    // Calculate the pixel coordinate based on the column index
    const pixelX = randomCol * 25; // Each column is 25 pixels wide

    return pixelX;
}

function randomYPosition() {
    // Calculate the number of rows
    const numRows = 20;

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

function writeUserDataToFile() {
    try {
        fs.writeFileSync('users.json', JSON.stringify(formattedClientData, null, 2), 'utf8');
        console.log('Game data written to file successfully');
    } catch (err) {
        console.error('Error writing game data to file:', err);
    }
}

function isUserIdExists(userId, callback) {
    fs.readFile('users.json', 'utf8', (err, data) => {
      if (err) {
        // Handle file read error
        return callback(err);
      }
  
      try {
        const userIds = JSON.parse(data);
        if (userIds.hasOwnProperty(userId)) {
          // User ID exists
          return callback(null, true);
        } else {
          // User ID does not exist
          return callback(null, false);
        }
      } catch (parseError) {
        // Handle JSON parse error
        return callback(parseError);
      }
    });
  }

server.listen(8081, ()=> console.log("websocket server is listening on port 8081"));