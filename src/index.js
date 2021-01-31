import React from 'react';
import {render} from 'react-dom';
import {Provider} from 'react-redux';
import './index.css';
import App from './App';
import store from './store';
import * as serviceWorker from './serviceWorker';

render(
  <React.StrictMode>
    <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap" />
    <link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons" />
    <link rel="preconnect" href="https://fonts.gstatic.com" />
    <link href="https://fonts.googleapis.com/css2?family=Bungee&display=swap" rel="stylesheet" /> 
    <link href="https://fonts.googleapis.com/css2?family=Signika:wght@300&display=swap" rel="stylesheet"></link>
    <Provider store={store}>
      <App/>
    </Provider>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
