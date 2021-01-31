import React from 'react';
import {connect} from 'react-redux';
import {GoogleLogin} from 'react-google-login';
import axios from 'axios';
import Cookies from 'js-cookie'
import {
  BACKEND_MODE_SIGNED_IN_STATUS,
  SERVER_BASE_URL,
  ACCESS_TOKEN_COOKIE_KEY,
  setBackendModeSignedInStatusAction,
} from '../reducers/BackendModeSignedInStatus';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import ReactTypingEffect from 'react-typing-effect';

const CLIENT_ID = '709358329925-gic89ini15sgaenfrta1gshej1ik72jg.apps.googleusercontent.com';

class LandingPage extends React.Component {

  handleLoginSuccess = async ({ profileObj: { name, email }, tokenObj: { id_token: token, expiresAt: expiry } }) => {
    let response = null;
    try {
      response = await axios.post(
        SERVER_BASE_URL + 'register_user',
        {
          method: 'POST',
          body: JSON.stringify({ name, email, token }),
          headers: { 'Content-Type': 'application/json', 'Set-Cookie': `token=${token}` },
        },
        { withCredentials: true },
      );
    } catch(e) { console.log(e); }
    if (response && response.status === 201) {
      Cookies.set(ACCESS_TOKEN_COOKIE_KEY, token, { expires: new Date(expiry) });
      this.props.dispatchSetBackendModeSignedInStatusAction(BACKEND_MODE_SIGNED_IN_STATUS.USER_SIGNED_IN);
    }
  };

  render = () =>
    // <Hero
    //   color="black"
    //   bg="white"
    //   backgroundImage="https://source.unsplash.com/npxXWgQ33ZQ/1600x900">
    //   <Section heading='YADA' subhead='Yet Another Docs App' width={1}>
    //     <GoogleLogin
    //       clientId={CLIENT_ID}
    //       buttonText="Sign in with Google to get started"
    //       onSuccess={response => { this.handleLoginSuccess(response); }}
    //       onFailure={response => { console.log(response); }}
    //       cookiePolicy="single_host_origin"
    //       responseType="code,token"
    //     />
    //   </Section>
    //   <button
    //     onClick={() => {
    //       this.props.dispatchSetBackendModeSignedInStatusAction(BACKEND_MODE_SIGNED_IN_STATUS.LOCAL_STORAGE);
    //     }}>
    //     Use local storage
    //   </button>
    // </Hero>;
    <div style={{display:"flex", flexFlow: "column", height: "100vh", overflow: "hidden"}}>
      <div className={"landing-root"} style={{flexGrow: "0 1 auto"}}>
      <AppBar position="static" class="custom-navbar">
        <Toolbar>
          <img className={"menuButton"} src={require('../images/logo.png')} style={{width: "50px", marginRight: "1%"}}/>
          {/* <Typography variant="h5" className={"title"} style={{fontFamily:"Bungee", color:"#F5F0E1"}}>
            YADA
          </Typography> */}
        </Toolbar>
      </AppBar>

    </div>
    <div style={{backgroundColor: "#F5F0E1", flex: "1 1 auto"}}>
    <Grid container spacing={3} alignItems="center">
        <Grid item xs={6} alignItems="center" style={{marginTop: "10%"}}>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={3}>
              <img src={require('../images/darkLogo.png')} style={{width: "90%", marginLeft: "20%"}}/>
            </Grid>
            <Grid item xs={9}>
              <Typography variant="h1" className={"title"} style={{fontFamily:"Bungee", color:"#1E3D59"}}>
              YADA
              <ReactTypingEffect
                text = ""
                style={{fontFamily:"Signika"}}
                speed = {10000}
              />
              </Typography>
              <Typography variant="h3" className={"title"} style={{fontFamily:"Signika", color:"#1E3D59"}}>
               Yet Another Docs App
              </Typography>
             </Grid>
          </Grid>
          <br />
          <div style={{marginLeft: "8%"}}>
              <GoogleLogin
                  clientId={CLIENT_ID}
                  buttonText="Sign in With Google"
                  onSuccess={response => { this.handleLoginSuccess(response); }}
                  onFailure={response => { console.log(response); }}
                  cookiePolicy="single_host_origin"
                  responseType="code,token"
                  style={{float: "left"}}
                />
                <Button 
                  variant="outlined"
                  style={{"height" : "250%", marginLeft: "3%"}}
                  onClick={() => {
                    this.props.dispatchSetBackendModeSignedInStatusAction(BACKEND_MODE_SIGNED_IN_STATUS.LOCAL_STORAGE);
                  }}>
                  Use local storage
                </Button>
          </div>
        </Grid>
        <Grid item xs={6}>
           <img src={require('../images/graphic.png')} style={{width: "70%", marginLeft: "10%", marginTop: "10%"}}/>
        </Grid>
    </Grid>
    </div>
  </div>
}

export default connect(
  state => ({ backendModeSignedInStatus: state.backendModeSignedInStatus }),
  dispatch => ({
    dispatchSetBackendModeSignedInStatusAction: mode => dispatch(setBackendModeSignedInStatusAction(mode)),
  }),
)(LandingPage);
