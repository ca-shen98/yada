import './Editor.css';
import React from 'react';
import {connect} from 'react-redux';
import SourceEditorWithTagFilters from "./SourceEditorWithTagFiltersInput";
import {
	checkNoOpenFileId,
	checkSourceFileId, checkViewFileId,
	FILE_TYPE,
	getFileIdKeyStr,
	NO_OPEN_FILE_ID
} from "../util/FileIdAndTypeUtils";
import {defer} from "lodash";
import BlockTaggingEditorExtension from "../editor_extension/BlockTagging";
import FileStorageSystemClient from "../backend/FileStorageSystemClient";
import {handleSetCurrentOpenFileId} from "./Navigator";
import CardDeck from "./CardView/CardDeck";
import ViewEditor from "./ViewEditor";

const DEFAULT_STATE = {
	fileType: FILE_TYPE.EMPTY,
};

class EditorManager extends React.Component {
	
	state = DEFAULT_STATE;
	
	changeFile = () => {
		if (checkSourceFileId(this.props.currentOpenFileId)) {
			this.setState({fileType: FILE_TYPE.SOURCE});
		} else if (checkViewFileId(this.props.currentOpenFileId)) {
			this.setState({fileType: FILE_TYPE.CARD_VIEW});
		} else {
			this.setState({fileType: FILE_TYPE.EMPTY});
		}
	};
	
	
	componentDidMount = () => {
		this.changeFile();
	};
	
	componentDidUpdate = prevProps => {
		if (
			prevProps.currentOpenFileId.sourceId !== this.props.currentOpenFileId.sourceId ||
			prevProps.currentOpenFileId.viewId !== this.props.currentOpenFileId.viewId
		) {
			this.changeFile();
		}
	};
	
	render = () => {
		if (this.state.fileType === FILE_TYPE.EMPTY) {
			return <h1>Click/create a document!</h1>;
		}
		if (this.state.fileType === FILE_TYPE.SOURCE) {
			return <SourceEditorWithTagFilters />;
		}
		return <ViewEditor/>;
	};
};

export default connect(state => ({ currentOpenFileId: state.currentOpenFileId }))(EditorManager);
