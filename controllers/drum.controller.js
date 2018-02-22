const { GREEN, BLUE, YELLOW, RED, FOOT } = require('../models/drums');
const osc = require('../models/osc'); // eslint-disable-line
const song = require(`../songs/${global.activeSong}`); // eslint-disable-line

const fire = (n) => {
  osc.client.send('int', 144, () => {});
  osc.client.send('int', n.n, () => {});
  osc.client.send('int', (n.h || 56), () => {});
  setTimeout(() => {
    osc.client.send('int', 128, () => {});
    osc.client.send('int', n.n, () => {});
    osc.client.send('int', (n.h || 64), () => {});
  }, 50);
};

const resetInterval = setInterval(() => {
  if (global.MAX_TIME < song.start) {
    for (const key in song) {
      if (song[key].index) song[key].index = 0;
    }
  }
}, 1000);

const DrumCtrl = {
  handle: (drumObj) => {
    const idx = song[drumObj.d].index;
    console.log('global.MAX_TIME ', global.MAX_TIME);
    if (global.MAX_TIME < song[drumObj.d].notes[idx].e) fire(song[drumObj.d].notes[idx]);
    else {
      if (song[drumObj.d].index + 1 < song[drumObj.d].notes.length) ++song[drumObj.d].index; // eslint-disable-line
      fire(song[drumObj.d].notes[song[drumObj.d].index]);
    }
    global.websocket.emit('hit', { hit: drumObj.d });
  }
};

module.exports = DrumCtrl;
