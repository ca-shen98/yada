import React, { Component } from 'react'
import { GoogleLogin, GoogleLogout } from 'react-google-login';
import Cookies from 'js-cookie'

const CLIENT_ID = '709358329925-gic89ini15sgaenfrta1gshej1ik72jg.apps.googleusercontent.com';


class GoogleBtn extends Component {
	getAccessToken = () => Cookies.get('access_token');
	isAuthenticated = () => {
		const authenticated = !!this.getAccessToken();
		if (authenticated !== this.props.isLoggedIn) {
			this.props.login(authenticated);
		}
		return authenticated;
	}
	
	login = (response) => {
		const tokenObj = response.tokenObj
		if(tokenObj){
			const expiry = new Date(tokenObj.expires_at)
			Cookies.set('access_token', tokenObj.id_token, { expires: expiry })
			this.props.login(true);
		}
	}
	
	logout = (response) => {
		Cookies.set('access_token', '', { expires: new Date() })
		this.props.login(false);
	}
	
	handleLoginFailure = (response) => {
		console.log(response);
	}
	
	handleLogoutFailure = (response) => {
		console.log(response)
	}
	
	render() {
		return (
			<div>
				{ this.isAuthenticated() ?
					<GoogleLogout
						clientId={ CLIENT_ID }
						buttonText='Logout'
						onLogoutSuccess={ this.logout }
						onFailure={ this.handleLogoutFailure }
					>
					</GoogleLogout> :
					<GoogleLogin
						clientId={CLIENT_ID}
						buttonText='Sign in with Google'
						onSuccess={ this.login }
						onFailure={ this.handleLoginFailure }
						cookiePolicy={ 'single_host_origin' }
						responseType='code,token'
					/>
				}
			</div>
		)
	}
}


export default GoogleBtn;
