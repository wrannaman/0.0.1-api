import React, { Component } from 'react';
import io from 'socket.io-client';
import Leap from 'leapjs';

const socket = io("localhost:8888", { transports: ['websocket', 'polling'] }); // eslint-disable-line

const getColor = () => '#'+Math.floor(Math.random()*16777215).toString(16); // eslint-disable-line

const whichGrid = (x, y) => {
  let grid = -1;
  // grid
  if (x < 0.25 && y <= 0.25) grid = 0;
  if (x < 0.25 && y >= 0.25 && y < 0.5) grid = 1;
  if (x < 0.25 && y >= 0.5 && y < 0.75) grid = 2;
  if (x < 0.25 && y >= 0.75) grid = 3;

  if (x > 0.25 && x <= 0.5 && y <= 0.25) grid = 4;
  if (x > 0.25 && x <= 0.5 && y >= 0.25 && y < 0.5) grid = 5;
  if (x > 0.25 && x <= 0.5 && y >= 0.5 && y < 0.75) grid = 6;
  if (x > 0.25 && x <= 0.5 && y >= 0.75) grid = 7;

  if (x > 0.5 && x <= 0.75 && y <= 0.25) grid = 8;
  if (x > 0.5 && x <= 0.75 && y >= 0.25 && y < 0.5) grid = 9;
  if (x > 0.5 && x <= 0.75 && y >= 0.5 && y < 0.75) grid = 10;
  if (x > 0.5 && x <= 0.75 && y >= 0.75) grid = 11;

  if (x > 0.75 && y <= 0.25) grid = 12;
  if (x > 0.75 && y >= 0.25 && y < 0.5) grid = 13;
  if (x > 0.75 && y >= 0.5 && y < 0.75) grid = 14;
  if (x > 0.75 && y >= 0.75) grid = 15;

  return grid;
};

export default class Grid extends Component {
  constructor(props) {
    super(props);
    this.state = {
      width: 1000,
      height: 1000,
      Z: 500,
      Y: 500,
      scale: 4,
    };
    this.example = null;
    this.proof = null;
    this.renderSquares = ::this.renderSquares;
  }
  componentDidMount() {
    socket.on('connect', () => {
      console.warn('point cloud connected');
    });
    socket.on('coords', (coords) => {
      const SCALE = this.state.scale;
      const width = coords.width * SCALE;
      const height = coords.height * SCALE;
      const centerWidth = width / 2;
      const centerHeight = height / 2;

      if (this.state.width !== width && this.state.height !== height && this.state.centerWidth !== centerWidth && this.state.centerHeight !== centerHeight) {
        this.setState({ width, height, centerWidth, centerHeight });
      }
      // see https://developer.leapmotion.com/documentation/javascript/devguide/Leap_Coordinate_Mapping.html
      const Z = ((coords.z * width)); // actually is Z
      const Y = ((coords.y * height));
      this.setState({ Z, Y, gridIndex: whichGrid(coords.z, coords.y) });
    });
  }
  renderSquares() {
    const squares = [];
    let num = 0;
    const width = this.state.width * 0.25;
    const height = this.state.height * 0.25;
    for (let i = 0; i < 4; ++i) { // eslint-disable-line
      const top = i * (0.25 * this.state.width);
      for (let j = 0; j < 4; ++j) { // eslint-disable-line
        const left = j * (0.25 * this.state.height);
        const color = getColor();

        squares.push(
          <div key={`${i}-${j}`} style={{ position: 'absolute', width, height, top, left, border: `1px solid ${color}`, padding: 1, background: this.state.gridIndex === num ? color : '' }}>
            <p style={{ color: this.state.gridIndex === num ? 'black' : color, textAlign: 'center', paddingTop: '48%' }}>{num}</p>
          </div>
        );
        ++num; // eslint-disable-line
      }
    }
    return squares;
  }
  render() {
    return (
      <div style={{ backgroundColor: 'black' }}>
        <h1 style={{ fontSize: '150%', textAlign: 'center', paddingTop: 60, marginBottom: 25 }}> GRID </h1>
        <div style={{ position: 'relative', width: this.state.width, margin: '0 auto' }}>
          <div style={{ position: 'absolute', width: this.state.width, height: this.state.height, backgroundColor: 'black', zIndex: 0 }}>
            {this.renderSquares()}
          </div>
          <div style={{ position: 'absolute', width: 5, height: 5, backgroundColor: 'red', zIndex: 1, top: this.state.Z, left: this.state.Y }} />
        </div>
      </div>
    );
  }
}
