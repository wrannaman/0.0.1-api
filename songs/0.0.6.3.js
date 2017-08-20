const genNote = require('./util').genNote;
const song = {
  3: { // GREEN
    index: 0,
    notes: [
      genNote(0, 272, 83),
      genNote(272.1, 400, 78),
    ]
  },
  2: { // BLUE
    index: 0,
    notes: [
      genNote(144, 204, 77, 100),
      genNote(204, 272, 82),
      genNote(272.1, 400, 77),
    ]
  },
  1: { // YELLOW
    index: 0,
    notes: [
      genNote(144, 240, 78, 100), // snare
      genNote(240, 272, 81), // snare
      genNote(272, 319, 75), // key
      genNote(319, 400, 79), // snare 2
    ]
  },
  0: { // RED
    index: 0,
    notes: [
      genNote(170, 207, 76, 90 ),
      genNote(208, 272, 80),
      genNote(272, 320, 73),
      genNote(320, 400, 72), // drum shuffle
      genNote(338.1, 400, 73),
    ]
  },
  start: 159
};
module.exports = song;
