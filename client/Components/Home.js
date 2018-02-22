import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div>
      <h1 style={{ fontSize: '150%', textAlign: 'center', paddingTop: 60, marginBottom: 25 }}> HOME </h1>
      <ul>
        <li><Link to='/counter'>Counter</Link></li>
        <li><Link to='/grid'>Grid</Link></li>
        <li><Link to='/point-cloud'>Point Cloud</Link></li>
      </ul>
    </div>
  );
};
export default Home;
