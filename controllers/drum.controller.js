const { GREEN, BLUE, YELLOW, RED, FOOT } = require('../models/drums');
const Max4Node = require('max4node');
const osc = require('node-osc');

const max = new Max4Node();
const client = new osc.Client('127.0.0.1', 7005);
const oscServer = new osc.Server(7003, '0.0.0.0');

let TIME = 0;
// let wut;
max.bind();
// const wut = "live_set scenes 1";

// wut = 'live_set tracks 1 mixer_device volume';
oscServer.on("message", (msg, rinfo) => { // eslint-disable-line
  // console.log("TUIO message:", msg);
});

max.observe({
  path: 'live_set',
  property: 'current_song_time'
})
.on('value', (val) => {
  console.log('current_song_time ', val);
  TIME = val;
});
 

const _fire = (note) => {
  client.send('int', 144, () => {});
  client.send('int', note, () => {});
  client.send('int', 56, () => {});
  setTimeout(() => {
    client.send('int', 128, () => {});
    client.send('int', note, () => {});
    client.send('int', 64, () => {});
  }, 50);
};

const DRUM_END = 272;
const RED_SWITCH = 334.5;

const DrumCtrl = {
  handle: (drumObj) => {
    if (drumObj.drum === GREEN) {
      if (TIME < DRUM_END) _fire(83);
      else _fire(78);
    } else if (drumObj.drum === BLUE) {
      if (TIME < DRUM_END) _fire(82);
      else _fire(77);
    } else if (drumObj.drum === YELLOW) {
      if (TIME < DRUM_END) _fire(81);
      else _fire(75);
    } else if (drumObj.drum === RED) {
      if (TIME < DRUM_END) _fire(80);
      else if (TIME < RED_SWITCH) _fire(73);
      else _fire(70);
    } else if (drumObj.drum === FOOT) {
      if (TIME < DRUM_END) _fire(80);
    }
  }
};

module.exports = DrumCtrl;
