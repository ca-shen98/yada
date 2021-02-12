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
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Switch from "@material-ui/core/Switch";


class TextView extends React.Component {
	
	constructor(props) {
		super(props);
		this.state = {
			allTagsData: props.data.allTagsData,
			displaySwitch: false,
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
				.then(() => {
					this.props.dispatchSetToastAction({
						message: "Saved view",
						severity: TOAST_SEVERITY.SUCCESS,
						open: true
					});
					store.dispatch({ type: CLEAR_SAVE_DIRTY_FLAG_ACTION_TYPE });
				})
				.catch(() => this.props.dispatchSetToastAction({
					message: "Failed to save view",
					severity: TOAST_SEVERITY.ERROR,
					open: true
				}));
		}
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
					<FormControlLabel
						control={
							<Switch
								checked={this.state.displaySwitch}
								onChange={() => {this.setState({displaySwitch: !this.state.displaySwitch})}}
								name="checkedB"
								color="primary"
							/>
						}
						label="Display Mode"
					/>
					{
						!this.state.displaySwitch &&
						<TagEditor viewType={FILE_TYPE.TEXT_VIEW} allTagsData={this.state.allTagsData} tagsInView={this.props.tagsInView} />
					}
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
