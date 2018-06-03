global.activeSong = 'mix.0.0.1';
require('babel-register');
const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const { port, num_tracks } = require('./config');
const { fire } = require('./controller');
const path = require('path');
const { state, setState } = require('./state');
const { getRandomExclusive, sleep, assign_socket, init, addStat } = require('./utils');

const strap = async () => {
  // reads ableton and initializes state
  await init();

  const app = express();
  const server = http.Server(app);
  const websocket = socketio(server, { transports: ["websocket"] });

  global.websocket = websocket;

  server.listen(port, () => console.log('port ', port));
  app.use('/build', express.static('build'));
  app.use('/', express.static('client'));

  app.get('*', (req, res) => {
    res.sendFile(path.join(`${__dirname}/client/index.html`));
  });
  // The event will be called when a client is connected.
  websocket.on('connection', async (socket) => {
    // console.log('mothership connection', socket.id);

    if (JSON.stringify(state()) === JSON.stringify({})) {
      console.log('sleeping?');
      await sleep(2000);
    }
    if (!socket.assignment) {
      // random sleep to increase chance of different tracks
      const sleep_amount = getRandomExclusive(500, 1000, true);
      await sleep(sleep_amount)
      assign_socket(socket);
    }
    socket.emit('assignment', state().track_map[socket.assignment])

    // Disconnect this socket on disconnect and free up that track for someone else
    socket.on('disconnect', err => {
      const s = state();
      delete s.assignments[socket.id]
      for (let key in s.track_map) {
        if (s.track_map[key].assigned && s.track_map[key].assigned === socket.id) {
          delete s.track_map[key].assigned
          break;
        }
      }
      setState(s)
    })

    socket.on('newAssignment', async () => {
      // delete the old assignment
      const s = state();
      delete s.assignments[socket.id]
      for (let key in s.track_map) {
        if (s.track_map[key].assigned && s.track_map[key].assigned === socket.id) {
          delete s.track_map[key].assigned
          break;
        }
      }
      setState(s);
      await sleep(100);
      console.log('new assignemnt');
      // random sleep to increase chance of different tracks
      const sleep_amount = getRandomExclusive(0, 1000, true);
      await sleep(sleep_amount);
      assign_socket(socket);
    })
    socket.on('fire', (payload) => {
      const { track, clip } = payload
      addStat(socket.name, track, clip)
      fire(track, clip)
    })

    socket.on('name', (payload) => {
      const { name } = payload
      socket.name = name;
    })

    socket.on('join', (room) => {
      console.log('socket join room ', room);
      socket.join(room);
    });

    socket.on('peerToMaster', async (data) => {
      console.log('peerToMaster', data);
      websocket.sockets.in(`rtc/master`).emit('requestPeerConnection', data);
    })
    socket.on('masterToPeer', (data) => {
      websocket.sockets.in(`rtc/${data.uuid}`).emit('masterResponse', data);

    })
    socket.on('frame', (data) => {
      console.log('got frame');
      websocket.to('rtc/master').emit('frame', data);
    })
  });


  setInterval(() => {
    const s = state();
    // get names:
    const s_ids = {}
    for (let id in websocket.sockets.clients().sockets) {
      s_ids[id] =  websocket.sockets.clients().sockets[id].name || null
    }
    const stats = {}
    const assignments = {};
    for (let key in s.assignments) {
      if (s_ids[key]) {
        assignments[s_ids[key]] = s.assignments[key]
        if (s.assignments[key] !== -1) assignments[s_ids[key]] = s.track_map[s.assignments[key]]
      }
    }
    websocket.emit('stats', { stats: s.stats, assignments, tracks: s.track_map, num_tracks })
  }, 1000);
}
strap()
