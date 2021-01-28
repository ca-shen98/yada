// import 'bootstrap/dist/css/bootstrap.min.css';
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
import {
	FILE_TYPE,
	NO_OPEN_FILE_ID
} from "../../util/FileIdAndTypeUtils";
import FileStorageSystemClient from "../../backend/FileStorageSystemClient";
import {handleSetCurrentOpenFileId} from "../Navigator";

const DEFAULT_STATE = {
	sourceId: 0,
	viewId: 0,
	allTagsData: null,
	fileType: FILE_TYPE.EMPTY
};

class CardDeck extends React.Component {
	
	state = DEFAULT_STATE;
	
	constructor(props) {
		super(props);
		// TODO: move this into a new file
		// then we can pass the props and use constructor like before.
		FileStorageSystemClient.doGetView({sourceId: 439, viewId: 1}).then(value => {
			if (value === null) {
				alert('failed to retrieve view');
				handleSetCurrentOpenFileId(NO_OPEN_FILE_ID);
			} else {
				console.log("Card Deck");
				this.props.setTagsInView(Object.keys(value["view"]["items"]));
				this.state.allTagsData = value["tags"]["items"];
				console.log(this.props);
				// TODO: get file type from: this.props.currentOpenFileId.viewType
				this.state = {
					sourceId: this.props.currentOpenFileId.sourceId,
					viewId: this.props.currentOpenFileId.viewId,
					allTagsData: value["tags"]["items"],
					fileType: FILE_TYPE.CARD_VIEW
				};
			}
		});
	}
	
	changeFile = async () => {
		console.log("Change CardDeck File");
		console.log(this.props.currentOpenFileId);
		// FileStorageSystemClient.doGetView(this.props.currentOpenFileId).then(value => {
		// 	if (value === null) {
		// 		alert('failed to retrieve view');
		// 		handleSetCurrentOpenFileId(NO_OPEN_FILE_ID);
		// 	} else {
		// 		console.log("Card Deck");
		// 		this.props.setTagsInView(Object.keys(value["view"]["items"]));
		// 		this.state.allTagsData = value["tags"]["items"];
		// 		console.log(this.props);
		// 		// TODO: get file type from: this.props.currentOpenFileId.viewType
		// 		this.setState({
		// 			sourceId: this.props.currentOpenFileId.sourceId,
		// 			viewId: this.props.currentOpenFileId.viewId,
		// 			allTagsData: value["tags"]["items"],
		// 			fileType: FILE_TYPE.CARD_VIEW
		// 		});
		// 	}
		// });
	};
	
	
	keydownHandler = (event) => {
		if ((window.navigator.platform.match("Mac") ? event.metaKey : event.ctrlKey)  && event.keyCode === 83) {
			event.preventDefault();
			console.log("save");
			putCardView({"tagIds": this.props.tagsInView},this.state.sourceId,this.state.viewId)
				.then(() => { console.log("Saved view"); })
				.catch(() => { console.log("Failed to save view"); })
		}
	};
	
	constructDoc = (tagId) => {
		const node = this.state.allTagsData[tagId]["content"];
		return {
			"doc": {
				"type": "doc",
				"content": [node]
			},
			"selection": {
				"type": "text",
				"anchor": 0,
				"head": 0
			},
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
		this.changeFile().then(() => console.log("Mounted file"));
	};
	componentDidUpdate = prevProps => {
		if (
			prevProps.currentOpenFileId.sourceId !== this.props.currentOpenFileId.sourceId ||
			prevProps.currentOpenFileId.viewId !== this.props.currentOpenFileId.viewId
		) {
			this.changeFile().then(() => console.log("Updated file"));
		}
	};
	componentWillUnmount = () => { document.removeEventListener('keydown',this.keydownHandler); };
	
	render = () => {
		if (!this.state.allTagsData || this.props.tagsInView === undefined) {
			console.log("No content to display");
			console.log(this.state.allTagsData);
			console.log(this.props.tagsInView);
			return null;
		} else {
			const cards = [];
			console.log("MAKING CARDS");
			console.log(this.state);
			console.log(this.props);
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
				<Container>
					<TagEditor allTagsData={this.state.allTagsData} tagsInView={this.props.tagsInView} />
					{cards}
				</Container>
			);
		}
	};
}

export default connect(
	state => ({ tagsInView: state.tagsInView, currentOpenFileId: state.currentOpenFileId }),
	dispatch => ({ setTagsInView: tagsInView => dispatch(setTagsInViewAction(tagsInView)) }),
)(CardDeck);
