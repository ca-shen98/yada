import React from "react";
import { connect } from "react-redux";
import { GoogleLogin } from "react-google-login";
import axios from "axios";
import Cookies from "js-cookie";
import {
  BACKEND_MODE_SIGNED_IN_STATUS,
  SERVER_BASE_URL,
  ACCESS_TOKEN_COOKIE_KEY,
  setBackendModeSignedInStatusAction,
} from "../reducers/BackendModeSignedInStatus";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import Grid from "@material-ui/core/Grid";
import ReactTypingEffect from "react-typing-effect";
import { Hidden } from "@material-ui/core";
import { setNewUserAction } from "../reducers/Steps";

const CLIENT_ID =
  "709358329925-gic89ini15sgaenfrta1gshej1ik72jg.apps.googleusercontent.com";

class LandingPage extends React.Component {
  handleLoginSuccess = async ({
    profileObj: { name, email },
    tokenObj: { id_token: token, expires_at: expiry },
  }) => {
    let response = null;
    try {
      response = await axios.post(
        SERVER_BASE_URL + "register_user",
        {
          method: "POST",
          body: JSON.stringify({ name, email, token }),
          headers: {
            "Content-Type": "application/json",
            "Set-Cookie": `token=${token}`,
          },
        },
        { withCredentials: true }
      );
    } catch (e) {
      console.log(e);
    }
    if (response && response.status === 201) {
      this.props.dispatchNewUserAction(response.data.is_new);
      Cookies.set(ACCESS_TOKEN_COOKIE_KEY, token, {
        expires: new Date(expiry),
      });
      this.props.dispatchSetBackendModeSignedInStatusAction(
        BACKEND_MODE_SIGNED_IN_STATUS.USER_SIGNED_IN
      );
    }
  };

  render = () => (
    <div
      style={{
        display: "flex",
        flexFlow: "column",
        height: "100vh",
        overflow: "hidden",
      }}
    >
      <AppBar position="static" class="custom-navbar">
        <Toolbar>
          <img
            className={"menuButton"}
            src={require("../images/logo.png")}
            style={{ width: "50px", marginRight: "1%" }}
            alt={"MENU"}
          />
        </Toolbar>
      </AppBar>
      <div
        style={{
          backgroundColor: "#F5F0E1",
          flex: "1 1 auto",
          display: "flex",
        }}
      >
        <Grid container alignItems="center">
          <Hidden smDown>
            <Grid item md={1} />
          </Hidden>
          <Grid item sm={12} md={5} alignItems="center">
            <Grid container spacing={3} alignItems="center">
              <Grid item xs={3}>
                <img
                  src={require("../images/darkLogo.png")}
                  style={{ width: "90%", marginLeft: "20%" }}
                  alt={"YADA"}
                />
              </Grid>
              <Grid item xs={9}>
                <Typography
                  variant="h1"
                  className={"title"}
                  style={{ fontFamily: "Bungee", color: "#1E3D59" }}
                >
                  YADA
                  <ReactTypingEffect
                    text=""
                    style={{ fontFamily: "Signika" }}
                    speed={10000}
                  />
                </Typography>
                <Typography
                  variant="h3"
                  className={"title"}
                  style={{ fontFamily: "Signika", color: "#1E3D59" }}
                >
                  Yet Another Docs App
                </Typography>
              </Grid>
            </Grid>
            <br />
            <div align="center">
              <GoogleLogin
                clientId={CLIENT_ID}
                buttonText="Sign in with Google"
                onSuccess={(response) => {
                  this.handleLoginSuccess(response);
                }}
                onFailure={(response) => {
                  console.log(response);
                }}
                cookiePolicy="single_host_origin"
                responseType="code,token"
                style={{ float: "left" }}
                accessType="offline"
              />
            </div>
          </Grid>
          <Hidden mdUp>
            <Grid item sm={3} />
          </Hidden>
          <Hidden smDown>
            <Grid item md={1} />
          </Hidden>
          <Grid item sm={6} md={4}>
            <img
              src={require("../images/graphic.png")}
              style={{ width: "100%" }}
              alt={"Document Graphic"}
            />
          </Grid>
          <Hidden smDown>
            <Grid item md={1} />
          </Hidden>
          <Hidden mdUp>
            <Grid item sm={3} />
          </Hidden>
        </Grid>
      </div>
    </div>
  );
}

export default connect(
  (state) => ({ backendModeSignedInStatus: state.backendModeSignedInStatus }),
  (dispatch) => ({
    dispatchSetBackendModeSignedInStatusAction: (mode) =>
      dispatch(setBackendModeSignedInStatusAction(mode)),
    dispatchNewUserAction: (newUser) => dispatch(setNewUserAction(newUser)),
  })
)(LandingPage);
