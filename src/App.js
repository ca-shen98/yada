import React from 'react';
import './App.css';
import Navigator from './components/Navigator';
import Editor from './components/Editor';

export default () =>
  <React.Fragment>
    <div className="App">
      <div style={{ position: 'fixed', top: '9px', right: '16px', fontSize: '.75em' }}>
        <span role="img" aria-label="Yet Another Docs App">
          🐇 &nbsp; <b>Y</b>et <b>A</b>nother <b>D</b>ocs <b>A</b>pp
        </span>
      </div>
      <Navigator />
      <Editor />
    </div>
    <div className="NoApp">
      This app doesn't support mobile screen widths.
    </div>
  </React.Fragment>;
