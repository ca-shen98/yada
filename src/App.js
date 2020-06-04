import React from 'react';
import './App.css';
import Header from './containers/Header';
import Editor from './containers/Editor.js';
import {
    Hero, CallToAction, Section
} from 'react-landing-page'
import { HashRouter, Route, Link } from "react-router-dom";

import GoogleLogin from "react-google-login";

const Home = () => {
    return (<div>
        <Hero
            color="black"
            bg="white"
            backgroundImage="https://source.unsplash.com/npxXWgQ33ZQ/1600x900"
        >
            <Section heading='YADA' subhead='Yet Another Docs App' width={1}>
                <CallToAction href='/#/edit'>Get Started</CallToAction>
            </Section>
        </Hero>
    </div>);
}

const Edit = () => {
    return (<div className="App">
        <Header/>
        <Editor/>
    </div>);
}

export default () => (
    <HashRouter  basename="/">
        <div>
            {/*LANDING PAGE*/}
            <Route exact path="/" component={Home} />
            {/*CREATE / UPDATE / VIEW */}
            <Route path="/edit" component={Edit} />
        </div>
        <footer>&copy; 2020 FYDP-SAAC</footer>
    </HashRouter>
);
