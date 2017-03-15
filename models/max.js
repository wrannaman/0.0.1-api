const Max4Node = require('max4node');

const max = new Max4Node();
max.bind();
const getTime = () => {
  return new Promise((resolve) => {
    max.get({
      path: "live_set",
      property: 'current_song_time'
    })
    .once('value', (val) => {
      return resolve(val);
    });
  });
};
module.exports = { max, getTime };
