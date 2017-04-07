import React, { Component, PropTypes } from 'react';
import io from 'socket.io-client';
import Recharts, {BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend} from 'recharts';

const styles = require('../styles');
const socket = io("localhost:8888", { transports: ['websocket', 'polling'] }); // eslint-disable-line

const getPath = (x, y, width, height) => {
  return `M${x},${y + height}
          C${x + width / 3},${y + height} ${x + width / 2},${y + height / 3} ${x + width / 2}, ${y}
          C${x + width / 2},${y + height / 3} ${x + 2 * width / 3},${y + height} ${x + width}, ${y + height}
          Z`;
};

const TriangleBar = (props) => {
  const { fill, x, y, width, height } = props;
  return <path d={getPath(x, y, width, height)} stroke="none" fill={fill} />;
};

TriangleBar.propTypes = {
  fill: PropTypes.string,
  x: PropTypes.number,
  y: PropTypes.number,
  width: PropTypes.number,
  height: PropTypes.number,
};

const keys = {
  FOOT: 4,
  GREEN: 3,
  BLUE: 2,
  YELLOW: 1,
  RED: 0,
  0: "RED",
  1: "YELLOW",
  2: "BLUE",
  3: "GREEN",
}

export default class Counter extends Component {
  constructor(props) {
    super(props);
    this.initSocketListeners = ::this.initSocketListeners;
    this.state = {
      data: [
        { name: 'Red', key: 0, total: 0, count: 0 },
        { name: 'Yellow', key: 1, total: 0, count: 0 },
        { name: 'Blue', key: 2, total: 0, count: 0 },
        { name: 'Green', key: 3, total: 0, count: 0 },
      ]
    };
  }
  componentDidMount(){
    this.initSocketListeners()
  }
  initSocketListeners() {
    const that = this;
    socket.on('connect', () => {
      console.log('connected');
    });
    socket.on('totalCounts', (song) => {
      const data = that.state.data;
      for (const color in song) { // eslint-disable-line
        data[color].total = song[color].notes.length;
      }
      that.setState({ data });
    });
    socket.on('hit', (hit) => {
      const data = that.state.data;
      ++data[hit.hit].count;
      that.setState({ data });
    })
  }
  render() {
    return (
      <div style={styles.counterWrapper}>
        <h1>Counter</h1>
        <BarChart width={600} height={300} data={this.state.data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }} >
          <XAxis dataKey="name" />
          <YAxis />
          <CartesianGrid strokeDasharray="3 3" />
          <Bar dataKey="count" fill="#8884d8" shape={<TriangleBar />} label />
        </BarChart>
      </div>
    );
  }
}
