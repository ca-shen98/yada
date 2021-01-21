import './App.css';
import React from 'react';
import {connect} from 'react-redux';
import {BACKEND_MODE_SIGNED_IN_STATUS} from './reducers/BackendModeSignedInStatus';
import LandingPage from './components/LandingPage';
import Navigator from './components/Navigator';
import Editor, {handleSaveCurrentFileEditorContent} from './components/Editor';

class App extends React.Component {
	
  keydownHandler = event => {
    if ((window.navigator.platform.match("Mac") ? event.metaKey : event.ctrlKey) && event.keyCode === 83) {
      event.preventDefault();
      if (this.props.backendModeSignedInStatus !== BACKEND_MODE_SIGNED_IN_STATUS.USER_SIGNED_OUT) {
        handleSaveCurrentFileEditorContent();
      }
    }
  }
	
	componentDidMount = () => { document.addEventListener('keydown',this.keydownHandler); };
	componentWillUnmount = () => { document.removeEventListener('keydown', this.keydownHandler); };
  
  render = () => this.props.backendModeSignedInStatus !== BACKEND_MODE_SIGNED_IN_STATUS.USER_SIGNED_OUT
    ? (
        // <React.Fragment>
        <div className="App">
          <div style={{ position: 'fixed', top: '9px', right: '16px', fontSize: '.75em' }}>
            <span role="img" aria-label="Yet Another Docs App">
              🐇 &nbsp; <b>Y</b>et <b>A</b>nother <b>D</b>ocs <b>A</b>pp
            </span>
          </div>
          <Navigator />
          <Editor />
        </div>
          // <div className="NoApp">
          //   This app doesn't support mobile screen widths.
          // </div>
        // </React.Fragment>
      )
    : (<LandingPage />);
};

export default connect(state => ({ backendModeSignedInStatus: state.backendModeSignedInStatus }))(App);
