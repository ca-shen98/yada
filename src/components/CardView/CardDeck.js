import 'bootstrap/dist/css/bootstrap.min.css';
import './CardDeck.css';
import React from 'react';
import {connect} from 'react-redux';
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from './Card';
import TagEditor from './TagEditor';
import {putCardView} from '../../backend/yaas';
import {setTagsInViewAction} from '../../reducers/SetTagsInView';


class CardDeck extends React.Component {
	
	constructor(props) {
		super(props);
		this.state = {
			allTagsData: props.data.allTagsData,
		}
		this.props.setTagsInView(props.data.tagsInView);
	}
	
	
	keydownHandler = (event) => {
		if ((window.navigator.platform.match("Mac") ? event.metaKey : event.ctrlKey)  && event.keyCode === 83) {
			event.preventDefault();
			putCardView({"tagIds": this.props.tagsInView},this.state.sourceId,this.state.viewId)
				.then(() => { console.log("Saved view"); })
				.catch(() => { console.log("Failed to save view"); })
		}
	};
	
	constructDoc = (tagId) => {
		const node = this.state.allTagsData[tagId]["content"];
		console.log(node);
		return {
			"type": "doc",
			"content": [node]
		};
	};
	
	constructCard = (index) => {
		const cardContent = { "index": index };
		cardContent["front"] = this.constructDoc(this.props.tagsInView[index]);
		if (index + 1 < this.props.tagsInView.length) {
			cardContent["back"] = this.constructDoc(this.props.tagsInView[index+1]);
		} else { cardContent["back"] = null; }
		return <Card content={cardContent} />;
	};
	
	componentDidMount = () => {
		document.addEventListener('keydown',this.keydownHandler);
	};
	componentDidUpdate = prevProps => {
		if (prevProps.tagsInView !== this.props.tagsInView) {
			this.props.setTagsInView(this.props.tagsInView);
		}
	};
	componentWillUnmount = () => { document.removeEventListener('keydown',this.keydownHandler); };
	
	render = () => {
		if (!this.state.allTagsData || this.props.tagsInView == null) {
			return (
				<Container className="viewContainer">
					<h5>Loading Card Deck ...</h5>
				</Container>
			);
		} else {
			const cards = [];
			for (let i = 0; i < this.props.tagsInView.length; i+=4) {
				cards.push(
					<Row key={`row_${i%4}`} className="justify-content-md-center">
						<Col lg="12" xl="6">
							{this.constructCard(i)}
						</Col>
						<Col lg="12" xl="6">
							{(i + 2 < this.props.tagsInView.length) && this.constructCard(i + 2)}
						</Col>
					</Row>
				);
			}
			return (
				<Container className="viewContainer">
					<TagEditor allTagsData={this.state.allTagsData} tagsInView={this.props.tagsInView} />
					{cards}
				</Container>
			);
		}
	};
}

export default connect(
	state => ({ tagsInView: state.tagsInView }),
	dispatch => ({ setTagsInView: tagsInView => dispatch(setTagsInViewAction(tagsInView)) }),
)(CardDeck);
