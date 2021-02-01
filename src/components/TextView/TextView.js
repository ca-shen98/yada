import 'bootstrap/dist/css/bootstrap.min.css';
import './TextView.css';
import React from 'react';
import {connect} from 'react-redux';
import Container from 'react-bootstrap/Container'
import TagEditor from '../ViewComponents/TagEditor';
import {setTagsInViewAction} from '../../reducers/SetTagsInView';
import FileStorageSystemClient from "../../backend/FileStorageSystemClient";
import {FILE_TYPE} from "../../util/FileIdAndTypeUtils";
import Card from "../CardView/Card";
import RichMarkdownEditor from "rich-markdown-editor";


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
	
	constructDoc = (tagId) => {
		const node = this.state.allTagsData[tagId]["content"];
		return {
			"type": "doc",
			"content": [node]
		};
	};
	
	constructTextView = () => {
		return {
			"type": "doc",
			"content": this.props.tagsInView.map(t => this.state.allTagsData[t]["content"])
		};
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
					<h5>Loading Text View ...</h5>
				</Container>
			);
		} else {
			return (
				<Container className="viewContainer">
					<TagEditor allTagsData={this.state.allTagsData} tagsInView={this.props.tagsInView} />
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
	dispatch => ({ setTagsInView: tagsInView => dispatch(setTagsInViewAction(tagsInView)) }),
)(TextView);
