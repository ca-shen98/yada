import React from 'react';
import {connect} from 'react-redux';
import {Hero, Section} from 'react-landing-page';
import {GoogleLogin} from 'react-google-login';
import Cookies from 'js-cookie'
import {loginBackend} from "../backend/yaas";
import {setUserSignedInAction, ACCESS_TOKEN_COOKIE_KEY} from '../reducers/UserSignedIn';

const CLIENT_ID = '709358329925-gic89ini15sgaenfrta1gshej1ik72jg.apps.googleusercontent.com';

class LandingPage extends React.Component {

	handleLoginSuccess = response => {
		if (response.tokenObj) {
			loginBackend(response.profileObj.name, response.profileObj.email, response.tokenObj.id_token).then(ok => {
				if (ok) {
					Cookies.set(
						ACCESS_TOKEN_COOKIE_KEY,
						response.tokenObj.id_token,
						{ expires: new Date(response.tokenObj.expires_at) },
					);
					this.props.dispatchSetUserSignedInAction(true);
				}
			});
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
					onSuccess={this.handleLoginSuccess}
					onFailure={response => { console.log(response); }}
					cookiePolicy="single_host_origin"
					responseType="code,token"
				/>
			</Section>
		</Hero>;
}

export default connect(
	null,
	dispatch => ({ dispatchSetUserSignedInAction: status => dispatch(setUserSignedInAction(status)) }),
)(LandingPage);
