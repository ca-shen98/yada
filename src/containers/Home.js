import React from 'react';
import {connect} from 'react-redux';
import {CallToAction, Hero, Section} from "react-landing-page";
import GoogleBtn from "../components/GoogleBtn";

class Home extends React.Component {
	state = {
		isLoggedIn: false,
	}
	
	login = (loginState) => {
		this.setState({isLoggedIn: loginState})
	}
	
	render = () => {
		return (
			<div>
				<Hero
					color="black"
					bg="white"
					backgroundImage="https://source.unsplash.com/npxXWgQ33ZQ/1600x900"
				>
					<Section heading='YADA' subhead='Yet Another Docs App' width={1}>
						{ this.state.isLoggedIn && <CallToAction id="edit" href='#/edit'>Get Started</CallToAction> }
						<GoogleBtn login={this.login} isLoggedIn={this.state.isLoggedIn}/>
					</Section>
				</Hero>
			</div>
		);
	};
}

export default connect(
	state => ({
		isLoggedIn: state.editorDarkMode,
	}),
)(Home);
