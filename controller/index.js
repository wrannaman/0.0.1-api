/* eslint-disable */
const { max } = require('../models/max');
const { state, setState } = require('../state')

const STOP = 'STOP'

const stop_all_clips = (track) => max.call({ path: `live_set tracks ${track}`, method: 'stop_all_clips' });
const count_clips_in_track = (track, clip) => max.promise().get({ path: `live_set tracks ${track} clip_slots ${clip} clip`, property: 'name' });
const fire_clip = (track, clip) => max.call({ path: `live_set tracks ${track} clip_slots ${clip} clip`, method: 'fire' });
const track_name = track => max.promise().get({ path: `live_set tracks ${track}`, property: 'name' })
const fire = (track, clip) => {
  const s = state()
  if (clip === STOP) return stop_all_clips(track)
  fire_clip(track, clip)
  // Delicious fires only once
  if (track === 5) {
    setTimeout(( ) => {
      stop_all_clips(track);
    }, 2000);
  }
  // if (s.track_map[track].name === 'Delicious') {
  //   setTimeout(( ) => {
  //     stop_all_clips(track)
  //   }, 2000)
  // }
}
module.exports.fire = fire
module.exports.track_name = track_name
module.exports.fire_clip = fire_clip
module.exports.count_clips_in_track = count_clips_in_track
module.exports.stop_all_clips = stop_all_clips
