import React from 'react';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import {connect} from 'react-redux';
import {setBackendModeSignedInStatusAction} from '../reducers/BackendModeSignedInStatus';
import Breadcrumbs from '@material-ui/core/Breadcrumbs';
import DescriptionIcon from '@material-ui/icons/Description';
import Link from '@material-ui/core/Link';
import TextFieldsIcon from '@material-ui/icons/TextFields';
import AmpStoriesIcon from '@material-ui/icons/AmpStories';
import {
	FILE_TYPE,
	checkNoOpenFileId,
	checkSourceFileId,
	checkViewFileId,
	NO_OPEN_FILE_ID
} from '../util/FileIdAndTypeUtils';
import Button from '@material-ui/core/Button';
import SaveIcon from '@material-ui/icons/Save';
import AccountCircleIcon from '@material-ui/icons/AccountCircle';
import IconButton from '@material-ui/core/IconButton';
import SearchIcon from '@material-ui/icons/Search';
import {parse as parseTagFilters} from '../lib/TagFiltersGrammar';
import BlockTaggingEditorExtension from '../editor_extension/BlockTagging';
import {TagFilteringPluginKey} from '../editor_extension/plugins/TagFiltering';
import {Selection, TextSelection} from 'prosemirror-state';
import {defer} from 'lodash';
import FileStorageSystemClient from '../backend/FileStorageSystemClient';
import RemoveCircleIcon from '@material-ui/icons/RemoveCircle';
import Autocomplete from '@material-ui/lab/Autocomplete';
import TextField from '@material-ui/core/TextField';
import Grid from '@material-ui/core/Grid';
import {setToastAction, TOAST_SEVERITY} from "../reducers/Toast";
import store from "../store";
import {CLEAR_SAVE_DIRTY_FLAG_ACTION_TYPE, SET_SAVE_DIRTY_FLAG_ACTION_TYPE} from "../reducers/CurrentOpenFileState";

const TAG_FILTERS_INPUT_ID = 'tag_filters_input';

const DEFAULT_STATE = {
	modifyingTagFilters: false,
	currentTagFiltersStr: '',
	currentParsedTagFiltersStr: '',
	sourceSavedTagFilters: {},
};

class Navbar extends React.Component {
	state = DEFAULT_STATE;
	
	handleSave = () => {
    store.dispatch({ type: CLEAR_SAVE_DIRTY_FLAG_ACTION_TYPE })
		if (checkSourceFileId(this.props.currentOpenFileId)) {
			FileStorageSystemClient.doSaveSourceContent(
				BlockTaggingEditorExtension.editor.value(true),
				this.props.currentOpenFileId.sourceId,
			).then(success => {
				if (success) {
					this.props.dispatchSetToastAction({
						message: "Saved source file",
						severity: TOAST_SEVERITY.SUCCESS,
						open: true
					});
				}
				else {
					this.props.dispatchSetToastAction({
						message: "Failed to save source file",
						severity: TOAST_SEVERITY.ERROR,
						open: true
          });
          store.dispatch({ type: SET_SAVE_DIRTY_FLAG_ACTION_TYPE });
				}
			});
		} else if (checkViewFileId(this.props.currentOpenFileId) && this.props.currentOpenFileId.viewType !== NO_OPEN_FILE_ID.viewType) {
			FileStorageSystemClient.doSaveViewSpec(
				this.props.tagsInView,
				this.props.currentOpenFileId.sourceId,
				this.props.currentOpenFileId.viewId,
				this.props.currentOpenFileId.viewType,
				false,
				)
				.then(() => {
					this.props.dispatchSetToastAction({
						message: "View saved",
						severity: TOAST_SEVERITY.SUCCESS,
						open: true
					});
					store.dispatch({ type: CLEAR_SAVE_DIRTY_FLAG_ACTION_TYPE });
				})
				.catch(() => {
          this.props.dispatchSetToastAction({
            message: "Failed to save view",
            severity: TOAST_SEVERITY.ERROR,
            open: true
          });
          store.dispatch({ type: SET_SAVE_DIRTY_FLAG_ACTION_TYPE });
        });
		}
	}
	
	handleCancelModifyingTagFilters = () => {
		const input = document.getElementById(TAG_FILTERS_INPUT_ID);
		input.value = this.state.currentTagFiltersStr;
		this.setState({ modifyingTagFilters: false });
	};
	
	handleStartModifyingTagFilters = () => {
		this.setState({ modifyingTagFilters: true });
		defer(() => {
			const input = document.getElementById(TAG_FILTERS_INPUT_ID);
			input.focus();
			input.setSelectionRange(input.value.length, input.value.length);
		});
	};
	
	handleUnpersistCurrentTagFilters = () => {
		if (
			!this.state.currentTagFiltersStr ||
			!this.state.sourceSavedTagFilters.hasOwnProperty(this.state.currentTagFiltersStr)
		) { return false; }
		const newSourceSavedTagFilters = {...this.state.sourceSavedTagFilters};
		delete newSourceSavedTagFilters[this.state.currentTagFiltersStr];
		FileStorageSystemClient.doSetSourceSavedTagFilters(
			this.props.currentOpenFileId.sourceId,
			newSourceSavedTagFilters,
		).then(success => {
			if (!success) {
				this.props.dispatchSetToastAction({
					message: "Failed to set source saved tag filters",
					severity: TOAST_SEVERITY.ERROR,
					open: true
				});
			}
			else { this.setState({ sourceSavedTagFilters: newSourceSavedTagFilters }); }
		});
	};
	
	handlePersistNewSavedTagFilters = () => {
		if (
			!this.state.currentTagFiltersStr ||
			this.state.sourceSavedTagFilters.hasOwnProperty(this.state.currentTagFiltersStr)
		) { return false; }
		const newSourceSavedTagFilters = {...this.state.sourceSavedTagFilters};
		newSourceSavedTagFilters[this.state.currentTagFiltersStr] = this.state.currentParsedTagFiltersStr;
		FileStorageSystemClient.doSetSourceSavedTagFilters(
			this.props.currentOpenFileId.sourceId,
			newSourceSavedTagFilters,
		).then(success => {
			if (!success) {
				this.props.dispatchSetToastAction({
					message: "Failed to set source saved tag filters",
					severity: TOAST_SEVERITY.ERROR,
					open: true
				});
			}
			else { this.setState({ sourceSavedTagFilters: newSourceSavedTagFilters }); }
		});
	};
	
	handleApplyTagFilters = () => {
		let tagFilters = null;
		const tagFiltersStr = document.getElementById(TAG_FILTERS_INPUT_ID).value.trim();
		if (tagFiltersStr) {
			tagFilters = parseTagFilters(tagFiltersStr);
			if (!tagFilters) {
				this.props.dispatchSetToastAction({
					message: "Invalid tag filters",
					severity: TOAST_SEVERITY.ERROR,
					open: true
				});
				return false;
			}
		}
		document.getElementById(TAG_FILTERS_INPUT_ID).value = tagFiltersStr;
		const parsedTagFiltersStr = JSON.stringify(tagFilters);
		const oldParsedTagFiltersStr = this.state.currentParsedTagFiltersStr;
		this.setState({ currentTagFiltersStr: tagFiltersStr, currentParsedTagFiltersStr: parsedTagFiltersStr });
		if (parsedTagFiltersStr === oldParsedTagFiltersStr) { return true; }
		if(BlockTaggingEditorExtension.editor !== undefined){
			BlockTaggingEditorExtension.editor.view.dispatch(
				BlockTaggingEditorExtension.editor.view.state.tr.setMeta(TagFilteringPluginKey, tagFilters)
					.setSelection(
						tagFilters
							? TextSelection.create(BlockTaggingEditorExtension.editor.view.state.doc, 0, 0)
							: Selection.atStart(BlockTaggingEditorExtension.editor.view.state.doc)
					).scrollIntoView()
			);
			defer(() => {
				if (tagFilters) { BlockTaggingEditorExtension.editor.view.dom.blur(); }
				else { BlockTaggingEditorExtension.editor.view.focus(); }
			});
		}
		return true;
	};
	
	changeFile = async () => {
		if (checkSourceFileId(this.props.currentOpenFileId)) {
			FileStorageSystemClient.doGetSourceSavedTagFilters(this.props.currentOpenFileId.sourceId)
				.then(sourceSavedTagFilters => {
					if (!sourceSavedTagFilters) {
						this.props.dispatchSetToastAction({
							message: "Failed to retrieve source saved tag filters",
							severity: TOAST_SEVERITY.ERROR,
							open: true
						});
					} else {
						let filters = {}
						sourceSavedTagFilters.forEach(element => {
							filters[element] = element;
						});
						this.setState({sourceSavedTagFilters: filters});
					}
				});
		}
	};
	
	componentDidMount = () => {
		this.changeFile();
	};
	
	componentDidUpdate = prevProps => {
		if(this.props.currentOpenFileName.viewName === '' && prevProps.currentOpenFileId.sourceId !== this.props.currentOpenFileId.sourceId){
			document.getElementById(TAG_FILTERS_INPUT_ID).value = "";
			this.handleApplyTagFilters();
			this.setState({ sourceSavedTagFilters: {} });
			this.changeFile();
		}
	};
	
	render = () => {
		const noOpenFileIdCheck = checkNoOpenFileId(this.props.currentOpenFileId);
		const currentTagFiltersSaved =this.state.sourceSavedTagFilters.hasOwnProperty(this.state.currentTagFiltersStr);
		return(
			<AppBar position="static" class="custom-navbar">
				<Toolbar>
					<img className={"menuButton"} src={require('../images/logo.png')} style={{width: "40px", marginRight: "10px"}} alt={"MENU"}/>
					<Typography variant="h5" style={{fontFamily:"Bungee", color:"#F5F0E1"}}>
						YADA
					</Typography>
					<div style={{flexGrow: 1, marginLeft: "150px"}}>
						{this.props.currentOpenFileName.sourceName === '' ? null :
							<Breadcrumbs aria-label="breadcrumb" color="secondary" style={{marginRight: "10px", float: "left", border:"1px solid #F5F0E1", borderRadius: "10px", padding: "8px"}}>
								<Link color="inherit" style={{ color: "#F5F0E1",}}>
									<DescriptionIcon color="secondary"/>
									{this.props.currentOpenFileName.sourceName.length <= 11 ?  this.props.currentOpenFileName.sourceName : (this.props.currentOpenFileName.sourceName.substring(0,11) + "...")}
								</Link>
								{this.props.currentOpenFileName.viewName === '' ? null :
									<Link color="inherit" style={{color: "#F5F0E1"}}>
										{
											(this.props.currentOpenFileId.viewType === FILE_TYPE.CARD_VIEW) ?
												<AmpStoriesIcon color="secondary"/>:
												(this.props.currentOpenFileId.viewType === FILE_TYPE.TEXT_VIEW) ?
													<TextFieldsIcon color="secondary"/> :
													null
										}
										{this.props.currentOpenFileName.viewName}
									</Link>
								}
							</Breadcrumbs>
						}
						<Button
							variant="outlined"
							color="secondary"
							title="save"
							disabled={noOpenFileIdCheck || !this.props.saveDirtyFlag}
							onClick={this.handleSave}
							startIcon={<SaveIcon />}
							style= {{ borderRadius: "10px",paddingTop: "8px", paddingBottom: "8px", float: "left"}}
						>
							Save
						</Button>
						{
							this.props.currentOpenFileName.viewName === '' ?
								<div style={{backgroundColor: "rgba(245, 240, 225, 0.8)", marginLeft: "250px", width: "50vw", borderRadius: "10px", padding: "5px"}}>
									<Grid container>
										<Grid item xs={1}>
											<div style={{marginTop: "3px", marginLeft: "20px"}}>
												<SearchIcon color="primary"/>
											</div>
										</Grid>
										<Grid item xs={10}>
											<Autocomplete
												value={this.state.currentTagFiltersStr}
												id={TAG_FILTERS_INPUT_ID}
												freeSolo
												options={Object.entries(this.state.sourceSavedTagFilters)
													.map(([tagFiltersStr, _parsedTagFiltersStr]) => tagFiltersStr)}
												renderInput={(params) => (
													<TextField
														{...params}
														placeholder="Search with Tags: ( #{tag1} | !( #{tag2} ) ) & #{tag3}"
														style={{margin:"0%"}}
														margin="normal"
														variant="standard"
													/>
												)}
												onChange={(event, value, reason) => {
													this.setState({currentTagFiltersStr : value});
													this.handleStartModifyingTagFilters();
													if (reason === 'clear'){
														document.getElementById(TAG_FILTERS_INPUT_ID).value = '';
														this.handleApplyTagFilters();
													}
												}}
												onBlur={event => {
													if (this.handleApplyTagFilters()) { this.setState({ modifyingTagFilters: false }); }
													else {
														const input = event.target;
														defer(() => { input.focus(); });
													}
												}}
												onKeyDown={event => { if (event.key === 'Escape') { this.handleCancelModifyingTagFilters(); } }}
												onKeyPress={event => { if (event.key === 'Enter') { event.target.blur(); } }}
											/>
										</Grid>
										<Grid item xs={1}>
											<div style={{float: "right"}}>
												{ (this.state.modifyingTagFilters) ? null :
													(this.state.currentTagFiltersStr === '') ? null :
														(currentTagFiltersSaved) ?
															<IconButton title="Unpersist Filter" style={{padding: "0px", paddingRight: "10px", paddingTop: "5px"}}>
																<RemoveCircleIcon
																	color="primary"
																	onClick={() => {
																		document.getElementById(TAG_FILTERS_INPUT_ID).value = "";
																		this.handleUnpersistCurrentTagFilters();
																		this.handleApplyTagFilters();
																	}}
																/>
															</IconButton> :
															<IconButton title="Persist Filter" style={{padding: "0px", paddingRight: "10px", paddingTop: "5px"}}>
																<SaveIcon
																	color="primary"
																	onClick={() => {
																		this.handlePersistNewSavedTagFilters();
																	}}
																/>
															</IconButton>
													
												}
											</div>
										</Grid>
									</Grid>
								
								</div>
								: null
						}
					</div>
					<IconButton
						edge="end"
						aria-label="account of current user"
						aria-haspopup="true"
						color="inherit"
						style={{float: "right"}}
					>
						<AccountCircleIcon color="secondary"/>
					</IconButton>
				</Toolbar>
			</AppBar>
		)
	}
}

export default connect(
	state => ({
		currentOpenFileId: state.currentOpenFileId,
		currentOpenFileName: state.currentOpenFileName,
		backendModeSignedInStatus: state.backendModeSignedInStatus,
		tagsInView: state.tagsInView,
		saveDirtyFlag: state.saveDirtyFlag
	}),
	dispatch => ({
		dispatchSetBackendModeSignedInStatusAction: mode => dispatch(setBackendModeSignedInStatusAction(mode)),
		dispatchSetToastAction: toast => dispatch(setToastAction(toast)),
	}),
)(Navbar);
