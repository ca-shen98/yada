import './Editor.css';
import React from 'react';
import {connect} from 'react-redux';
import SourceEditorWithTagFilters from "./SourceEditorWithTagFiltersInput";
import {
	checkSourceFileId,
	checkViewFileId,
	FILE_TYPE,
} from "../util/FileIdAndTypeUtils";
import ViewEditor from "./ViewEditor";
import Container from "react-bootstrap/Container";

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
			return (
				<Container className="viewContainer">
					<h5>Click/create a document!</h5>
				</Container>
			);
		}
		if (this.state.fileType === FILE_TYPE.SOURCE) {
			return <SourceEditorWithTagFilters />;
		}
		return <ViewEditor/>;
	};
};

export default connect(state => ({ currentOpenFileId: state.currentOpenFileId }))(EditorManager);
