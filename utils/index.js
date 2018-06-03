const { state, setState } = require('../state')
const { track_name, count_clips_in_track } = require('../controller')
const { max_clips, num_tracks } = require('../config')

/**
 * Returns a random number between min (inclusive) and max (exclusive)
 */
const _getRandomExclusive = (min, max, int = false) => {
  const n = Math.random() * (max - min) + min; // eslint-disable-line
  return int ? Math.round(n) : n;
};
const _assign_socket = (socket, attempts = 0) => {
  try {
    const s = state();
    let which = -1;
    const rand = _getRandomExclusive(0, num_tracks - 1, true);
    // check for random one first, then sequential
    if (!s.track_map[rand].assigned && s.track_map[rand].count > 0) {
      console.log('rand worked');
      s.track_map[rand].assigned = socket.id;
      which = Number(rand);
    } else {
      console.log('rand didnt work');
      // rand didnt work, just do a sequential one
      for (let key in s.track_map) {
        if (!s.track_map[key].assigned && s.track_map[key].count > 0) {
          s.track_map[key].assigned = socket.id
          which = Number(key)
          break;
        }
      }
    }
    socket.assignment = which; // eslint-disable-line
    s.assignments[socket.id] = which;
    setState(s)
  } catch (e) {
    console.log('error is e ', e);
  }
}
module.exports.getRandomExclusive = _getRandomExclusive;
module.exports.sleep = t => new Promise((resolve, reject) => setTimeout(() => resolve(), t))
module.exports.assign_socket = _assign_socket
module.exports.init = async () => {
  let tracks = Array.from(Array(max_clips).keys()).map(i => i);
  const tmp = [];
  const track_map = {};
  for (let i = 0; i < tracks.length; i++) {
    const t = tracks[i];
    const name = await track_name(t);
    const clip_max = Array.from(Array(max_clips).keys()).map(i => i);
    let count = 0;
    let clip_names = [];
    for (let c = 0; c < clip_max.length; c++) {
      const clip_count = await count_clips_in_track(t, c)
      if (clip_count) {
        count++
        clip_names.push(clip_count)
      }
    }
    track_map[i] = { name, count, id: t, names: clip_names };
  }
  setState({ totalTracks: tracks.length, assignments: {}, track_map, tracks, stats: {} })
}
module.exports.addStat = (name, track, clip) => {
  const s = state();
  const stats = s.stats;
  if (!stats[name]) stats[name] = [];
  stats[name].push({ track, clip });
  setState('stats', stats)
};
