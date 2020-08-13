import React from 'react';
import './App.css';
import Navigator from './containers/Navigator';
import Editor from './containers/Editor';

export default () => (
  <div className="App">
    <Navigator />
    <Editor />
  </div>
);
