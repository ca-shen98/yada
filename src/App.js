import './App.css';
import React from 'react';
import {connect} from 'react-redux';
import {
  BACKEND_MODE_SIGNED_IN_STATUS,
  getUserSignedInStatus,
  setBackendModeSignedInStatusAction,
} from './reducers/BackendModeSignedInStatus';
import LandingPage from './components/LandingPage';
import Navigator from './components/Navigator';
import Navbar from './components/Navbar';
import EditorManager from "./components/EditorManager";
import "./components/LandingPage.css"
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert from '@material-ui/lab/Alert';
import {setToastAction, TOAST_CLEAR, TOAST_DURATION_MS} from "./reducers/Toast";

export const THEME = createMuiTheme({
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

  handleCloseToast = () => {
    this.props.dispatchSetToastAction(TOAST_CLEAR);
  }
  
  componentDidMount = () => {
    if (this.props.backendModeSignedInStatus !== BACKEND_MODE_SIGNED_IN_STATUS.LOCAL_STORAGE) {
      getUserSignedInStatus().then(backendModeSignedInStatus => {
        this.props.dispatchSetBackendModeSignedInStatusAction(backendModeSignedInStatus);
        this.setState({ mounted: true });
      });
    } else { this.setState({ mounted: true }); }
  };
  
  render = () =>
    <MuiThemeProvider theme={THEME}>
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
                        {/*Global Snackbar: used for display toast messages to user*/}
                        <Snackbar open={this.props.toast.open} autoHideDuration={TOAST_DURATION_MS} onClose={this.handleCloseToast}>
                          <MuiAlert onClose={this.handleCloseToast} elevation={6} severity={this.props.toast.severity}>
                            {this.props.toast.message}
                          </MuiAlert>
                        </Snackbar>
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
    currentOpenFileName: state.currentOpenFileName,
    toast: state.toast,
  }),
  dispatch => ({
    dispatchSetBackendModeSignedInStatusAction: mode => dispatch(setBackendModeSignedInStatusAction(mode)),
    dispatchSetToastAction: toast => dispatch(setToastAction(toast)),
  }),
)(App);
