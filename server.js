const express = require('express');
const http = require('http');
const path = require('path');
const fs = require('fs')
const socketIO = require('socket.io');
const app = express();
const server = http.Server(app);
const io = socketIO(server);

//Constants to be moved:
const DEFAULT_COOLDOWN = 60;
const DEFAULT_MAX_HEALTH = 100;
const DEFAULT_MAX_AMMO = 10;
const spawnPoints = [ [300,300], [ 300, 500] , [ 500,500] , [500,300]]

//server setup
app.set('port', process.env.PORT || 5000);
app.use('/static', express.static(__dirname + '/static'));
app.get('/', function(request, response) {
  response.sendFile(path.join(__dirname, 'index.html'));
});
server.listen(process.env.PORT || 5000, function() {
  console.log('Server is online')
});


let activeGame = {
  players : {},
  bullets : []
}

io.on('connection', function(socket) {
    console.log('new user connected')

  //new player
  socket.on('new player', function() {
    spawnValue = Math.floor(Math.random() * 4); 
    activeGame.players[socket.id] = {
        health: DEFAULT_MAX_HEALTH,
        x: spawnPoints[spawnValue][0],
        y: spawnPoints[spawnValue][1],
        cooldown: DEFAULT_COOLDOWN,
        color: '#'+(Math.random()*0xFFFFFF<<0).toString(16),
        isActive: true,
        ammo: DEFAULT_MAX_AMMO
    };
  });

  //disconnect
  socket.on('disconnect', function(){
    console.log('user fled ...');
    delete activeGame.players[socket.id]
  });

  //update loop
  socket.on('update', function(data) {
    let player = activeGame.players[socket.id] || {};
    if (data.left) {
      player.x -= 5;
    }
    if (data.up) {
      player.y -= 5;
    }
    if (data.right) {
      player.x += 5;
    }
    if (data.down) {
      player.y += 5;
    }
    if(data.ammo > 0 && player.cooldown < 1){
        new_bullet = {
            x: player.x,
            y: player.y,
            shotDirection: data.shotDirection,
            color: player.color,
        }
        activeGame.bullets.push(new_bullet);
        player.cooldown = DEFAULT_COOLDOWN
        player.ammo--;
    }


    for (let id in activeGame.players) {
      let player = activeGame.players[id];
      if(player.cooldown > 0) {
          player.cooldown -= 10;
      }

      //collision detection
      for(let i = 0; i < activeGame.bullets.length; i++){
          if(activeGame.bullets[i].color !== player.color) {
              if( (player.x <= (activeGame.bullets[i].x + 10) && player.x >= (activeGame.bullets[i].x - 10)) &&
               (player.y <= (activeGame.bullets[i].y + 10) && player.y >= (activeGame.bullets[i].y - 10)))
               {
                   console.log(player.color + " was hit by " + activeGame.bullets[i].color)
                   player.health -= 5;
              }
          }

          if(player.health <= 0) {
              player.isActive = false
              console.log( player.color + " was defeated by player " + activeGame.bullets[i].color)
              delete activeGame.players[id]
          }
      }

    }

  for(let i = 0; i < activeGame.bullets.length; i++){
      if (activeGame.bullets[i].shotDirection === 'left'){
        activeGame.bullets[i].x -= 20;
      }
      if (activeGame.bullets[i].shotDirection === 'right'){
        activeGame.bullets[i].x += 20;
      }
      if (activeGame.bullets[i].shotDirection === 'up'){
        activeGame.bullets[i].y -= 20;
      }
      if (activeGame.bullets[i].shotDirection === 'down'){
        activeGame.bullets[i].y += 20;
      }

      //bullet collision detection

      //destroy bullet
      if(activeGame.bullets[i].x > 800 || activeGame.bullets[i].x < -10 || activeGame.bullets[i].y < -10 || activeGame.bullets[i].y > 600) {
        activeGame.bullets.splice(activeGame.bullets[i], 1);
      }

  }
  io.sockets.emit('state', activeGame);
  });
});