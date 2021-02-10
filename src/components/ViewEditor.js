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
import {SAVE_DIRTY_STATUS, setSaveDirtyStatusAction} from '../reducers/CurrentOpenFileState';
import {setTagsInViewAction} from "../reducers/SetTagsInView";
import {setToastAction, TOAST_SEVERITY} from "../reducers/Toast";

const DEFAULT_STATE = {
	sourceId: 0,
	viewId: 0,
	data: null,
	fileType: FILE_TYPE.EMPTY
};

export const handleSaveViewSpec = async () => {
	store.dispatch(setSaveDirtyStatusAction(SAVE_DIRTY_STATUS.SAVING));
	FileStorageSystemClient.doSaveViewSpec(
		store.getState().tagsInView,
		store.getState().currentOpenFileId.sourceId,
		store.getState().currentOpenFileId.viewId,
		store.getState().currentOpenFileId.viewType,
		false,
	)
		.then(() => {
			store.dispatch(setToastAction({
				message: "Saved view",
				severity: TOAST_SEVERITY.SUCCESS,
				open: true
			}));
			store.dispatch(setSaveDirtyStatusAction(SAVE_DIRTY_STATUS.NONE));
		})
		.catch(() => store.dispatch(setToastAction({
			message: "Failed to save view",
			severity: TOAST_SEVERITY.ERROR,
			open: true
		})));
};

class ViewEditor extends React.Component {
	
	state = DEFAULT_STATE;
	
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

export default connect(
	state => ({ currentOpenFileId: state.currentOpenFileId }),
	dispatch => ({
		setTagsInView: tagsInView => dispatch(setTagsInViewAction(tagsInView)),
		dispatchSetToastAction: toast => dispatch(setToastAction(toast)),
	}),
)(ViewEditor);

