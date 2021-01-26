import './App.css';
import React from 'react';
import {connect} from 'react-redux';
import {checkSourceFileId} from './util/FileIdAndTypeUtils';
import {
  BACKEND_MODE_SIGNED_IN_STATUS,
  getUserSignedInStatus,
  setBackendModeSignedInStatusAction,
} from './reducers/BackendModeSignedInStatus';
import LandingPage from './components/LandingPage';
import Navigator from './components/Navigator';
import {handleSaveCurrentFileEditorContent} from './components/Editor';
import SourceEditorWithTagFilters from './components/SourceEditorWithTagFiltersInput';

class App extends React.Component {

  state = { mounted: false };

  keydownHandler = event => {
    if ((window.navigator.platform.match("Mac") ? event.metaKey : event.ctrlKey) && event.keyCode === 83) {
      event.preventDefault();
      if (this.props.backendModeSignedInStatus !== BACKEND_MODE_SIGNED_IN_STATUS.USER_SIGNED_OUT) {
        if (checkSourceFileId(this.props.currentOpenFileId)) { handleSaveCurrentFileEditorContent(); }
      }
    }
  }

  componentWillUnmount = () => { document.removeEventListener('keydown', this.keydownHandler); };

  componentDidMount = () => {
    document.addEventListener('keydown',this.keydownHandler);
    if (this.props.backendModeSignedInStatus !== BACKEND_MODE_SIGNED_IN_STATUS.LOCAL_STORAGE) {
      getUserSignedInStatus().then(backendModeSignedInStatus => {
        this.props.dispatchSetBackendModeSignedInStatusAction(backendModeSignedInStatus);
        this.setState({ mounted: true });
      });
    } else { this.setState({ mounted: true }); }
  };
  
  render = () =>
    <React.Fragment>
      {
        this.state.mounted
          ? (
              this.props.backendModeSignedInStatus !== BACKEND_MODE_SIGNED_IN_STATUS.USER_SIGNED_OUT
                ? <div className="App">
                    <div style={{ position: 'absolute', top: '9px', right: '16px', fontSize: '.75em' }}>
                      <span role="img" aria-label="Yet Another Docs App">
                        🐇 &nbsp; <b>Y</b>et <b>A</b>nother <b>D</b>ocs <b>A</b>pp
                      </span>
                    </div>
                    <Navigator />
                    <SourceEditorWithTagFilters />
                  </div>
                : <LandingPage />
            )
          : null
      }
      {/* <div className="NoApp">
        This app doesn't support mobile screen widths.
      </div> */}
    </React.Fragment>
};

export default connect(
  state => ({
    backendModeSignedInStatus: state.backendModeSignedInStatus,
    currentOpenFileId: state.currentOpenFileId,
  }),
  dispatch => ({
    dispatchSetBackendModeSignedInStatusAction: mode => dispatch(setBackendModeSignedInStatusAction(mode)),
  }),
)(App);
