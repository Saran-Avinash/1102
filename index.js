// logic of the song
const song_list = ["1.mp3", "2.mp3", "3.mp3", "4.mp3", "21.mp3", "26.mp3", "Kurchi-Madathapetti-Tamil.mp3", "Aathichudi.mp3"];
let pointer = -1;
let song_list_length = song_list.length;
const audio = document.querySelector('audio');
let currentTime = 0;
audio.play();
window.addEventListener("keydown", (event) => {
    
    
    if(event.key == 'p' || event.key == 'P'){
        if(pointer == -1 || pointer >= song_list_length){
            pointer = 0;
        }
        // audio.setAttribute("src", `/resources/${song_list[pointer]}`);
        if(audio.paused){
            audio.currentTime = currentTime;
            audio.play();
        }
        else{
            currentTime = audio.currentTime;
            audio.pause();
        }
        
    }
    if(event.key == 'n' || event.key == 'N'){
        
        pointer++;
        if(pointer >= song_list_length){
            pointer = 0;
        }
        
        audio.setAttribute("src", `/resources/${song_list[pointer]}`);
        console.log(audio.src);
        audio.play();
    }
    if(event.key == 'b' || event.key == 'B'){
        pointer--;
        if(pointer < 0){
            pointer = song_list_length-1;
        }
        audio.setAttribute("src", `/resources/${song_list[pointer]}`);
        console.log(audio.src);
        
        audio.play();
    }
})


audio.addEventListener("ended", (audio) =>{
    if(pointer >= song_list_length){
        pointer = 0;
    }
    audio.target.setAttribute("src", `/resources/${song_list[pointer]}`);
    pointer++;
    audio.target.play();
})

//logic of the game
let canvas = document.querySelector('canvas');
let c = canvas.getContext('2d');


const blockSize = 25;
const rows = 30;
const cols = 25;
let gameover = false;
// snake coordinates
let snakeX = 10;
let snakeY = 10;
let xdirection = 0;
let ydirection = 0;
//snake body
let snakeBody = [];

//food coordinates
let foodX = 20;
let foodY = 20; 


canvas.width = rows * blockSize;
canvas.height = cols * blockSize;


document.addEventListener("keyup", moveSnake, false);

setInterval(placeFood, 10000);
setInterval(update, 150);

function update(){

    // if game over return
    if(gameover){
        return;
    }

    //game board
    c.fillStyle = "black";
    c.fillRect(0, 0, canvas.width, canvas.height);
    

    if(snakeX == foodX && snakeY == foodY){
        snakeBody.push([foodX, foodY])
        placeFood();
        score+=1;
    }
    for(let i = snakeBody.length - 1; i > 0; i--){
        snakeBody[i] = snakeBody[i-1];
    }
    if(snakeBody.length){
        snakeBody[0] = [snakeX, snakeY];
    }
    //snake movement updation
    snakeX += xdirection;
    snakeY += ydirection;

    c.fillStyle = "green";
    c.fillRect(snakeX * blockSize, snakeY * blockSize, blockSize, blockSize);
    for(let i = 0; i < snakeBody.length; i++){
        c.fillRect(snakeBody[i][0] * blockSize, snakeBody[i][1] * blockSize, blockSize, blockSize);
    }

    //eat food




    // food location
    c.fillStyle = "red";
    c.fillRect(foodX * blockSize, foodY * blockSize, blockSize, blockSize);
    
    //game over condition
    if(snakeX > rows-1 ||  snakeX < 0 || snakeY > cols-1 || snakeY < 0){
        
        gameover = true;
        alert("game over");
    }

} 
console.log(canvas.width);
console.log(canvas.height);

function moveSnake(event){

    switch(event.key){
        case "ArrowUp":
           if(ydirection != 1){  
            ydirection = -1;
            xdirection = 0;
           }
            break;


        case "ArrowDown":
           if(ydirection != -1){
            ydirection = 1;
            xdirection = 0; 
           }
            break;


        case "ArrowLeft":
         if(xdirection != 1){
            ydirection = 0;
            xdirection = -1;
         }
            break;


        case "ArrowRight":
         if(xdirection != -1){
            ydirection = 0;
            xdirection = +1;
         }
         break;
    }
}

function placeFood(){

    foodX = Math.floor(Math.random() * rows);
    foodY = Math.floor(Math.random() * cols); 
    
}