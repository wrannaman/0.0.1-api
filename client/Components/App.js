import React, { Component } from 'react';
import { Switch, Route } from 'react-router-dom';

import Counter from './Counter';
import Grid from './Grid';
import Home from './Home';
import PointCloud from './PointCloud';

export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  render() {
    return (
      <main>
        <Switch>
          <Route exact path="/" component={Home} />
          <Route path="/grid" component={Grid} />
          <Route path="/counter" component={Counter} />
          <Route path="/point-cloud" component={PointCloud} />
        </Switch>
      </main>
    );
  }
}
