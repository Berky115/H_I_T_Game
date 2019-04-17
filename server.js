const express = require('express');
const http = require('http');
const path = require('path');
const fs = require('fs')
const socketIO = require('socket.io');
const app = express();
const server = http.Server(app);
const io = socketIO(server);

//Constants to be moved:
const DEFAULT_COOLDOWN = 100;
const DEFAULT_MAX_HEALTH = 100;
const spawnPoints = [ [300,300], [ 300, 500] , [ 500,500] , [500,300]]
const MAX_BULLETS = 20;

//server setup
app.set('port', process.env.PORT || 8081);
// app.set('env', 'production')
app.use('/static', express.static(__dirname + '/static'));
app.get('/', function(request, response) {
  response.sendFile(path.join(__dirname, 'index.html'));
});
server.listen(process.env.PORT || 8081, function() {
  console.log('Server is online')
  console.log('started in ' + app.get('env') + ' mode on http://localhost:' + app.get('port'));

});

let activeGame = {
  players : {},
  bullets : []
}
let currentBullet = 0;

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
        isActive: true
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
    if(data.activeFire && player.cooldown < 1){
        new_bullet = {
            x: player.x,
            y: player.y,
            velocity: data.velocity,
            color: player.color,
        }
        console.log('we here');
        activeGame.bullets[currentBullet] = new_bullet;
        currentBullet++;
        if(currentBullet > MAX_BULLETS ) {
          currentBullet = 0;
        }
        player.cooldown = DEFAULT_COOLDOWN
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
        activeGame.bullets[i].x += activeGame.bullets[i].velocity[0];
        activeGame.bullets[i].y += activeGame.bullets[i].velocity[1];

      if(activeGame.bullets[i].x > 800 || activeGame.bullets[i].x < -10 || activeGame.bullets[i].y < -10 || activeGame.bullets[i].y > 600) {
        activeGame.bullets[i].velocity = [0,0]
      }
  }

  io.sockets.emit('state', activeGame);
  });
});