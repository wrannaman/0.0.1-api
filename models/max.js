const Max4Node = require('max4node');
const max = new Max4Node();
max.bind();
max.observe({
  path: 'live_set',
  property: 'current_song_time'
})
.on('value', (t) => {
  // console.log('t is ', t);
  global.MAX_TIME = t;
});



max.get({
  path: 'live_set master_track mixer_device volume',
  property: 'value'
})
.once('value', function(val) {
  console.log('Master track volume: ' + val);
});


/* Check */
setTimeout(() => {
  console.error('MAX_TIME', global.MAX_TIME);
}, 1000);

const getTime = () => {
  max.get({
    path: "live_set",
    property: 'current_song_time'
  })
  .once('value', (t) => {
    global.MAX_TIME = t;
  });
};

setInterval(() => {
  getTime();
}, 500);

module.exports = { max, getTime };
