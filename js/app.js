var TILEWIDTH = 101,
    TILEHEIGHT = 83,
    NUMROWS = 6,
    NUMCOLUMNS = 5,
    TILEYOFFSET = 60,
    GAMEWIDTH = TILEWIDTH * NUMCOLUMNS,
    GAMEHEIGHT = TILEHEIGHT * NUMROWS + 100;
// Enemies our player must avoid
var Enemy = function() {
    // Variables applied to each of our instances go here,
    // we've provided one for you to get started

    // The image/sprite for our enemies, this uses
    // a helper we've provided to easily load images
    this.sprite = 'images/enemy-bug.png';
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

// Now write your own player class
// This class requires an update(), render() and
// a handleInput() method.
var Player = function(charSprite) {
    this.sprite = charSprite;
    this.reset();
};

Player.prototype.reset = function() {
    //choose the x tile randomly
    this.tilex = Math.floor(Math.random() * NUMCOLUMNS);
    //place the player on the grass
    this.tiley = NUMROWS - 1;
};

Player.prototype.update = function(dt) {

};

Player.prototype.render = function() {
    this.x = TILEWIDTH * this.tilex;
    //y is top, so subtract 1 tiles
    this.y = TILEHEIGHT * (this.tiley - 1) + TILEYOFFSET;
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

Player.prototype.handleInput = function(direction) {
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

    if (this.tiley == 0) {
        //the player won!!
        score.displaySuccess();
        //reset game
    }
};

Player.prototype.checkIfLive = function() {
    //TODO: if bumped into bug, a life is lost!
    allEnemies.forEach(function(enemy) {
        if (Math.abs(enemy.x - player.x) < TILEWIDTH / 2 && enemy.tiley == player.tiley) {
            score.lifeLost();
            player.reset();
        }
    });
};

var Gem = function() {
    this.reset();
};

Gem.prototype.render = function() {
    this.x = TILEWIDTH * this.tilex;
    //y is top, so subtract 1 tiles
    this.y = TILEHEIGHT * (this.tiley - 1) + TILEYOFFSET + 50;
    if (!this.taken) {
        ctx.drawImage(Resources.get(this.sprite), this.x, this.y, TILEWIDTH, TILEHEIGHT);
    }
};

Gem.prototype.checkIfTaken = function() {
    if (!gem.taken && gem.tilex == player.tilex && gem.tiley == player.tiley) {
        score.gemcount++;
        gem.taken = true;
    }
};

Gem.prototype.reset = function() {
    this.taken = false;
    var gemChoice = [
        'images/Gem Blue.png',
        'images/Gem Green.png',
        'images/Gem Orange.png'
    ];

    //choose a random gem
    this.sprite = gemChoice[Math.floor(Math.random() * gemChoice.length)];
    //choose a random tile
    this.tilex = Math.floor(Math.random() * NUMCOLUMNS);
    //make sure gem is on paved path
    this.tiley = Math.floor(Math.random() * 3) + 1;
};

var Score = function() {
    this.reset();
};

Score.prototype.reset = function() {
    this.score = 0;
    this.gemcount = 0;
    this.level = 1;
    //player has 7 lives
    this.lives = 7;
};

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

Score.prototype.lifeLost = function() {
    this.lives--;
    if (this.lives == 0) {
        //TODO: game over!
        displayFinish('Game Over!!');
    }
};

Score.prototype.displaySuccess = function() {
    //TODO: display success!!
    this.score++;
    player.reset();
    gem.reset();
    //TODO: increase level, restart game
    //    this.level++;
    if (score.gemcount > 7) {
        //display you win!
        //game reset
        displayFinish('Awesome job!! You won!!!');
    }
};

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

PlayerMenu.prototype.drawPlayers = function() {
    ctx.strokeStyle = 'black';
    ctx.clearRect(0, 0, GAMEWIDTH, GAMEHEIGHT);
    for (var index = 0; index < this.charChoice.length; index++) {
        ctx.strokeRect(index * TILEWIDTH, this.playerTop, TILEWIDTH, this.playerHeight);
        ctx.drawImage(Resources.get(this.charChoice[index]), index * TILEWIDTH, this.playerY);
    }

}

PlayerMenu.prototype.choosePlayer = function(enginemain) {
    // highlight the mouse overed image
    this.drawPlayers();

    //we need these events named so we can remove them later.
    var mousePlayer = function(e) {
        if (e.offsetY > playerMenu.playerTop &&
                    e.offsetY < playerMenu.playerTop + playerMenu.playerHeight) {
            //TODO: offsetX is not supported in all browsers! is there any other way to do this?
            var newCharChoice = Math.floor((e.offsetX / TILEWIDTH));
            if (playerMenu.mouseoverChoice != newCharChoice) {
                //redraw choices
                playerMenu.drawPlayers();
                ctx.strokeStyle = 'blue';
                ctx.strokeRect(newCharChoice * TILEWIDTH, playerMenu.playerTop, TILEWIDTH, playerMenu.playerHeight);
            }
        }
    };

    //keep clickPlayer in here for closure: we need to call enginemain after user chooses player.
    var clickPlayer = function (e) {
        if (e.offsetY > playerMenu.playerTop &&
            e.offsetY < playerMenu.playerTop + playerMenu.playerHeight)
        {
            var index = Math.floor(e.offsetX / TILEWIDTH);
            //TODO: offsetX is not supported in all browsers! is there any other way to do this?
            if (index < playerMenu.charChoice.length && index >= 0) {
                ctx.canvas.removeEventListener('mousemove', mousePlayer);
                ctx.canvas.removeEventListener('click', clickPlayer);
                var charSprite = playerMenu.charChoice[index];
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
    finalText = text;
}