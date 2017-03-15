const { GREEN, BLUE, YELLOW, RED, FOOT } = require('../models/drums');
const max = require('../models/max');
const osc = require('../models/osc');
// let wut;
// const wut = "live_set scenes 1";

// wut = 'live_set tracks 1 mixer_device volume';
const _fire = (note) => {
  osc.client.send('int', 144, () => {});
  osc.client.send('int', note, () => {});
  osc.client.send('int', 56, () => {});
  setTimeout(() => {
    osc.client.send('int', 128, () => {});
    osc.client.send('int', note, () => {});
    osc.client.send('int', 64, () => {});
  }, 50);
};

const DRUM_END = 272;
const RED_SWITCH = 334.5;

const DrumCtrl = {
  handle: (drumObj) => {
    max.getTime()
    .then((TIME) => {
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
    });
  }
};

module.exports = DrumCtrl;
