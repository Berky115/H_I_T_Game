let socket = io();

let windowWidth = 800;
let windowHeight = 600;

let movement = {
    up: false,
    down: false,
    left: false,
    right: false,
    ammo: 0,
    shotDirection: 'down'
}

document.addEventListener('keydown', function(event) {
  switch (event.keyCode) {
    case 65: // A
      movement.left = true;
      break;
    case 87: // W
      movement.up = true;
      break;
    case 68: // D
      movement.right = true;
      break;
    case 83: // S
      movement.down = true;
      break;
    case 37: //arrow
        movement.shotDirection= 'left'
        movement.ammo++;
        break;
    case 38: //arrow
        movement.shotDirection= 'up'
        movement.ammo++;
        break;
    case 39: //arrow
        movement.shotDirection= 'right'
        movement.ammo++;
        break;
    case 40: //arrow
        movement.shotDirection= 'down'
        movement.ammo++;
        break;
  }
});

document.addEventListener('keyup', function(event) {
  switch (event.keyCode) {
    case 65:
      movement.left = false;
      break;
    case 87:
      movement.up = false;
      break;
    case 68:
      movement.right = false;
      break;
    case 83:
      movement.down = false;
      break;
    case 37:
        movement.ammo=0;
        break;
    case 38:
        movement.ammo=0;
        break;
    case 39:
        movement.ammo=0;
        break;
    case 40:
        movement.ammo=0;
        break;
  }
});

socket.emit('new player');

setInterval(function() {
    socket.emit('update', movement);
}, 1000 / 60);


let canvas = document.getElementById('canvas');
canvas.width = windowWidth;
canvas.height = windowHeight;
let context = canvas.getContext('2d');

// on state change
socket.on('state', function(activeGame) {
  context.clearRect(0, 0, windowWidth, windowHeight);

  context.font = "20px Georgia";
  if(activeGame.players[socket.id] && activeGame.players[socket.id].isActive) {
    context.fillText( "Health : " + activeGame.players[socket.id].health, 10, 50);
  } else {
    context.fillText("You have been defeated", 10, 50);
  }

//draw every player
  for (var id in activeGame.players) {
    var player = activeGame.players[id];
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

