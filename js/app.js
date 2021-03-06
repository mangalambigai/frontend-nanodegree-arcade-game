"use strict";

var TILEWIDTH = 101,
    TILEHEIGHT = 83,
    NUMROWS = 6,
    NUMCOLUMNS = 5,
    TILEYOFFSET = 60,
    GAMEWIDTH = TILEWIDTH * NUMCOLUMNS,
    GAMEHEIGHT = TILEHEIGHT * NUMROWS + 100;

// Enemy Constructor
// Enemies our player must avoid
var Enemy = function() {
    // Variables applied to each of our instances go here,
    // The image/sprite for our enemies, this uses
    // a helper we've provided to easily load images
    this.sprite = 'images/enemy-bug.png';
    //always start from left of screen
    this.x = -80;
    //randomly select the tile, assume there are 3 stone tiles, add 1 for the water tile
    this.tiley = Math.floor(Math.random() * 3) + 1;
    //y is calculated from top, so subtract 1 tile
    this.y = (this.tiley - 1) * TILEHEIGHT + TILEYOFFSET;

    //randomly choose speed to be 20 or 40 pixel per time delta
    this.speed = Math.floor(Math.random() * 2 + 1) * 20;
};

// Update the enemy's position, required method for game
// Parameter: dt, a time delta between ticks
Enemy.prototype.update = function(dt) {
    // You should multiply any movement by the dt parameter
    // which will ensure the game runs at the same speed for
    // all computers.
    this.x += this.speed * dt;
    if (this.x > GAMEWIDTH) {
        this.x = 0;
    }
};

// Draw the enemy on the screen, required method for game
Enemy.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

//Player constructor
var Player = function(charSprite) {
    this.sprite = charSprite;
    this.reset();
};

//Reset the player to grass tiles
Player.prototype.reset = function() {
    //choose the x tile randomly
    this.tilex = Math.floor(Math.random() * NUMCOLUMNS);
    //place the player on the grass
    this.tiley = NUMROWS - 1;
};

//Player doesnt move automatically
Player.prototype.update = function(dt) {

};

//here is where player is drawn
Player.prototype.render = function() {
    this.x = TILEWIDTH * this.tilex;
    //y is top, so subtract 1 tiles
    this.y = TILEHEIGHT * (this.tiley - 1) + TILEYOFFSET;
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

//move the player according to keyboard input
//parameter: direction: string, with values left, right, up or down
Player.prototype.handleInput = function(direction) {
    var oldTileX = this.tilex;
    var oldTileY = this.tiley;
    //make sure the player stays in the game
    if (direction == 'left' && this.tilex > 0) {
        this.tilex -= 1;
    } else if (direction == 'right' && this.tilex < NUMCOLUMNS - 1) {
        this.tilex += 1;
    } else if (direction == 'up' && this.tiley > 0) {
        this.tiley -= 1;
    } else if (direction == 'down' && this.tiley < NUMROWS - 1) {
        this.tiley += 1;
    }

    //Player can't walk on rocks!
    if(rock.checkLocation(this.tilex, this.tiley))
    {
        this.tilex = oldTileX;
        this.tiley = oldTileY;
    }

    if (this.tiley == 0) {
        //the player won!!
        score.displaySuccess();
        //reset game
    }
};

//check if the player bumped into any bugs
Player.prototype.checkIfLive = function() {
    //TODO: if bumped into bug, a life is lost!
    var p = this;
    allEnemies.forEach(function(enemy) {
        if (Math.abs(enemy.x - p.x) < TILEWIDTH / 2 && enemy.tiley == p.tiley) {
            score.lifeLost();
            resetEntities();
        }
    });
};

//Constructor of Thing - base class of things such as rocks and gems
//takes the sprite name as arguments
var Thing = function(sprite) {
    this.sprite = sprite;
    this.resetLocation();
};

//resets the location of the thing to random location on the paved tiles
Thing.prototype.resetLocation = function(){
    //choose a random tile
    this.tilex = Math.floor(Math.random() * NUMCOLUMNS);
    //make sure thing is on paved path
    this.tiley = Math.floor(Math.random() * 3) + 1;
};

//draws the thing on the tile
Thing.prototype.render = function() {
    this.x = TILEWIDTH * this.tilex;
    //y is top, so subtract 1 tiles
    this.y = TILEHEIGHT * (this.tiley - 1) + TILEYOFFSET + 50;
    if (!this.taken) {
        ctx.drawImage(Resources.get(this.sprite), this.x, this.y, TILEWIDTH, TILEHEIGHT);
    }
};

//Constructor of Rock class, derives from "Thing"
var Rock = function() {
    Thing.call(this,'images/Rock.png');
};

//delegate the prototype calls, but set the type for typeof calls
Rock.prototype = Object.create(Thing.prototype);
Rock.prototype.constructor = Rock;

//resetting rock just resets its location, pass the call to Thing's reset method
Rock.prototype.reset = function()
{
    this.resetLocation();
};

//Checks the location of rock
//parameters: tilex and tiley locations to check for
Rock.prototype.checkLocation = function(tilex,tiley) {
    return (this.tilex== tilex && this.tiley == tiley);
};


//Constructor of Gem class,
//this class derives from Thing, it has to choose a sprite from one of the gems
var Gem = function() {
    Thing.call(this, this.randomGem());
    this.reset();
};

//this will delegate the function calls to Thing.prototype,
//but still keep the constructor name for type checking
Gem.prototype = Object.create(Thing.prototype);
Gem.prototype.constructor = Gem;

//choose one of the gem images,
//no parameters, but return the URI of the chosen gem
Gem.prototype.randomGem = function()
{
    var gemChoice = [
        encodeURI('images/Gem Blue.png'),
        encodeURI('images/Gem Green.png'),
        encodeURI('images/Gem Orange.png')
    ];

    //choose a random gem
    return( gemChoice[Math.floor(Math.random() * gemChoice.length)]);
};

//check if the gem is taken by player.
Gem.prototype.checkIfTaken = function() {
    if (!gem.taken && gem.tilex == player.tilex && gem.tiley == player.tiley) {
        score.gemcount++;
        gem.taken = true;
    }
};

//reset the gem to new location and type
Gem.prototype.reset = function() {
    this.taken = false;
    this.sprite = this.randomGem();
    this.resetLocation();
};

//score constructor
var Score = function() {
    this.reset();
};

//reset the score, may want to restart game after gameover, or success
Score.prototype.reset = function() {
    this.score = 0;
    this.gemcount = 0;
    this.level = 1;
    //player has 7 lives
    this.lives = 7;
};

//display the score
Score.prototype.render = function() {

    var text = "Level: " + this.level;
    //TODO: display level??
    //clear the previous score display
    ctx.clearRect(0, 0, GAMEWIDTH, TILEYOFFSET - 15);

    //display lives
    for (var i = 0; i < this.lives; i++) {
        var heartx = 26 * i;
        ctx.drawImage(Resources.get('images/Heart.png'), heartx, 0, 25, 40);
    }

    //display stars
    for (var i = 0; i < this.gemcount; i++) {
        var starx = GAMEWIDTH - 26 * (i + 1);
        ctx.drawImage(Resources.get('images/Star.png'), starx, 0, 25, 40);
    }

    //display score
    if (finalText != '')
        text = finalText
    else
        text = 'Score: ' + this.score;
    ctx.font = '30px impact';
    ctx.textAlign = 'center';
    ctx.strokeStyle = 'black';
    ctx.fillStyle = 'white';
    ctx.lineWidth = 3;
    ctx.strokeText(text, GAMEWIDTH / 2, 40);
    ctx.fillText(text, GAMEWIDTH / 2, 40);
};

//udate score for a life lost
Score.prototype.lifeLost = function() {
    this.lives--;
    if (this.lives == 0) {
        //TODO: game over!
        displayFinish('Game Over!!');
    }
};

//update score for a game won
Score.prototype.displaySuccess = function() {
    this.score++;
    resetEntities();
    //TODO: increase level, restart game
    //    this.level++;
    if (score.gemcount > 7) {
        //display you win!
        //game reset
        displayFinish('Awesome job!! You won!!!');
    }
};

//constructor for the player menu
var PlayerMenu = function(){
    this.mouseoverChoice = -1;
    this.charChoice = [
        'images/char-boy.png',
        'images/char-cat-girl.png',
        'images/char-horn-girl.png',
        'images/char-pink-girl.png',
        'images/char-princess-girl.png'
    ];
    this.playerTop = TILEHEIGHT * (NUMROWS + 1) / 2;
    this.playerHeight = TILEHEIGHT * 3 / 2;
    this.playerY = TILEHEIGHT * NUMROWS / 2;
};

//draw the players next to each other, draw a rectangle around each of them
PlayerMenu.prototype.drawPlayers = function() {
    ctx.strokeStyle = 'black';
    ctx.clearRect(0, 0, GAMEWIDTH, GAMEHEIGHT);
    for (var index = 0; index < this.charChoice.length; index++) {
        ctx.strokeRect(index * TILEWIDTH, this.playerTop, TILEWIDTH, this.playerHeight);
        ctx.drawImage(Resources.get(this.charChoice[index]), index * TILEWIDTH, this.playerY);
    }
}

//user can choose the player by clicking on one of the images.
//engine.main is not called until user chooses an image!
PlayerMenu.prototype.choosePlayer = function(enginemain) {
    this.drawPlayers();
    //We need "this" variable in the event functions, but they are bound elsewhere,
    //So use a local variable
    var menu = this;
    //we need these events named so we can removeEventListener them later.
    // highlight the mouse overed image in blue
    var mousePlayer = function(e) {
        if (e.offsetY > menu.playerTop &&
                    e.offsetY < menu.playerTop + menu.playerHeight) {
            //TODO: offsetX is not supported in all browsers! is there any other way to do this?
            var newCharChoice = Math.floor((e.offsetX / TILEWIDTH));
            if (menu.mouseoverChoice != newCharChoice) {
                //redraw choices
                menu.drawPlayers();
                ctx.strokeStyle = 'blue';
                ctx.strokeRect(newCharChoice * TILEWIDTH, menu.playerTop, TILEWIDTH, menu.playerHeight);
            }
        }
    };

    //keep clickPlayer in here for closure: we need to call enginemain after user chooses player.
    var clickPlayer = function (e) {
        if (e.offsetY > menu.playerTop &&
            e.offsetY < menu.playerTop + menu.playerHeight)
        {
            var index = Math.floor(e.offsetX / TILEWIDTH);
            //TODO: offsetX is not supported in all browsers! is there any other way to do this?
            if (index < menu.charChoice.length && index >= 0) {
                ctx.canvas.removeEventListener('mousemove', mousePlayer);
                ctx.canvas.removeEventListener('click', clickPlayer);
                var charSprite = menu.charChoice[index];
                ctx.clearRect(0, 0, GAMEWIDTH, GAMEHEIGHT);
                loadGame(charSprite);
                enginemain();
            }
        }
    };

    ctx.canvas.addEventListener('mousemove', mousePlayer);
    ctx.canvas.addEventListener('click', clickPlayer);
};

// Now instantiate your objects.
// Place all enemy objects in an array called allEnemies
// Place the player object in a variable called player

var playerMenu = new PlayerMenu();
var allEnemies = [];
var player = new Player('images/char-boy.png');
var gem = new Gem();
var rock = new Rock();
var score = new Score();
//this is the final text that displays success or failure message.
//if it has some content, the game is over!
var finalText = '';

function loadGame(charSprite) {
    player.sprite = charSprite;
    var numEnemies = score.level + 2;
    for (var i = 0; i < numEnemies; i++) {
        allEnemies.push(new Enemy());
    }

    // This listens for key presses and sends the keys to your
    // Player.handleInput() method. You don't need to modify this.
    document.addEventListener('keyup', function(e) {
        var allowedKeys = {
            37: 'left',
            38: 'up',
            39: 'right',
            40: 'down'
        };
        player.handleInput(allowedKeys[e.keyCode]);
    });
}

function displayFinish(text) {
//this is the final text that displays success or failure message.
//if it has some content, the game is over!
    finalText = text;
}

/* This function resets all the entities every time player wins or loses.
* Don't reset the score here!!
*/
function resetEntities() {
    player.reset();
    gem.reset();
    rock.reset();
}
