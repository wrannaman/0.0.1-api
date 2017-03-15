const max = require('../models/max');
const normalize = require('normalize-to-range');

const LeapCtrl = {
  handle: (position) => {
    const normalized = normalize([0, position.position, 600], 20, 135);
    // position raw is 40 to 500;
    // max parameter is 20 to 135;
    const wut = "live_set tracks 5 devices 4 parameters 5";
    max.max.set({
      path: wut,
      property: 'value',
      value: normalized[1]
    });
  }
};

module.exports = LeapCtrl;
