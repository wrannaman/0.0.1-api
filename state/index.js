let state = {

};

module.exports.state = () => {
  return Object.assign({}, state); // copy
};
module.exports.setState = (k, v) => {
  if (!v && typeof k === 'object') {
    state = k;
  } else {
    state[k] = v;
  }
};
module.exports.getState = (k) => {
  const s = Object.assign({}, state); // copy
  return s[k];
};
