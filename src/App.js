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
import MobilePage from "./components/MobilePage";

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

  state = {
    mounted: false,
    width: window.innerWidth
  };

  handleCloseToast = () => {
    this.props.dispatchSetToastAction(TOAST_CLEAR);
  }
  
  handleWindowSizeChange = () => {
    this.setState({ width: window.innerWidth });
  };
  
  componentWillMount() {
    window.addEventListener('resize', this.handleWindowSizeChange);
  }
  
  // make sure to remove the listener
  // when the component is not mounted anymore
  componentWillUnmount() {
    window.removeEventListener('resize', this.handleWindowSizeChange);
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
        (this.state.width <= 500) // check if we can display YADA
            ? <MobilePage/>
            : (this.state.mounted
                ? (
                    this.props.backendModeSignedInStatus !== BACKEND_MODE_SIGNED_IN_STATUS.USER_SIGNED_OUT
                      ? <div className="App">
                          <Navbar/>
                          <div style={{marginTop: 64}}>
                            <Navigator />
                            <EditorManager/>
                          </div>
                          {/*Global Snackbar: used for display toast messages to user*/}
                          <Snackbar open={this.props.toast.open} autoHideDuration={TOAST_DURATION_MS} onClose={this.handleCloseToast}>
                            <MuiAlert onClose={this.handleCloseToast} elevation={6} severity={this.props.toast.severity}>
                              {this.props.toast.message}
                            </MuiAlert>
                          </Snackbar>
                        </div>
                      : <LandingPage />
                  )
                : null)
      }
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
