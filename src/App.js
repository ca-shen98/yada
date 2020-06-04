import React from 'react';
import './App.css';
import Header from './containers/Header';
import Editor from './containers/Editor.js';
import {
    Hero, CallToAction, Section
} from 'react-landing-page'
import {
    BrowserRouter as Router,
    Route,
} from "react-router-dom";

export default () => (
    <Router>
        {/*LANDING PAGE*/}
        <Route exact path="/">
        <div>
            <Hero
                color="black"
                bg="white"
                backgroundImage="https://source.unsplash.com/npxXWgQ33ZQ/1600x900"
            >
                <Section heading='YADA' subhead='Yet Another Docs App' width={1}>
                    <CallToAction href='/create'>Get Started</CallToAction>
                </Section>
            </Hero>
        </div>
        </Route>
        {/*CREATE / UPDATE / VIEW */}
        <Route exact path="/create">
        <div className="App">
              <Header/>
              <Editor/>
        </div>
        </Route>
        <footer>&copy; 2020 FYDP-SAAC</footer>
    </Router>
);
