const drum = require('./drum.controller');
const leap = require('./leap.controller');
const arm = require('./arm.controller');

/* Arm controller looks at the song and arms the correc track at the correct time */
arm();

module.exports = {
  drum,
  leap,
};
