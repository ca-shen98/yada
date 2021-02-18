import React from "react";
import { Hidden } from "@material-ui/core";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import ReactTypingEffect from "react-typing-effect";
import { GoogleLogin } from "react-google-login";
import axios from "axios";
import {
  BACKEND_MODE_SIGNED_IN_STATUS,
  SERVER_BASE_URL,
  setAccessToken,
  setBackendModeSignedInStatusAction,
} from "../../reducers/BackendModeSignedInStatus";
import { connect } from "react-redux";
import { setNewUserAction } from "../../reducers/Steps";
import Wave from "react-wavify";
import { setToastAction, TOAST_SEVERITY } from "../../reducers/Toast";

const CLIENT_ID =
  "709358329925-gic89ini15sgaenfrta1gshej1ik72jg.apps.googleusercontent.com";

class LoginPage extends React.Component {
  state = {
    userSignInLoading: false,
  };

  handleLoginSuccess = async ({
    profileObj: { name, email },
    tokenObj: { id_token: token, expires_at: expiry },
  }) => {
    let response = null;
    this.setState({ userSignInLoading: true });
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
      console.error(e);
    }
    this.setState({ userSignInLoading: false });
    if (response && response.status === 201) {
      this.props.dispatchNewUserAction(response.data.is_new);
      setAccessToken(token, expiry);
      this.props.dispatchSetBackendModeSignedInStatusAction(
        BACKEND_MODE_SIGNED_IN_STATUS.USER_SIGNED_IN
      );
    }
  };

  render = () => {
    if (this.state.userSignInLoading) {
      return (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            width: "100%",
            alignItems: "center",
          }}
        >
          <h2
            style={{
              width: "100%",
              textAlign: "center",
            }}
          >
            <ReactTypingEffect
              text="Getting things ready for you..."
              style={{ fontFamily: "Signika" }}
              speed={15}
              typingDelay={50}
              eraseSpeed={15}
            />
          </h2>
        </div>
      );
    }
    return (
      <div className="foreground" style={{ position: "relative" }}>
        <section className="home center foreground">
          <Grid container>
            <Grid item xs={1} />
            <Grid container xs={10} alignItems="center">
              <Grid item sm={12} md={8} alignItems="center">
                <Grid container spacing={3} alignItems="center">
                  <Grid item xs={3}>
                    <img
                      src={require("../../images/darkLogo.png")}
                      style={{ width: "90%" }}
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
                      console.error(response);
                      this.props.dispatchSetToastAction({
                        message: "Sorry! Yada requires cookies to be enabled.",
                        severity: TOAST_SEVERITY.ERROR,
                        open: true,
                      });
                    }}
                    cookiePolicy="single_host_origin"
                    responseType="code,token"
                    style={{ float: "left" }}
                  />
                </div>
              </Grid>
              <Hidden smDown>
                <Grid item md={4}>
                  <img
                    src={require("../../images/graphic.png")}
                    style={{ width: "100%" }}
                    alt={"Document Graphic"}
                  />
                </Grid>
              </Hidden>
            </Grid>
            <Grid item xs={1} />
            <Grid
              item
              xs={12}
              style={{ position: "absolute", width: "100%", bottom: 0 }}
            >
              <Wave
                fill="#FAF8F2"
                paused={false}
                options={{
                  height: 20,
                  amplitude: 75,
                  speed: 0.1,
                  points: 2,
                }}
              />
            </Grid>
          </Grid>
        </section>
        <div className="light-bg">
          {/*Slogan*/}
          <section className="explanation center foreground bottom-padding">
            <Grid container alignItems="center">
              <Grid item xs={1} />
              <Grid container alignItems="center" xs={10} spacing={3}>
                <Grid item md={4}>
                  <h1 className="landing-title-font">
                    Never rewrite anything ever again
                  </h1>
                  <p className="landing-paragraph-font">
                    Yada is an all-in-one solution that allows you to
                    brainstorm, edit, and present your ideas. Start by writing
                    your document and choose how to present your content with{" "}
                    <em>views</em>. Iterate on the source content or the
                    structure of the views in any order and at any time.
                    Everything stays up to date so you{" "}
                    <b>never have to rewrite anything again</b>.
                  </p>
                </Grid>
                <Grid item md={8}>
                  <img
                    className={"intro-gif"}
                    src={require("../../media/gifs/introGraphic.gif")}
                    alt="Source Content"
                  />
                </Grid>
              </Grid>
              <Grid item xs={1} />
            </Grid>
          </section>

          {/*Showing Views*/}
          <section className="explanation center foreground bottom-padding">
            <Grid container alignItems="center">
              <Grid item xs={1} />
              <Grid container alignItems="center" xs={10} spacing={3}>
                <Grid item md={5}>
                  <h1 className="title-padding landing-title-font">
                    Document Creation
                  </h1>
                  <img
                    className={"gif"}
                    src={require("../../media/images/showing_views_pre.png")}
                    alt="Source Content"
                  />
                </Grid>
                <Hidden smDown>
                  <Grid item md={2} className={"arrow-holder"}>
                    <img
                      className={"arrow"}
                      src={require("../../media/images/arrow.png")}
                      alt="right arrow"
                    />
                  </Grid>
                </Hidden>
                <Hidden mdUp>
                  <Grid item xs={12} className={"arrow-holder"}>
                    <img
                      className={"down_arrow"}
                      src={require("../../media/images/arrow_down.png")}
                      alt="right arrow"
                    />
                  </Grid>
                </Hidden>
                <Grid item md={5}>
                  <h1 className="title-padding landing-title-font">
                    Dynamic Presentation
                  </h1>
                  <img
                    className={"gif"}
                    src={require("../../media/gifs/showing_views_post_final.gif")}
                    alt=""
                  />
                </Grid>
              </Grid>
              <Grid item xs={1} />
            </Grid>
          </section>
          {/*Change Propagation*/}
          <section className="explanation center foreground small-bottom-padding">
            <Grid container alignItems="center">
              <Grid item xs={1} />
              <Grid container alignItems="center" xs={10} spacing={10}>
                <Grid item md={8} className="gif-holder">
                  <img
                    className={"gif"}
                    src={require("../../media/gifs/change_propagation_final.gif")}
                    alt=""
                  />
                </Grid>
                <Grid item md={4}>
                  <h1 className="landing-title-font">
                    Changes to your content appear in your presentations
                  </h1>
                  <p className="landing-paragraph-font">
                    Update the source material and various views in a natural
                    manner. Your slide shows, flash cards and text summaries
                    will <b>never be out of date</b>.
                  </p>
                </Grid>
              </Grid>
              <Grid item xs={1} />
            </Grid>
          </section>
          <footer>
            <Grid container>
              <Grid item xs={1} />
              <Grid
                container
                className="footer-container"
                alignItems="center"
                xs={10}
                spacing={3}
              >
                <Grid item xs={4}>
                  <small>
                    <p className="landing-paragraph-font">
                      Copyright © 2021 Yada.&nbsp;&nbsp;All rights reserved.
                    </p>
                  </small>
                </Grid>
              </Grid>
              <Grid item xs={1} />
            </Grid>
          </footer>
        </div>
      </div>
    );
  };
}

export default connect(
  (state) => ({ backendModeSignedInStatus: state.backendModeSignedInStatus }),
  (dispatch) => ({
    dispatchSetBackendModeSignedInStatusAction: (mode) =>
      dispatch(setBackendModeSignedInStatusAction(mode)),
    dispatchNewUserAction: (newUser) => dispatch(setNewUserAction(newUser)),
    dispatchSetToastAction: (toast) => dispatch(setToastAction(toast)),
  })
)(LoginPage);
