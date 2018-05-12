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
