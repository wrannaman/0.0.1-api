global.activeSong = '0.0.6.3';
const song = require(`./songs/${global.activeSong}`); // eslint-disable-line
require('babel-register');
const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const config = require('./config');
const ctrl = require('./controllers');
const path = require('path');

const app = express();
const server = http.Server(app);
const websocket = socketio(server, { transports: ["websocket"] });

global.websocket = websocket;

server.listen(config.port, () => config.falcon());
app.use('/build', express.static('build'));
app.use('/', express.static('client'));

app.get('*', (req, res) => {
  res.sendFile(path.join(`${__dirname}/client/index.html`));
});
// The event will be called when a client is connected.
websocket.on('connection', (socket) => {
  console.log('connection', socket.id);
  // console.log('A client just joined on', socket.conn.server.transports);
  socket.on('dk', (msg, cb) => {
    // console.log('msg', msg);
    ctrl.drum.handle(msg);
    if (typeof cb !== 'function') return;
    const time = Date.now();
    cb(null, String(time));
  });

  socket.on('leap', (msg) => {
    // console.log('leap', msg);
    ctrl.leap.handle(msg);
  });

  websocket.emit('totalCounts', song);
});

// const dgram = require('dgram');
// const _udp = dgram.createSocket('udp4');
//
// _udp.on('error', (err) => {
//   console.log(`_udp error:\n${err.stack}`);
//   _udp.close();
// });
//
// _udp.on('message', (msg, rinfo) => {
//   ctrl.drum.handle({ d:3 });
//   const time = String(Date.now());
//   console.log('udp time ', time - Number(msg));
//   // console.log(`_udp got: ${msg} from ${rinfo.address}:${rinfo.port}`);
//
// });
//
// _udp.on('listening', () => {
//   var address = _udp.address();
//   console.log(`_udp listening ${address.address}:${address.port}`);
// });
//
// _udp.bind(41234, '192.168.0.3');
