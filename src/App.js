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
import Navbar from './components/Navbar';
import {handleSaveCurrentFileEditorContent} from './components/Editor';
import EditorManager from "./components/EditorManager";
import "./components/LandingPage.css"
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';

const theme = createMuiTheme({
  palette: {
    primary: {
      main: '#1E3D59'
    },
    secondary: {
      main: '#F5F0E1'
    }
  }
});

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
    <MuiThemeProvider theme={theme}>
    <React.Fragment>
      {
        this.state.mounted
          ? (
              this.props.backendModeSignedInStatus !== BACKEND_MODE_SIGNED_IN_STATUS.USER_SIGNED_OUT
                ? <div className="App">
                    <div style={{flex: "0 1 auto"}}>
                      <Navbar />
                    </div>
                      <div style={{flex: "1 1 auto", display: "flex"}}>
                        <div style={{float: "left"}}>
                            <Navigator />
                        </div>
                        <div style={{flexGrow: "100"}}>
                            <EditorManager/>
                        </div>
                      </div>
                    </div>
                : <LandingPage />
            )
          : null
      }
      {/* <div className="NoApp">
        This app doesn't support mobile screen widths.
      </div> */}
    </React.Fragment>
    </MuiThemeProvider>
};

export default connect(
  state => ({
    backendModeSignedInStatus: state.backendModeSignedInStatus,
    currentOpenFileId: state.currentOpenFileId,
    currentOpenFileName: state.currentOpenFileName
  }),
  dispatch => ({
    dispatchSetBackendModeSignedInStatusAction: mode => dispatch(setBackendModeSignedInStatusAction(mode)),
  }),
)(App);
