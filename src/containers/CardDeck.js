import React from 'react';
import {connect} from 'react-redux';
import Card from '../components/Card';
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import TagEditor from "../components/TagEditor";
import {getCardView, putCardView} from "../backend/yaas";
import Actions from "../actions";

class CardDeck extends React.Component {
	
	constructor(props) {
		super(props);
		this.state = {
			allTagsData: null,
		};
	}
	
	keydownHandler = (e) => {
		if ((window.navigator.platform.match("Mac") ? e.metaKey : e.ctrlKey)  && e.keyCode === 83) {
			e.preventDefault();
			console.log("save");
			// TODO: fix docID and viewID
			putCardView({"tagIds": this.props.tagsInView},1,1)
				.then(() => console.log("Saved view"))
				.catch(() => console.log("Failed to save view"))
		}
	}
	
	constructDoc = (tagId) => {
		const node = this.state.allTagsData[tagId]["content"]
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
		} else {
			cardContent["back"] = null;
		}
		return <Card content={cardContent}/>;
	}
	
	componentDidMount(){
		getCardView(438, 1)
			.then(([currentViewData, allTagsData]) => {
				this.props.setTagsInView(Object.keys(currentViewData["items"]));
				this.setState({allTagsData: allTagsData["items"]});
			});
		document.addEventListener('keydown',this.keydownHandler);
	}
	
	componentWillUnmount(){
		document.removeEventListener('keydown',this.keydownHandler);
	}
	
	render = () => {
		if (this.state.allTagsData === null || this.state.allTagsData === undefined){
			console.log("No content to display")
			return null;
		}else{
			const cards = [];
		
			for (let i = 0; i < this.props.tagsInView.length; i+=4) {
				cards.push(
					<Row key={`row_${i%4}`} className="justify-content-md-center">
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
					<TagEditor allTagsData={this.state.allTagsData} tagsInView={this.props.tagsInView}/>
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
	dispatch => ({
		setTagsInView: tagsInView => dispatch(Actions.setTagsInView(tagsInView)),
	}),
)(CardDeck);
