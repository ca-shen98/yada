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

const DEFAULT_STATE = {
	sourceId: 0,
	viewId: 0,
	data: null,
	fileType: FILE_TYPE.EMPTY
};

class ViewEditor extends React.Component {
	
	state = DEFAULT_STATE;
	
	changeFile = async () => {
		FileStorageSystemClient.doGetView(this.props.currentOpenFileId).then(value => {
			if (value === null) {
				alert('failed to retrieve view');
				handleSetCurrentOpenFileId(NO_OPEN_FILE_ID);
			} else {
				if (this.props.currentOpenFileId.viewType === FILE_TYPE.CARD_VIEW) {
					let fileType = FILE_TYPE.CARD_VIEW;
					this.setState({
						sourceId: this.props.currentOpenFileId.sourceId,
						viewId: this.props.currentOpenFileId.viewId,
						data: {
							tagsInView: Object.keys(value["view"]["items"]),
							allTagsData: value["tags"]["items"]
						},
						fileType: fileType
					});
				} else if (this.props.currentOpenFileId.viewType === FILE_TYPE.TEXT_VIEW) {
					let fileType = FILE_TYPE.TEXT_VIEW;
					this.setState({
						sourceId: this.props.currentOpenFileId.sourceId,
						viewId: this.props.currentOpenFileId.viewId,
						data: {
							tagsInView: Object.keys(value["view"]["items"]),
							allTagsData: value["tags"]["items"]
						},
						fileType: fileType
					});
				} else {
					console.error("Unsupported view type");
				}
			}
		});
	};
	
	componentDidMount = () => {
		this.changeFile().then(() => console.log("Mounted view file"));
	};
	componentDidUpdate = prevProps => {
		if (
			prevProps.currentOpenFileId.sourceId !== this.props.currentOpenFileId.sourceId ||
			prevProps.currentOpenFileId.viewId !== this.props.currentOpenFileId.viewId
		) {
			this.changeFile().then(() => console.log("Updated view file"));
		}
	};
	
	render = () => {
		if (this.state.fileType === FILE_TYPE.CARD_VIEW) {
			return <CardDeck data={this.state.data}/>;
		} else if (this.state.fileType === FILE_TYPE.TEXT_VIEW) {
			return <TextView data={this.state.data}/>;
		}
		return null;
	};
}

export default connect(state => ({ currentOpenFileId: state.currentOpenFileId }))(ViewEditor);

