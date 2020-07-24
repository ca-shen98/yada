import React from 'react';
import RichMarkdownEditor from 'rich-markdown-editor';
import {connect} from 'react-redux';
import BootstrapCard from 'react-bootstrap/Card';
import ReactCardFlip from 'react-card-flip';

class Card extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			serverRunning: true,
			isFlipped: false
		};
		this.handleClick = this.handleClick.bind(this);
		this.createBootstrapCard = this.createBootstrapCard.bind(this);
	}
	
	handleClick(e) {
		e.preventDefault();
		this.setState(prevState => ({ isFlipped: !prevState.isFlipped }));
	}
	
	createBootstrapCard(bgMode, key, textColour, json) {
		return (
			<BootstrapCard
				bg={bgMode}
				key={key}
				text={textColour}
				className="BootstrapCard"
				onClick={this.handleClick}
			>
				<RichMarkdownEditor
					className="Card"
					readOnly={true}
					dark={this.props.editorDarkMode}
					key={`card${key}`}
					defaultJSON={JSON.stringify(json)}
					tagFilters={this.props.tagFiltersExpr}
				/>
			</BootstrapCard>
		);
	}
	
	render = () => {
		const bgMode = this.props.editorDarkMode ? 'dark' : 'light';
		const textColour = this.props.editorDarkMode ? 'white' : 'dark';
		const content = this.props.content;
		if (content !== undefined) {
			const key = content["index"];
			const front = content["front"];
			const back = content["back"];
			return (
				<ReactCardFlip isFlipped={this.state.isFlipped} flipDirection="vertical">
					{this.createBootstrapCard(bgMode, key, textColour, front)}
					{this.createBootstrapCard(bgMode, key, textColour, back)}
				</ReactCardFlip>
			);
		} else { return null; }
	};
}

export default connect(
	state => ({}),
)(Card);
