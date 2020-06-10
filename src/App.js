import React from 'react';
import './App.css';
import Header from './containers/Header';
import Home from './containers/Home';
import Editor from './containers/Editor';
import { HashRouter, Route, Link } from "react-router-dom";

const Edit = () => {
    return (<div className="App">
        <Header/>
        <Editor/>
    </div>);
}

export default () => (<HashRouter basename="/yada">
  <Route exact path="/" component={Home} />
  <Route exact path="/edit" component={Edit} />
</HashRouter>);
