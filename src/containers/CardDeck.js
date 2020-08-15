import React from 'react';
import {connect} from 'react-redux';
import Card from '../components/Card';
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import TagEditor from "../components/TagEditor";

class CardDeck extends React.Component {
	
	constructor(props) {
		super(props);
		this.state = {
			content: null,
			tags: null,
			all_tags: []
		};
	}
	
	constructDoc = (tagId) => {
		const node = this.state.tags[tagId]["content"]
		return {
			"doc": {
				"type": "doc",
				"content": [node]
			},
			"selection": {
				"type": "text",
				"anchor": 0,
				"head": 0
			}
		};
	}
	
	constructCard = (index) => {
		const cardContent = {"index": index}
		cardContent["front"] = this.constructDoc(this.props.tagsInView[index]);
		if (index+1 < this.props.tagsInView.length) {
			cardContent["back"] = this.constructDoc(this.props.tagsInView[index+1]);
		}
		return <Card content={cardContent}/>;
	}
	
	componentDidMount(){
		const front_1 = {
			"type": "heading",
			"attrs": {
				"hidden": false,
				"level": 1
			},
			"content": [
				{
					"type": "text",
					"text": "How many bones are in a shark's body"
				}
			]
		};
		const back_1 = {
			"type": "paragraph",
			"attrs": {
				"hidden": false
			},
			"content": [
				{
					"type": "text",
					"text": "0 bones - "
				},
				{
					"type": "text",
					"marks": [
						{
							"type": "strong"
						}
					],
					"text": "shark skeleton is all cartilage"
				}
			]
		};
		const front_2 = {
			"type": "heading",
			"attrs": {
				"hidden": false,
				"level": 1
			},
			"content": [
				{
					"type": "text",
					"text": "How do you print \"Hello World\" in Python3?"
				}
			]
		};
		const back_2 = {
			"type": "paragraph",
			"attrs": {
				"hidden": false
			},
			"content": [
				{
					"type": "text",
					"marks": [
						{
							"type": "code_inline"
						}
					],
					"text": "print(\"Hello World\")"
				}
			]
		};
		
		
		let allTags = ['uuid1', 'uuid2', 'uuid3', 'uuid4']
		
		const newState = {
			tags: {
				'uuid1': {"id": "uuid1", "name": "question", "content": front_1},
				'uuid2': {"id": "uuid2", "name": "answer",   "content": back_1},
				'uuid3': {"id": "uuid3", "name": "question", "content": front_2},
				'uuid4': {"id": "uuid4", "name": "answer",   "content": back_2},
			},
			allTags: allTags
		}
		this.setState(newState)
	}
	
	render = () => {
		if (this.state.tags === null){
			console.log("No content to display")
			return null;
		}else{
			console.log(this.props.tagsInView);
			const cards = [];
		
			for (let i = 0; i < this.props.tagsInView.length; i+=4) {
				cards.push(
					<Row className="justify-content-md-center">
						<Col lg="12" xl="6">
							{this.constructCard(i)}
						</Col>
						<Col lg="12" xl="6">
							{
								(i+2 < this.props.tagsInView.length) && this.constructCard(i+2)
							}
						</Col>
					</Row>
				);
			}
			
			return (
				<Container>
					<TagEditor tags={this.state.tags} tagsInView={this.props.tagsInView} allTags={this.state.allTags}/>
					{cards}
				</Container>
			);
		}
	};
}

export default connect(
	state => ({
		tagsInView: state.tagsInView
	}),
)(CardDeck);
