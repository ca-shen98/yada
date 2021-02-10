import "intro.js/introjs.css";
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
import ReactGA from 'react-ga';
import { Steps } from "intro.js-react";

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
    width: window.innerWidth,
    steps: [
      {
        title: "Welcome to Yada!",
        intro: "Hello 👋"
      },
      {
        title: "Definitions 📚",
        intro: "Before we start here are some useful definitions <br>" +
                "<b>Document</b>: A source of truth document in our app <br>" +
                "<b>View</b>: Card View or Text View you can create from a document <br>" + 
                "<b>Block</b>: A piece of content in the document seperated by a space which you can add a tag to"
      },
      {
        title: "Editor 📝",
        element: ".editor",
        intro: "This is the main editor where you can use Markdown Syntax"
      },
      {
        title: "Navigator",
        element: ".SidePane",
        intro: "This is the navigator. Here you can create, update, rename and delete new views and documents"
      },
      {
        title: "Views",
        element: ".fileList-iconButton",
        intro: "Use this menu to create new views, rename and delete documents"
      },
      {
        title: "Tag Menu 🏷",
        element: "#tag_menu_wrapper",
        intro: "This is the tag menu. After selecting a block from the editor you can add tags from here."
      },
      {
        title: "Search Menu 🔍",
        element: "#searchBar",
        intro: "In this search menu you can filter your document by tags. It can understand complex grammmar 🧠. Try (#{tag1} | !#{tag2}) & #{tag3}"
      },
      {
        title: "Finally ✌",
        intro: "Follow the steps in the welcome doc, to make your own blocks, tags, views and much more. You can refer to the Example documents to further see how to use Yada!"
      }

    ],
    stepsEnabled: this.props.startSteps,
    initialStep: 0,
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
    ReactGA.initialize('UA-166709979-1');
    ReactGA.pageview(window.location.pathname + window.location.search); // report page view
    if (this.props.backendModeSignedInStatus !== BACKEND_MODE_SIGNED_IN_STATUS.LOCAL_STORAGE) {
      getUserSignedInStatus().then(backendModeSignedInStatus => {
        this.props.dispatchSetBackendModeSignedInStatusAction(backendModeSignedInStatus);
        this.setState({ mounted: true });
      });
    } else { this.setState({ mounted: true }); }
    console.log("everything mounted");
    console.log(document.getElementById("tag_menu_wrapper"));
  };


  componentDidUpdate = prevProps => {
		console.log(prevProps);
    console.log(this.props.steps);
    console.log(this.props.stepsNavigator);
    console.log(document.getElementsByClassName('fileList-iconButton'));
	};
  onStepsExit = () => {
    this.setState(() => ({ stepsEnabled: false }));
  };

  toggleSteps = () => {
    this.setState(prevState => ({ stepsEnabled: !prevState.stepsEnabled }));
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
                          <Steps
                            enabled={this.props.steps && this.props.stepsNavigator}
                            steps={this.state.steps}
                            initialStep={this.state.initialStep}
                            onExit={this.onStepsExit}
                          />
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
    steps: state.steps,
    stepsNavigator: state.stepsNavigator
  }),
  dispatch => ({
    dispatchSetBackendModeSignedInStatusAction: mode => dispatch(setBackendModeSignedInStatusAction(mode)),
    dispatchSetToastAction: toast => dispatch(setToastAction(toast)),
  }),
)(App);
