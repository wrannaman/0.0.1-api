const express = require('express');
const http = require('http')
const socketio = require('socket.io');
const app = express();
const server = http.Server(app);
const websocket = socketio(server);
const config = require('./config');

const ctrl = require('./controllers');
server.listen(config.port, () => config.falcon() );
// The event will be called when a client is connected.
websocket.on('connection', (socket) => {
  console.log('A client just joined on', socket.id);

  socket.on('drum kit', function(msg){
    console.log('msg');
    ctrl.drum.handle(msg);
  });

  // setInterval(()=>{
  //   socket.emit('channel-name', 'Hello world!');
  //   console.log('emit');
  // },2000)
});
