const max = require('../models/max');
const normalize = require('normalize-to-range');

const LeapCtrl = {
  handle: (d) => {
    let n = 135;
    if (d.device === "leap") n = normalize([0, d.position, 600], 20, 135);
    if (d.device === "mobile") n = normalize([0, d.position, 100], 20, 135);
    // position raw is 40 to 500;
    // max parameter is 20 to 135;
    const wut = "live_set tracks 6 devices 4 parameters 5";
    max.max.set({
      path: wut,
      property: 'value',
      value: n[1]
    });
  }
};

module.exports = LeapCtrl;
