import React from 'react';
import {connect} from 'react-redux';
import {Hero, Section} from 'react-landing-page';
import {GoogleLogin} from 'react-google-login';
import axios from 'axios';
import Cookies from 'js-cookie'
import {fetchWithTimeout} from '../util/FetchWithTimeout';
import {
  BACKEND_MODE_SIGNED_IN_STATUS,
  SERVER_BASE_URL,
  ACCESS_TOKEN_COOKIE_KEY,
  setBackendModeSignedInStatusAction,
} from '../reducers/BackendModeSignedInStatus';

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
    <Hero
      color="black"
      bg="white"
      backgroundImage="https://source.unsplash.com/npxXWgQ33ZQ/1600x900">
      <Section heading='YADA' subhead='Yet Another Docs App' width={1}>
        <GoogleLogin
          clientId={CLIENT_ID}
          buttonText="Sign in with Google to get started"
          onSuccess={response => { this.handleLoginSuccess(response); }}
          onFailure={response => { console.log(response); }}
          cookiePolicy="single_host_origin"
          responseType="code,token"
        />
      </Section>
      <button
        onClick={() => {
          this.props.dispatchSetBackendModeSignedInStatusAction(BACKEND_MODE_SIGNED_IN_STATUS.LOCAL_STORAGE);
        }}>
        Use local storage
      </button>
    </Hero>;
}

export default connect(
  state => ({ backendModeSignedInStatus: state.backendModeSignedInStatus }),
  dispatch => ({
    dispatchSetBackendModeSignedInStatusAction: mode => dispatch(setBackendModeSignedInStatusAction(mode)),
  }),
)(LandingPage);
