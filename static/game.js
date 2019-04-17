let socket = io();

const windowWidth = 800;
const windowHeight = 600;



const LEFT = [-20,0];
const RIGHT = [20,0];
const UP = [0, -20];
const DOWN = [0,20];


socket.emit('new player');
let input = {
    up: false,
    down: false,
    left: false,
    right: false,
    velocity: [0,0],
    activeFire: false
}

// input logic
document.addEventListener('keydown', function(event) {
  switch (event.keyCode) {
    case 65: // A
      input.left = true;
      break;
    case 87: // W
      input.up = true;
      break;
    case 68: // D
      input.right = true;
      break;
    case 83: // S
      input.down = true;
      break;
    case 37: //arrow left
        input.velocity = LEFT
        input.activeFire = true
        break;
    case 38: //arrow up
        input.velocity = UP
        input.activeFire = true
        break;
    case 39: //arrow right
        input.velocity = RIGHT;
        input.activeFire = true
        break;
    case 40: //arrow down
        input.velocity = DOWN;
        input.activeFire = true
        break;
  }
});

document.addEventListener('keyup', function(event) {
  switch (event.keyCode) {
    case 65:
      input.left = false;
      break;
    case 87:
      input.up = false;
      break;
    case 68:
      input.right = false;
      break;
    case 83:
      input.down = false;
      break;
    case 37:
      input.activeFire=false;
      break;
    case 38:
      input.activeFire=false;
      break;
    case 39:
      input.activeFire=false;
      break;
    case 40:
      input.activeFire=false;
      break;
  }
});

let canvas = document.getElementById('canvas');
canvas.width = windowWidth;
canvas.height = windowHeight;
let context = canvas.getContext('2d');

socket.on('state', function(activeGame) {
  context.clearRect(0, 0, windowWidth, windowHeight);

  // Render methods

  //player ui
  if(activeGame.players[socket.id]) {
    context.font = "20px Georgia";
    context.fillStyle = activeGame.players[socket.id].color;
    if(activeGame.players[socket.id].isActive) {
      context.fillText( "Health : " + activeGame.players[socket.id].health, 10, 50);
    } else {
      context.fillStyle = 'red'
      context.fillText("You have been defeated", 10, 50);
    }
  }


//draw every player
  for (let id in activeGame.players) {
    let player = activeGame.players[id];
    if (player.isActive){
        context.fillStyle = player.color;
        context.beginPath();
        context.arc(player.x, player.y, 10, 0, 2 * Math.PI);
        context.fill();
    }
  }

//draw every bullet
    for (let i = 0; i < activeGame.bullets.length; i++) {
      context.fillStyle = activeGame.bullets[i].color;
      context.beginPath();
      context.arc(activeGame.bullets[i].x, activeGame.bullets[i].y, 5, 0, 2 * Math.PI);
      context.fill();
    }

});

//set update
setInterval(function() {
  socket.emit('update', input);
}, 1000 / 60);

