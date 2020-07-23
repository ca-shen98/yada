import React from 'react';
import { HashRouter, Route } from "react-router-dom";
import './App.css';
import Home from './containers/Home';
import Navigator from "./containers/Navigator";
import Editor from './containers/Editor';

const Edit = () => (
  <div className="App">
    <Navigator />
    <Editor />
  </div>
);

export default () => (<HashRouter basename="/yada">
  <Route exact path="/" component={Home} />
  <Route exact path="/edit" component={Edit} />
</HashRouter>);
