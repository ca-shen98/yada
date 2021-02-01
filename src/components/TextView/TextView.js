import 'bootstrap/dist/css/bootstrap.min.css';
// import './CardDeck.css';
import React from 'react';
import {connect} from 'react-redux';
import Container from 'react-bootstrap/Container'
import TagEditor from '../ViewComponents/TagEditor';
import {setTagsInViewAction} from '../../reducers/SetTagsInView';
import FileStorageSystemClient from "../../backend/FileStorageSystemClient";
import {FILE_TYPE} from "../../util/FileIdAndTypeUtils";


class TextView extends React.Component {
	
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
			FileStorageSystemClient.doSaveViewSpec(
				this.props.tagsInView,
				this.props.currentOpenFileId.sourceId,
				this.props.currentOpenFileId.viewId,
				FILE_TYPE.TEXT_VIEW,
				false,
				)
				.then(() => alert("Text view saved"))
				.catch(() => alert("Failed to save text view"));
		}
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
		return (
			<Container className="viewContainer">
				<h5>Loading Text View ...</h5>
			</Container>
		);
		
		// if (!this.state.allTagsData || this.props.tagsInView == null) {
		// 	return (
		// 		<Container className="viewContainer">
		// 			<h5>Loading Text View ...</h5>
		// 		</Container>
		// 	);
		// } else {
		// 	const cards = [];
		// 	for (let i = 0; i < this.props.tagsInView.length; i+=4) {
		// 		cards.push(
		// 			<Row key={`row_${i%4}`} className="justify-content-md-center">
		// 				<Col lg="12" xl="6">
		// 					{this.constructCard(i)}
		// 				</Col>
		// 				<Col lg="12" xl="6">
		// 					{(i + 2 < this.props.tagsInView.length) && this.constructCard(i + 2)}
		// 				</Col>
		// 			</Row>
		// 		);
		// 	}
		// 	return (
		// 		<Container className="viewContainer">
		// 			<TagEditor allTagsData={this.state.allTagsData} tagsInView={this.props.tagsInView} />
		// 			{cards}
		// 		</Container>
		// 	);
		// }
	};
}

export default connect(
	state => ({ tagsInView: state.tagsInView, currentOpenFileId: state.currentOpenFileId }),
	dispatch => ({ setTagsInView: tagsInView => dispatch(setTagsInViewAction(tagsInView)) }),
)(TextView);
