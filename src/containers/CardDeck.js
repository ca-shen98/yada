import React from 'react';
import {connect} from 'react-redux';
import Card from '../components/Card';
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import TagEditor from "../components/TagEditor";

class CardDeck extends React.Component {
	
	state = {
		content: null,
		serverRunning: true
	}
	
	componentDidMount(){
		const frontJSON = [
			{
				"doc": {
					"type": "doc",
					"content": [
						{
							"type": "heading",
							"attrs": {
								"hidden": false,
								"level": 1
							},
							"content": [
								{
									"type": "text",
									"text": "Top Secret Presentation"
								}
							]
						},
						{
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
									"text": "print(\"Welcome to the Yada Card View\")"
								}
							]
						}
					]
				},
				"selection": {
					"type": "text",
					"anchor": 0,
					"head": 0
				}
			},
			{
				"doc": {
					"type": "doc",
					"content": [
						{
							"type": "heading",
							"attrs": {
								"hidden": false,
								"level": 1
							},
							"content": [
								{
									"type": "text",
									"text": "Card 1"
								}
							]
						},
						{
							"type": "paragraph",
							"attrs": {
								"hidden": false
							},
							"content": [
								{
									"type": "text",
									"text": "Much "
								},
								{
									"type": "text",
									"marks": [
										{
											"type": "strong"
										}
									],
									"text": "Hype! "
								}
							]
						}
					]
				},
				"selection": {
					"type": "text",
					"anchor": 0,
					"head": 0
				}
			},
			{
				"doc": {
					"type": "doc",
					"content": [
						{
							"type": "heading",
							"attrs": {
								"hidden": false,
								"level": 1
							},
							"content": [
								{
									"type": "text",
									"text": "Card 2"
								}
							]
						},
						{
							"type": "paragraph",
							"attrs": {
								"hidden": false
							},
							"content": [
								{
									"type": "text",
									"text": "Much "
								},
								{
									"type": "text",
									"marks": [
										{
											"type": "strong"
										}
									],
									"text": "Hype! "
								}
							]
						}
					]
				},
				"selection": {
					"type": "text",
					"anchor": 0,
					"head": 0
				}
			},
			{
				"doc": {
					"type": "doc",
					"content": [
						{
							"type": "heading",
							"attrs": {
								"hidden": false,
								"level": 1
							},
							"content": [
								{
									"type": "text",
									"text": "Thank You"
								}
							]
						},
						{
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
									"text": "print(\"Hope you liked this top secret presentation\")"
								}
							]
						},
						{
							"type": "paragraph",
							"attrs": {
								"hidden": false
							},
							"content": [
								{
									"type": "text",
									"text": "Hope you liked this "
								},
								{
									"type": "text",
									"marks": [
										{
											"type": "strong"
										}
									],
									"text": "top secret presentation"
								}
							]
						}
					]
				},
				"selection": {
					"type": "text",
					"anchor": 0,
					"head": 0
				}
			}
		]
		const backJSON = [
			{
				"doc": {
					"type": "doc",
					"content": [
						{
							"type": "heading",
							"attrs": {
								"hidden": false,
								"level": 1
							},
							"content": [
								{
									"type": "text",
									"text": "Back of Card 1"
								}
							]
						}
					]
				},
				"selection": {
					"type": "text",
					"anchor": 0,
					"head": 0
				}
			},
			{
				"doc": {
					"type": "doc",
					"content": [
						{
							"type": "heading",
							"attrs": {
								"hidden": false,
								"level": 1
							},
							"content": [
								{
									"type": "text",
									"text": "Back of Card 2"
								}
							]
						},
						{
							"type": "paragraph",
							"attrs": {
								"hidden": false
							},
							"content": [
								{
									"type": "text",
									"text": "Flippity flip "
								},
								{
									"type": "text",
									"marks": [
										{
											"type": "strong"
										}
									],
									"text": "flip! "
								}
							]
						}
					]
				},
				"selection": {
					"type": "text",
					"anchor": 0,
					"head": 0
				}
			}
		];
		const content = [
			{"index": 0, "front": frontJSON[0]},
			{"index": 1, "front": frontJSON[1], "back": backJSON[0]},
			{"index": 2, "front": frontJSON[2], "back": backJSON[1]},
			{"index": 3, "front": frontJSON[3]}
		]
		this.setState({content: content})
	}
	
	render = () => {
		if (this.state.content == null){
			console.log("Not content to display")
			return null;
		}else{
			const cards = [];
			for (let i = 0; i < this.state.content.length; i+=2) {
				cards.push(
					<Row className="justify-content-md-center">
						<Col lg="12" xl="6">
							<Card content={this.state.content[i]}/>
						</Col>
						<Col lg="12" xl="6">
							{
								(i < this.state.content.length-1) && <Card content={this.state.content[i+1]}/>
							}
						</Col>
					</Row>
				);
			}
			
			return (
				<Container>
					<TagEditor/>
					{cards}
				</Container>
			);
		}
	};
}

export default connect(
	state => ({
		fileNameKey: state.fileNameKey,
	}),
)(CardDeck);
