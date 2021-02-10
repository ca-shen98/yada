import 'bootstrap/dist/css/bootstrap.min.css';
import './TextView.css';
import React from 'react';
import {connect} from 'react-redux';
import Container from 'react-bootstrap/Container'
import TagEditor from '../ViewComponents/TagEditor';
import {setTagsInViewAction} from '../../reducers/SetTagsInView';
import FileStorageSystemClient from "../../backend/FileStorageSystemClient";
import {FILE_TYPE} from "../../util/FileIdAndTypeUtils";
import RichMarkdownEditor from "rich-markdown-editor";
import {setToastAction, TOAST_SEVERITY} from "../../reducers/Toast";
import store from "../../store";
import {CLEAR_SAVE_DIRTY_FLAG_ACTION_TYPE} from "../../reducers/CurrentOpenFileState";


class TextView extends React.Component {
	
	constructor(props) {
		super(props);
		this.state = {
			allTagsData: props.data.allTagsData,
		}
		this.props.setTagsInView(props.data.tagsInView);
	}
	
	constructTextView = () => {
		return {
			"type": "doc",
			"content": this.props.tagsInView.map(t => this.state.allTagsData[t]["content"])
		};
	};
	componentDidUpdate = prevProps => {
		if (prevProps.tagsInView !== this.props.tagsInView) {
			this.props.setTagsInView(this.props.tagsInView);
		}
	};
	
	render = () => {
		if (!this.state.allTagsData || this.props.tagsInView == null) {
			return (
				<Container className="viewContainer">
					<h5>Loading Text View ...</h5>
				</Container>
			);
		} else {
			return (
				<Container className="viewContainer">
					<TagEditor viewType={FILE_TYPE.TEXT_VIEW} allTagsData={this.state.allTagsData} tagsInView={this.props.tagsInView} />
					{
						this.props.tagsInView.length > 0 &&
						<RichMarkdownEditor
							className="TextViewEditor"
							readOnly={true}
							key={"text_view"}
							defaultValue={JSON.stringify(this.constructTextView())}
							jsonStrValue={true}
						/>
					}
				</Container>
			);
		}
	};
}

export default connect(
	state => ({ tagsInView: state.tagsInView, currentOpenFileId: state.currentOpenFileId }),
	dispatch => ({
		setTagsInView: tagsInView => dispatch(setTagsInViewAction(tagsInView)),
		dispatchSetToastAction: toast => dispatch(setToastAction(toast)),
	}),
)(TextView);
