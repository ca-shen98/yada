import React from 'react';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import Home from './containers/Home';
import Navigator from "./containers/Navigator";
import Editor from './containers/Editor';
import { HashRouter, Route } from "react-router-dom";
import CardDeck from "./containers/CardDeck";

const Edit = () => (
  <div className="App">
    <Navigator />
    <Editor />
  </div>
);

const CardView = () => {
    return (<div className="App">
        <CardDeck/>
    </div>);
}

export default () => (<HashRouter basename="/yada">
  <Route exact path="/" component={Home} />
  <Route exact path="/edit" component={Edit} />
  <Route exact path="/cards" component={CardView} />
</HashRouter>);
