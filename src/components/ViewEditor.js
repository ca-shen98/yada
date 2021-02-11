import './ViewEditor.css';
import React from 'react';
import {connect} from 'react-redux';
import {
	FILE_TYPE,
	NO_OPEN_FILE_ID
} from "../util/FileIdAndTypeUtils";
import FileStorageSystemClient from "../backend/FileStorageSystemClient";
import {handleSetCurrentOpenFileId} from "./Navigator";
import CardDeck from "./CardView/CardDeck";
import TextView from "./TextView/TextView";
import {setTagsInViewAction} from "../reducers/SetTagsInView";
import {setToastAction, TOAST_SEVERITY} from "../reducers/Toast";
import { Steps } from "intro.js-react";

class ViewEditor extends React.Component {
	
	state = {
		sourceId: 0,
		viewId: 0,
		data: null,
		fileType: FILE_TYPE.EMPTY,
		steps: [
			{
				title: "Welcome to Views!",
				intro: "Here you can make all kinds of views on top of your source document"
			},
			{
				title: "View Editor ⌨️",
				element: ".dragDrop",
				intro: "This is a drag and drop interface. Simply Drag a tag from the Available Tags to your Tags in View to include it!"
			},
			{
				title: "View Preview 👀",
				element: ".viewContent",
				intro: "Here you can see the content of the view based on the tags you have selected above"
			},
			{
				title: "Display Mode 🖥",
				element: ".displayModeSwitch",
				intro: "Use this switch to toggle the Display Mode!"
			}
		],
		cardTourStart: this.props.newUser
	};
	
	changeFile = async () => {
		FileStorageSystemClient.doGetView(this.props.currentOpenFileId).then(value => {
			if (value === null) {
				this.props.dispatchSetToastAction({
					message: "Failed to retrieve view",
					severity: TOAST_SEVERITY.ERROR,
					open: true
				})
				handleSetCurrentOpenFileId(NO_OPEN_FILE_ID);
			} else {
				this.props.setTagsInView([]); // clear any tagsInView currently stored
				this.setState({
					sourceId: this.props.currentOpenFileId.sourceId,
					viewId: this.props.currentOpenFileId.viewId,
					data: {
						tagsInView: value["view"]["order"],
						allTagsData: value["tags"]["items"]
					},
					fileType: this.props.currentOpenFileId.viewType
				});
			}
		});
	};
	
	componentDidMount = () => {
		this.changeFile().then(() => console.log("Mounted view file"));
		console.log("View Editor Mounted")
	};
	componentDidUpdate = prevProps => {
		if (
			prevProps.currentOpenFileId.sourceId !== this.props.currentOpenFileId.sourceId ||
			prevProps.currentOpenFileId.viewId !== this.props.currentOpenFileId.viewId
		) {
			this.changeFile().then(() => console.log("Updated view file"));
		}
		if (prevProps.newUser !== this.props.newUser) {
			console.log("updating card tour start");
			this.setState({cardTourStart: this.props.newUser});
		  }
	};
	
	onStepsExit = () => {
		this.setState(() => ({ cardTourStart: false}));
	};

	render = () => {
		console.log(this.state.cardTourStart);
		console.log(this.props.tagEditorOpened);
		return(
			<div>
				<Steps
					enabled={this.state.cardTourStart && this.props.tagEditorOpened}
					steps={this.state.steps}
					initialStep={0}
					onExit={this.onStepsExit}
					options={{disableInteraction: true, exitOnOverlayClick: false, exitOnEsc: false}}
				/>
				{(this.state.fileType === FILE_TYPE.CARD_VIEW) ?
					<CardDeck data={this.state.data}/> : 
					(this.state.fileType === FILE_TYPE.TEXT_VIEW) ? 
					<TextView data={this.state.data}/> : null
				}
			</div>
		)
	};
}

export default connect(
	state => ({ 
		currentOpenFileId: state.currentOpenFileId,
		newUser: state.newUser,
		tagEditorOpened: state.tagEditorOpened
	 }),
	dispatch => ({
		setTagsInView: tagsInView => dispatch(setTagsInViewAction(tagsInView)),
		dispatchSetToastAction: toast => dispatch(setToastAction(toast)),
	}),
)(ViewEditor);

