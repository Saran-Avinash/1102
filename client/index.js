let snakes = {}
        let xdirection = 0;
        let ydirection = 0;

       //game rendering
        let canvas = document.querySelector('canvas');
        let c = canvas.getContext('2d');
        const blockSize = 25;
        const rows = 30;
        const cols = 20;
        

        let gameover = false; 
        


        let ws = null;
        //connection to websocket
        let clientId = null;
        let password = null;
        let gameId = null;
        
        //userName submit event
        let button = document.getElementById("submit");
        button.addEventListener("click", ()=>{
            
         ws = new WebSocket("ws://localhost:8081");
            clientId = document.getElementById("user-input").value;
            //password = document.getElementById("user-password").value;
            const clientInfo = {
                "method" : "connect",
                "clientId" : clientId,
                "password" : password
            }
            ws.onopen = ()=>{
                ws.send(JSON.stringify(clientInfo));
            };
            console.log(clientInfo);


            ws.onmessage = message => {
                let response = JSON.parse(message.data);
              
                
                if(response.method == "create"){
                    console.log(`Game created with id ${response.game.gameId}`);
                    let gameid = document.getElementById("game-id");
                    gameid.textContent = response.game.gameId;
                }

                if(response.method == "join"){
                    response.game.clients.forEach(client => {
                        if(!snakes.hasOwnProperty(client.clinetId)){
                        createSnake(client.clientId, client.color, client.x, client.y);
                        }
                        renderSnakes();
                        
                    })
                    
                }
                
                if(response.method == "update"){
                    updateSnakeCoordinates(response.game);
                    console.log(response.game);
                    renderSnakes();
                    
                    
                    
                   /* response.game.clients.forEach(client => {
                        // Access the client ID
                        const clientId = client.clientId;
                        console.log('Client ID:', clientId);
                    });*/
                }

                
            }; 
            
        }, false);

        //create game button and store result
        let creatGame = document.getElementById("create-game-btn");
        creatGame.addEventListener("click", ()=>{
    
            console.log(" game create button clicked ");
            const payLoad = {
               "method" : "create",
               "clientId" : clientId 
            }
            
            ws.send(JSON.stringify(payLoad));
        }, false);

        //join game 

        let joinGame = document.getElementById("join-game-btn");
        let joinGameId = document.getElementById("join-game-id");
           
        joinGame.addEventListener("click", () => {
            gameId = joinGameId.value;

            const payLoad = {
                "method" : "join",
                "clientId" : clientId,
                "gameId" : gameId
            }

            ws.send(JSON.stringify(payLoad));
        }, false);

        // on trigerring event from client
        document.addEventListener("keydown", (event)=>{

             
            switch(event.key){
                case "ArrowUp":
                if(ydirection != 25){  
                    ydirection = -25;
                   xdirection = 0;
                   
                 
    
                   
          
            console.log(xdirection)
            console.log(ydirection)
            
                }
                    break;

                case "ArrowDown":
                if(ydirection != -25){
                    ydirection = 25;
                    xdirection = 0; 
                     
                    
                   
                   
            console.log(xdirection)
            console.log(ydirection)

                }
                    break;

                case "ArrowLeft":
                if(xdirection != 25){
                    ydirection = 0;
                    xdirection = -25;
                     
                    
            
            console.log(xdirection)
            console.log(ydirection)
                }
                    break;

                case "ArrowRight":
                if(xdirection != -25){
                    ydirection = 0;
                    xdirection = 25;
                     
                     
                    
                }
                 break;
              
               
               } 
               const payLoad = {
                "method" : "play",
                "clientId" : clientId,
                "gameId" : gameId,
                "xdirection" :  xdirection,
                "ydirection" : ydirection,
                "x" : snakes[clientId].x,
                "y" : snakes[clientId].y
            } 
            ws.send(JSON.stringify(payLoad));
                
            
            /*function update(){
                c.fillStyle = "green";
                c.fillRect(snakes[clientId].x + xdirection, snakes[clientId].y + ydirection, blockSize, blockSize);
                snakes[clinetId].x = snakes[clientId].x + xdirection;
                snakes[clinetId].y = snakes[clientId].y + ydirection;
                
            } */
            

            

            
        }, false);
        //function to create a new snake
        function createSnake(clientId, snake_color, x_pos, y_pos) {
            snakes[clientId] = {
                name: clientId,
                x : x_pos,
                y: y_pos,
                xdirection : 0,
                ydirection : 0,
                body: [],
                color: snake_color,
              
            };
        }
      
        let foodPosition = generateRandomFoodPosition()
        function renderSnakes(){
            c.fillStyle = "black";
            c.fillRect(0, 0, rows*blockSize, cols*blockSize);
            c.fillStyle = "red";
            c.fillRect(foodPosition.x, foodPosition.y, blockSize, blockSize);
            for (let clientId in snakes) {
               // c.fillStyle = "black";
                let snake = snakes[clientId];
                c.fillStyle = "green";
                c.fillRect(snake.x , snake.y, blockSize, blockSize);
                if(snake.x == foodPosition.x && snake.y == foodPosition.y){
                    snake.body.push([foodPosition.x, foodPosition.y]);
                    foodPosition = genereateRandomFoodPosition();
                    console.log(snake.body);y
                }
                c.fillStyle='white';
                c.fillText(snake.name,snake.x, snake.y- 10)
          c.font='20px sans-serief';
          const payLoad = {
              "method" : "update",
              "clientId" : clientId,
              "gameId" : gameId,
                    "x" : snake.x,
                    "y" : snake.y
                }
                
                ws.send(JSON.stringify(payLoad));
                
                
                // Adjusted position for text
                //for (let i = 0; i < snake.body.length; i++) {
                    //  c.fillRect(snake.body[i].x , snake.body[i].y, blockSize, blockSize);
                    //} 
                }
            }
           


            function animate() {
                // Clear canvas
                c.clearRect(0, 0, canvas.width, canvas.height);
                
                // Render snakes
                renderSnakes();
                
    // Other animation logic
    
    // Request next frame
    requestAnimationFrame(animate);
}

// Start the animation loop


//update movements
function generateRandomFoodPosition() {
    const numRows = 20; // Number of rows in the game grid
    const numCols = 15; // Number of columns in the game grid

    const randomRow = Math.floor(Math.random() * numRows);
    const randomCol = Math.floor(Math.random() * numCols);

    const foodPosition = {
        x: randomCol * 25, // Each column is 25 pixels wide
        y: randomRow * 25  // Each row is 25 pixels tall
    };

    return foodPosition;
}
        function updateSnakeCoordinates(game) {
            // Iterate over the clients array in the game object
            game.clients.forEach(client => {
                const clientId = client.clientId;
                const x = client.x;
                const y = client.y;
        
                // Check if the snake with the given clientId exists in the snakes object
                 
                    // Update the x and y coordinates for the specific snake
                    snakes[clientId].x = x + client.xdirection ;
                    snakes[clientId].y = y + client.ydirection;
                    console.log(`Snake coordinates updated for snake ${clientId}. x: ${snakes[clientId].x}, y: ${snakes[clientId].y}`);
                    
                
                //update snake coordinates to server
                // Handle the case where the snake with the given clientId is not found
                
                
            });
        

        }

        