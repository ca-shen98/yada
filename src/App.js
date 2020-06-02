import React from 'react';
import './App.css';
import Header from './containers/Header';
import Editor from './containers/Editor.js';

export default () => (
  <div>
    <div className="App">
      <Header/>
      <Editor/>
    </div>
    <footer>&copy; 2020 FYDP-SAAC</footer>
  </div>
);
