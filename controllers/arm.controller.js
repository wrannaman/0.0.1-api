/*
  Arm controller looks at the song and arms the correc track at the correct time.
  It will also update the state of the current armed track based on polling MAX_TIME

*/
const song = require(`../songs/${global.activeSong}`); // eslint-disable-line
const { max } = require('../models/max');

let interval = [];
const POLLING_TIME = 100;

const _arm = (value = true) => {
  // if (song.arm[song.armIndex].armed && value) return console.log(`${song.armIndex} already armed => ${global.MAX_TIME}`);
  max.set({
    path: song.arm[song.armIndex].path,
    property: 'arm',
    value
  });
  song.arm[song.armIndex].armed = value;
};

module.exports = () => {
  if (interval.length) {
    interval.map(i => clearInterval(i));
    interval = [];
  }
  const int = setInterval(() => {
    console.log('global.MAX_TIME ', global.MAX_TIME);
    // song.arm[song.armIndex].armed = !song.arm[song.armIndex].armed;
    // _arm(song.arm[song.armIndex].armed);
    // // console.log('global.MAX_TIME ', global.MAX_TIME);
    // // console.log('song arm ', song.arm[song.armIndex]);
    // console.log('song.end ', song.arm[song.armIndex].end, ' max ', global.MAX_TIME);
    // console.log('song arm ', song.arm);
    // console.log('idx ', song.armIndex);
    if (global.MAX_TIME > song.arm[song.armIndex].end) {
      console.log('============================================iterate==========================================');
      // disarm first
      _arm(false)
      // go to next track
      song.armIndex += 1;
      // arm the next track
      _arm()
    } else {
      // console.log('initial');
      _arm()
    }
  }, POLLING_TIME);
  interval.push(int);
};
