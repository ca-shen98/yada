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

export default () => (
    <HashRouter  basename="/yada">
        <div>
            {/*LANDING PAGE*/}
            <Route exact path="/" component={Home} />
            {/*CREATE / UPDATE / VIEW */}
            <Route exact path="/edit" component={Edit} />
        </div>
        <footer>&copy; 2020 FYDP-SAAC</footer>
    </HashRouter>
);
