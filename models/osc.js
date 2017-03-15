const osc = require('node-osc');
const client = new osc.Client('127.0.0.1', 7005);
const server = new osc.Server(7003, '0.0.0.0');
server.on("message", (msg, rinfo) => { // eslint-disable-line
  // console.log("TUIO message:", msg);
});

module.exports = {
  client,
  server,
};
