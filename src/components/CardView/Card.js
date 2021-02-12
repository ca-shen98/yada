import React from 'react';
import RichMarkdownEditor from 'rich-markdown-editor';
import BootstrapCard from 'react-bootstrap/Card';
import ReactCardFlip from 'react-card-flip';

class Card extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			isFlipped: false,
			key: this.props.content["index"],
			front: this.props.content["front"],
			back: this.props.content["back"]
		};
		this.handleClick = this.handleClick.bind(this);
		this.createBootstrapCard = this.createBootstrapCard.bind(this);
	}
	
	handleClick(e) {
		e.preventDefault();
		this.setState(prevState => ({ isFlipped: !prevState.isFlipped }));
	}
	
	createBootstrapCard(key, json) {
		return (
			<BootstrapCard
				key={key}
				text="black"
				className="BootstrapCard"
				onClick={this.handleClick}
			>
				{
					json &&
					<RichMarkdownEditor
						className="Card"
						readOnly={true}
						key={`card${key}`}
						defaultValue={JSON.stringify(json)}
						jsonStrValue={true}
					/>
				}
			</BootstrapCard>
		);
	}
	
	render = () => {
		const content = this.props.content;
		if (content !== undefined) {
			const key = content["index"];
			const front = content["front"];
			const back = content["back"];
			return (
				<ReactCardFlip isFlipped={this.state.isFlipped} flipDirection="vertical">
					{this.createBootstrapCard(key, front)}
					{this.createBootstrapCard(key, back)}
				</ReactCardFlip>
			);
		} else { return null; }
	};
}

export default Card;
