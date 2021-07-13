let canvas = document.getElementById("gameScreen");
let ctx = canvas.getContext('2d');

const gameWidth = 800;
const gameHeight = 600;

let lastTime = 0;
let imgBall = document.getElementById('img_ball');
let imgBrick = document.getElementById('img_brick');
var ballX = gameWidth / 2 - 10;
var ballY = gameHeight - 70;
var ballSize = 10;
var score = 0;
const padHeight = 30;
const padWidth = 150;
const distanceFromBottom = 5;
var brickWidth = 78;
var brickHeight = 25;
var len = 0;
var totalLives = 3;

const mouse = {
    x : undefined,
    y : undefined,
}

const level1 = [
    [1,0,1,0,1,0,1,0,1,0],
    [0,1,0,1,0,1,0,1,0,1],
    [1,0,1,0,1,0,1,0,1,0],
    [0,1,0,1,0,1,0,1,0,1],
    [1,0,1,0,1,0,1,0,1,0],
    [0,1,0,1,0,1,0,1,0,1],
  
];

const level2 = [
    [1,0,1,0,1,0,1,0,1,0],
    [1,1,1,1,1,1,1,1,1,1],
    [1,0,1,0,1,0,1,0,1,0],
    [1,1,1,1,1,1,1,1,1,1],
    [1,0,1,0,1,0,1,0,1,0],
    [1,1,1,1,1,1,1,1,1,1],
];


const level3 = [
    [1,0,1,0,1,0,1,0,1,0],
    [0,0,0,0,0,0,0,0,0,0],
    [1,0,1,0,1,0,1,0,1,0],
    [0,0,0,0,0,0,0,0,0,0],
    [1,0,1,0,1,0,1,0,1,0],
    [0,0,0,0,0,0,0,0,0,0],
    [1,0,1,0,1,0,1,0,1,0]
    
  
];

const level4 = [
    [1,1,0,1,1,0,1,1,0,1],
    [1,1,0,1,1,0,1,1,0,1],
    [1,1,0,1,1,0,1,1,0,1],
    [1,1,0,1,1,0,1,1,0,1],
    [1,1,0,1,1,0,1,1,0,1],
    [1,1,0,1,1,0,1,1,0,1],
];

const allLevels = [level1, level2, level3,level4];

function scores(){
    ctx.font = "20px Arial";
    ctx.fillStyle = "black";
    ctx.textAlign = "center";
    ctx.fillText(`score : ${score}`, gameWidth - 100, 20);

}

function updateLives(){
    ctx.font = "20px Arial";
    ctx.fillStyle = "black";
    ctx.textAlign = "center";
    ctx.fillText(`lives : ${game.lives}`,50, 20);

}

function showLevel(){
    ctx.font = "20px Arial";
    ctx.fillStyle = "black";
    ctx.textAlign = "center";
    ctx.fillText(`level : ${game.currentLevel + 1}`,gameWidth/2, 20);
}



class Paddle {
    constructor(gameWidth, gameHeight){
        this.width = padWidth;
        this.height = padHeight;
        this.maxSpeed = 5;
        this.speed = 0;
        this.position = {
            x : gameWidth / 2 - this.width / 2,
            y : gameHeight  - this.height - distanceFromBottom ,
        }

    }

    reset(){
        this.position = {
            x : gameWidth / 2 - this.width / 2,
            y : gameHeight  - this.height - distanceFromBottom ,
        }
    }

    draw(){

        ctx.fillStyle = "black";
        ctx.fillRect(this.position.x, this.position.y , this.width, this.height);

    }

    update(){

        this.position.x += this.speed;

        if(this.position.x < 0) this.position.x = 0;

        if(this.position.x + this.width > gameWidth) this.position.x = gameWidth - this.width;

    }

    moveToLeft(){
        this.speed = - this.maxSpeed;
    }

    moveToRight(){
        this.speed = this.maxSpeed;
    }

    stop(){
        this.speed = 0;
    }
}



class movingBall extends Paddle{
    constructor(paddle, game){
        super(Paddle);
        this.image = imgBall;
        this.speed = {
           x : 4,
           y: -4,
       };
       this.position = {
           x : ballX,
           y : ballY,
       };
       this.size = ballSize;
       this.paddle = paddle;
       this.game = game;
    }

    reset(){
        this.speed = {
            x : -4,
            y: -4,
        };
        this.position = {
            x : ballX,
            y : ballY,
        };

    }

    draw(){
        ctx.beginPath();
        ctx.fillStyle = "blue";
        ctx.arc( this.position.x, this.position.y,this.size, 0, 360);
        ctx.fill();
        ctx.closePath();
    }

    update(){
        if(this.position.x + this.size > gameWidth || this.position.x < 0){
            this.speed.x = - this.speed.x;
        }
        if( this.position.y < 0){
            this.speed.y = - this.speed.y;
        }
        if(this.position.y + this.size > gameHeight ){
            this.game.lives--;
            this.reset();
            this.paddle.reset();
        }

        let bottomOfBall = this.position.y + this.size;
        let topOfPaddle = gameHeight - padHeight - distanceFromBottom;
        let leftSideOfPaddle = this.paddle.position.x - 10;
        let rightSideOfPaddle = this.paddle.position.x + padWidth;

        if(bottomOfBall >= topOfPaddle && this.position.x >= leftSideOfPaddle && this.position.x + this.size <= rightSideOfPaddle){
            this.speed.y = - this.speed.y;
        }

        this.position.x += this.speed.x;
        this.position.y += this.speed.y;

    }

  
}



class Brick extends movingBall{
   constructor(x, y, ball, game){
    super(movingBall);
        this.img = imgBrick;
        this.width = brickWidth;
        this.height = brickHeight;
        this.position = {
            x : x,
            y : y,
        };
        this.markForDeletion = false;
        this.ball = ball;
        this.game = game;
    }
    draw(){
        ctx.drawImage(imgBrick, this.position.x +5, this.position.y + 5,this.width, this.height);
    }
    update(){
        if(this.brickCD()){
            this.ball.speed.y = - this.ball.speed.y;
            this.markForDeletion = true;
            score += 100;
            len--;

        }

    }

    brickCD(){
        let bottomOfBall = this.ball.position.y + this.ball.size;
        let topOfBall = this.ball.position.y ;
    
        let topOfBrick = this.position.y;
        let bottomOfBrick = this.position.y + brickHeight;
        let leftSideOfBrick = this.position.x;
        let rightSideOfBrick = this.position.x + brickWidth;
    
        if(bottomOfBall > topOfBrick && topOfBall < bottomOfBrick && this.ball.position.x > leftSideOfBrick && this.ball.position.x + this.ball.size < rightSideOfBrick){
            return true;
        }else{
            return false;
        }    
        
} 

}

class inputHandler extends Brick{
    constructor(paddle, game){
        super(Brick);
        document.addEventListener('keydown', function(event){
            switch(event.keyCode){
                case 37 :
                   try{
                        paddle.moveToLeft();
                    }catch{return; }
                    break;
                case 39 : 
                    try{
                        paddle.moveToRight();
                      }catch{ return; }
                    break;
                case 27 :
                    try{
                        game.togglePause();
                      }catch{
                          return;
                      }
                    break;
                 case 32 : 
                    try{
                        game.toggleStart();
                      }catch{
                          return;
                      }
                    break;

            }
        }); 

        document.addEventListener('mousemove',function(event){
           mouse.x = event.x;
           mouse.y = event.y;
      try{
        if(paddle.position.x + paddle.size < gameWidth || paddle.position.x > 0){
            paddle.position.x = mouse.x;
        }
      }catch{
          return;
      }
          

/*

            if(mouse.x > paddle.position.x){
                paddle.moveToRight();
            }

            if(mouse.x < paddle.position.x){
                paddle.moveToLeft();
            }



*/

        } );

            document.addEventListener('keyup', function(event){
                switch(event.keyCode){
                    case 37 :
                        if(paddle.speed < 0) {
                            paddle.stop();
                        }
                        break;
                    case 39 : 
                        if(paddle.speed > 0){
                            paddle.stop();
                        }
                        break;

                }
        });
    }
}



class Game extends inputHandler {
    constructor(){
        super(inputHandler);

       this.GAMESTATE = {
            PAUSED : 0,
            RUNNING :1,
            MENU : 2,
            GAMEOVER : 3,
            noNEXTLEVEL :5,
        }
        this.lives = totalLives;
        this.gameObjects = [];
        this.levels = allLevels;
        this.currentLevel = 0;
        this.gameState = this.GAMESTATE.MENU;
        this.brickArray = [];

        this.paddle = new Paddle(gameWidth, gameHeight);
        this.ball = new movingBall(this.paddle, this);
        new inputHandler(this.paddle, this);


        
    }

    lastFrame(){
        ctx.rect(0,0,gameWidth, gameHeight);
        ctx.fillStyle = 'rgba(0,0,0,1)';
        ctx.fill();
 
        ctx.font = "40px Arial";
        ctx.fillStyle = "white";
        ctx.textAlign = "center";
        ctx.fillText("You completed all levels", gameWidth/2, gameHeight/2);
 
    }



    start(){



        if(this.currentLevel  == allLevels.length){
           this.gameState = this.GAMESTATE.noNEXTLEVEL;
        }

    

        if(this.gameState === this.GAMESTATE.noNEXTLEVEL) return;




    this.levels[this.currentLevel].forEach((row, rowIndex) => {
        row.forEach((brick,brickIndex) => {
            if(brick === 1){
                let position = {
                    x : brickWidth * brickIndex + 5,
                    y : 20 + 25 * rowIndex ,
                }
            this.brickArray.push(new Brick( position.x, position.y,this.ball));
            len++;
            }
        });
    });


    this.gameObjects = [this.paddle,this.ball,...this.brickArray];



    }

    update(){

    if(this.gameState == this.GAMESTATE.RUNNING &&  len == 0){
        this.currentLevel += 1;


        this.ball.reset();
        this.paddle.reset();
        this.lives = totalLives;
        this.start();

    }



    
        if(this.lives === 0) this.gameState = this.GAMESTATE.GAMEOVER;

        if(this.gameState === this.GAMESTATE.PAUSED || 
            this.gameState === this.GAMESTATE.MENU ||
            this.gameState === this.GAMESTATE.GAMEOVER ||
            this.gameState === this.GAMESTATE.noNEXTLEVEL) return ;

      this.gameObjects.forEach((object) => object.update());

    this.gameObjects = this.gameObjects.filter(object => !object.markForDeletion);
    

   }

    draw(){

       this.gameObjects.forEach((object) => object.draw());

       if(this.gameState == this.GAMESTATE.PAUSED){
           ctx.rect(0,0,gameWidth, gameHeight);
           ctx.fillStyle = 'rgba(0,0,0,0.4)';
           ctx.fill();

           ctx.font = "40px Arial";
           ctx.fillStyle = "white";
           ctx.textAlign = "center";
           ctx.fillText("Paused", gameWidth/2, gameHeight/2);
       }

       if(this.gameState == this.GAMESTATE.MENU){
        ctx.rect(0,0,gameWidth, gameHeight);
        ctx.fillStyle = 'rgba(0,0,0,1)';
        ctx.fill();

        ctx.font = "40px Arial";
        ctx.fillStyle = "white";
        ctx.textAlign = "center";
        ctx.fillText("Press spacebar to START", gameWidth/2, gameHeight/2);
    }

    if(this.gameState == this.GAMESTATE.GAMEOVER){
        ctx.rect(0,0,gameWidth, gameHeight);
        ctx.fillStyle = 'rgba(0,0,0,1)';
        ctx.fill();

        ctx.font = "40px Arial";
        ctx.fillStyle = "white";
        ctx.textAlign = "center";
        ctx.fillText("GAMEOVER", gameWidth/2, gameHeight/2);
    }

    


    }


    togglePause(){
        if(this.gameState == this.GAMESTATE.PAUSED){
            this.gameState = this.GAMESTATE.RUNNING;
        }else{
            this.gameState = this.GAMESTATE.PAUSED;
        }
    }

    toggleStart(){
        if(this.gameState == this.GAMESTATE.MENU){
            this.gameState = this.GAMESTATE.RUNNING;
            this.start();
        }

        /*
       else if(this.gameState == this.GAMESTATE.GAMEOVER){
            this.gameState = this.GAMESTATE.MENU;
        }

*/
    }



}

const game = new Game();


function gameLoop(timeStamp){
    requestAnimationFrame(gameLoop);
    ctx.clearRect(0, 0, gameWidth, gameWidth);

    let deltaTime = timeStamp - lastTime;
    lastTime = timeStamp;
    game.update(deltaTime);
    game.draw();

scores();
updateLives();
showLevel() ;

if(game.gameState === game.GAMESTATE.noNEXTLEVEL) {
    game.lastFrame();
}

    
}

gameLoop(0);






