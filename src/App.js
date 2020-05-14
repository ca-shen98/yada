import React from 'react';
import './App.css';
import Header from './containers/Header';
import Editor from './containers/Editor.js';

export default () => (
  <div className="App">
    <Header/>
    <Editor/>
  </div>
);
