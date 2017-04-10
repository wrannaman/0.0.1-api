import React, { Component, PropTypes } from 'react';
import io from 'socket.io-client';
import Recharts, { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, RadialBarChart, RadialBar } from 'recharts';
import { Circle } from 'rc-progress';
const styles = require('../styles');

const socket = io("localhost:8888", { transports: ['websocket', 'polling'] }); // eslint-disable-line

const getPath = (x, y, width, height) => {
  return `M${x},${y + height}
          C${x + width / 3},${y + height} ${x + width / 2},${y + height / 3} ${x + width / 2}, ${y}
          C${x + width / 2},${y + height / 3} ${x + 2 * width / 3},${y + height} ${x + width}, ${y + height}
          Z`;
};

const RED = "rgba(254, 48, 48, 0.8)";
const YELLOW = "rgba(243, 255, 2, 0.8)";
const GREEN = "rgba(58, 255, 58, .8)";
const BLUE = "rgba(60, 59, 255, .8)";

const TriangleBar = (props) => {
  let fill = props.fill
  switch (props.name.toLowerCase()) {
    case "red":
      fill = RED;
      break;
    case "yellow":
      fill = YELLOW;
      break;
    case "green":
      fill = GREEN;
      break;
    case "blue":
      fill = BLUE;
      break;
    default:

  }
  const { x, y, width, height } = props;
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
};
const style = {
  top: 0,
  left: 350,
  lineHeight: '24px'
};
export default class Counter extends Component {
  constructor(props) {
    super(props);
    this.initSocketListeners = ::this.initSocketListeners;
    this.state = {
      barData: [
        { name: 'Red', key: 0, total: 52, count: 0, percent: 0, fill: RED },
        { name: 'Yellow', key: 1, total: 205, count: 0, percent: 0, fill: YELLOW },
        { name: 'Blue', key: 2, total: 102, count: 0, percent: 0, fill: BLUE },
        { name: 'Green', key: 3, total: 30, count: 0, percent: 0, fill: GREEN },
      ],
    };
  }
  componentDidMount() {
    this.initSocketListeners();
  }
  initSocketListeners() {
    const that = this;
    socket.on('connect', () => {
      console.error('connected');
    });
    socket.on('totalCounts', (song) => {
      // const barData = that.state.barData;
      // for (const color in song) { // eslint-disable-line
      //   barData[color].total = song[color].notes.length;
      // }
      // that.setState({ barData });
    });
    socket.on('hit', (hit) => {
      const barData = that.state.barData;
      ++barData[hit.hit].count;
      barData[hit.hit].percent = Math.ceil((barData[hit.hit].count / barData[hit.hit].total) * 100);
      that.setState({ barData });
    });
  }
  render() {
    return (
      <div style={styles.counterWrapper}>
        <h1 style={{ fontSize: '150%', textAlign: 'center', paddingTop: 60, marginBottom: 25 }}></h1>
        <BarChart width={900} height={600} data={this.state.barData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }} style={{ margin: '0 auto' }}>
          <XAxis dataKey="name" />
          <YAxis />
          <CartesianGrid strokeDasharray="3 3" />
          <Bar dataKey="count" fill="#f90679" shape={<TriangleBar />} label />
        </BarChart>
        <div>
          <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', minHeight: 200, }}>
            { this.state.barData.map((d, i) => {
              return (
                <div style={{ position: 'relative' }}>
                  <Circle
                    key={i} // eslint-disable-line
                    percent={d.percent > 100 ? 100 : d.percent}
                    strokeWidth="4"
                    strokeColor={d.fill}
                    style={{ width: 100, height: 100, padding: 10 }}
                  />
                <h1 style={{ color: d.fill, position: 'absolute', top: 42, left: 0, width: 120, height: 120, textAlign: 'center', fontSize: '200%' }}> {d.percent > 100 ? 100 : d.percent} </h1>
                </div>
              );
            })}

          </div>
        </div>
      </div>
    );
  }
}
