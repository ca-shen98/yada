import './TagMenu.css';
import {defer} from 'lodash';
import {v4 as uuidv4} from 'uuid';
import React from 'react';
import {connect} from 'react-redux';
import {SAVE_DIRTY_STATUS, setSaveDirtyStatusAction} from '../reducers/CurrentOpenFileState';

import BlockTaggingEditorExtension from '../editor_extension/BlockTagging';
import {setToastAction, TOAST_SEVERITY} from "../reducers/Toast";
import OutlinedInput from '@material-ui/core/OutlinedInput';
import AddCircleIcon from '@material-ui/icons/AddCircle';
import InputAdornment from '@material-ui/core/InputAdornment';
import IconButton from '@material-ui/core/IconButton';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import ListSubheader from '@material-ui/core/ListSubheader';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import DeleteIcon from '@material-ui/icons/Delete';
import EditIcon from '@material-ui/icons/Edit';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import Popover from '@material-ui/core/Popover';
import CheckIcon from '@material-ui/icons/Check';
import Input from '@material-ui/core/Input';
import Chip from '@material-ui/core/Chip';

const RENAME_TAG_FIELD = 'rename_field';

const ADD_TAG_INPUT_ID = 'add_tag_input';

const TAG_VALUE_REGEX = /[^{}]/;
const INVALID_TAG_VALUE_REGEX = /[{}]/;

class TagListItem extends React.Component {
  render = () => 
    <div style={{width:"100%", display: "flex", alignItems: "center"}}>
      <Chip
        label={this.props.tagValue}
        color="primary"
        onDelete={(event) => this.props.handleEditMenuClick(event, this.props.tagValue)}
        deleteIcon={<MoreVertIcon color="secondary"/>}
        style={{width: "100%", justifyContent: "space-between"}}
        variant="outlined"
      />
    </div>
};

class TagMenu extends React.Component {

  state = { selectNodeAttrs: {}, modifying: '', editMenuAnchorElement: null, renamePopoverElement: null, currentTag: '' }

  handleAddTag = () => {
    const tag = document.getElementById(ADD_TAG_INPUT_ID).value.trim();
    if (!tag || INVALID_TAG_VALUE_REGEX.test(tag) || !this.props.selectNode) { return false; }
    if (this.state.selectNodeAttrs.hasOwnProperty('tags') && this.state.selectNodeAttrs.tags.hasOwnProperty(tag)) {
      this.props.dispatchSetToastAction({
        message: `Tag value "${tag}" already exists`,
        severity: TOAST_SEVERITY.ERROR,
        open: true
      });
      return false;
    }
    const newSelectNodeAttrs = { ...this.state.selectNodeAttrs, tags: {...this.state.selectNodeAttrs.tags} };
    newSelectNodeAttrs.tags[tag] = uuidv4();
    BlockTaggingEditorExtension.editor.view.dispatch(
      BlockTaggingEditorExtension.editor.view.state.tr.setNodeMarkup(
        this.props.selectNode.pos,
        null,
        newSelectNodeAttrs,
      )
    );
    this.setState({ selectNodeAttrs: newSelectNodeAttrs });
    this.props.dispatchSetSaveDirtyStatusAction(SAVE_DIRTY_STATUS.DIRTY);
    document.getElementById(ADD_TAG_INPUT_ID).value = '';
    return true;
  };

  handleDeleteTag = () => {
    this.handleEditMenuClose();
    if (
      !this.props.selectNode || !this.state.selectNodeAttrs.hasOwnProperty('tags') ||
      !this.state.selectNodeAttrs.tags.hasOwnProperty(this.state.currentTag)
    ) { return false; }
    const newSelectNodeAttrs = { ...this.state.selectNodeAttrs, tags: {...this.state.selectNodeAttrs.tags} };
    delete newSelectNodeAttrs.tags[this.state.currentTag];
    BlockTaggingEditorExtension.editor.view.dispatch(
      BlockTaggingEditorExtension.editor.view.state.tr.setNodeMarkup(
        this.props.selectNode.pos,
        null,
        newSelectNodeAttrs,
      )
    );
    this.setState({ selectNodeAttrs: newSelectNodeAttrs, currentTag : '' });
    this.props.dispatchSetSaveDirtyStatusAction(SAVE_DIRTY_STATUS.DIRTY);
    return true;
  };

  handleModifyTagValue = () => {
    const newTagValue = document.getElementById(RENAME_TAG_FIELD).value.trim();
    if (
      !newTagValue || INVALID_TAG_VALUE_REGEX.test(newTagValue) || !this.props.selectNode ||
      !this.state.selectNodeAttrs.hasOwnProperty('tags') ||
      !this.state.selectNodeAttrs.tags.hasOwnProperty(this.state.currentTag)
    ) { return false; }
    if (newTagValue === this.state.currentTag) { return true; }
    if (this.state.selectNodeAttrs.tags.hasOwnProperty(newTagValue)) {
      this.props.dispatchSetToastAction({
        message: `Tag value ${newTagValue} already exists`,
        severity: TOAST_SEVERITY.ERROR,
        open: true
      });
      return false;
    }
    const newSelectNodeAttrs = { ...this.state.selectNodeAttrs, tags: {...this.state.selectNodeAttrs.tags} };
    newSelectNodeAttrs.tags[newTagValue] = newSelectNodeAttrs.tags[this.state.currentTag];
    delete newSelectNodeAttrs.tags[this.state.currentTag];
    BlockTaggingEditorExtension.editor.view.dispatch(
      BlockTaggingEditorExtension.editor.view.state.tr.setNodeMarkup(
        this.props.selectNode.pos,
        null,
        newSelectNodeAttrs,
      )
    );
    this.setState({ selectNodeAttrs: newSelectNodeAttrs });
    this.props.dispatchSetSaveDirtyStatusAction(SAVE_DIRTY_STATUS.DIRTY);
    return true;
  };
  
  componentDidUpdate = prevProps => {
    if (
      prevProps.currentOpenFileId.sourceId !== this.props.currentOpenFileId.sourceId ||
      prevProps.currentOpenFileId.viewId !== this.props.currentOpenFileId.viewId ||
      (!prevProps.selectNode && this.props.selectNode) || (prevProps.selectNode && !this.props.selectNode) ||
      (prevProps.selectNode && this.props.selectNode && prevProps.selectNode.pos !== this.props.selectNode.pos)
    ) {
      document.getElementById(ADD_TAG_INPUT_ID).value = '';
      defer(() => {
        if (this.props.selectNode) {
          const node = BlockTaggingEditorExtension.editor.view.state.doc.nodeAt(this.props.selectNode.pos);
          this.setState({ selectNodeAttrs: {...(node && node.hasOwnProperty('attrs') ? node.attrs : null)} });
        } else { this.setState({ selectNodeAttrs: {} }); }
      });
    }
  };

  handleEditMenuClick = (event, tag) => {
    this.setState({
      editMenuAnchorElement: event.currentTarget,
      currentTag: tag
    })
  }

  handleEditMenuClose = () => {
    this.setState({
      editMenuAnchorElement: null
    })
  }

  handleRenameMenuClick = (event) => {
    this.setState({
      renamePopoverElement: this.state.editMenuAnchorElement,
      editMenuAnchorElement: null
    })
  }

  handleRenamePopoverClose = () => {
    this.setState({
      renamePopoverElement: null
    })
  }

  render = () => 
    <div className="MarginPane">
      <div id="tag_menu_wrapper">
        <div className="InputRow" id="add_tag_input_row">
          <OutlinedInput
            id={ADD_TAG_INPUT_ID}
            title="New Tag"
            placeholder="New Tag"
            color="primary"
            disabled={!this.props.selectNode}
            onKeyPress={event=> {
              if (event.key === 'Enter' && this.handleAddTag()) { event.target.value = ''; }
              if (!TAG_VALUE_REGEX.test(event.key)) { event.preventDefault(); }
            }}
            onKeyDown={event=> {
              if (event.key === 'Escape') {
                event.target.value = '';
                BlockTaggingEditorExtension.editor.view.focus();
              }
            }}
            endAdornment={
              <InputAdornment position="end">
                <IconButton
                  aria-label="Add"
                  title="add"
                  disabled={!this.props.selectNode}
                  onClick={this.handleAddTag}
                  edge="end"
                >
                  <AddCircleIcon color="primary" />
                </IconButton>
              </InputAdornment>
            }
            margin="dense"
          />
        </div>
        <div id="tag_menu_list_container">
          {
            this.props.selectNode && this.state.selectNodeAttrs.hasOwnProperty('tags') &&
            Object.keys(this.state.selectNodeAttrs.tags).length > 0
              ? <List
                  component="nav"
                  aria-labelledby="nested-list-subheader"
                  subheader={
                    <ListSubheader component="div" id="nested-list-subheader">
                      Tags
                    </ListSubheader>
                  }
                  style={{"maxWidth" : 360, "width" : '100%'}}
                >
                  {
                    Object.keys(this.state.selectNodeAttrs.tags).map((tag) =>
                      <ListItem
                       dense={true}
                      >
                        <TagListItem 
                          tagValue = {tag}
                          handleEditMenuClick={this.handleEditMenuClick}
                        />
                      </ListItem>
                    )
                  }
                </List>
              : <div className="PlaceholderDivWithText" id="no_tags_placeholder">
                  {'No ' + (!this.props.selectNode ? 'Selected Block' : 'Block Tags')}
                </div>
          }
          <Menu
            id="edit_menu"
            anchorEl={this.state.editMenuAnchorElement}
            keepMounted
            open={Boolean(this.state.editMenuAnchorElement)}
            onClose={() => this.handleEditMenuClose()}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'center',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
          >
              <MenuItem onClick={() => this.handleRenameMenuClick()}>
                <ListItemIcon>
                  <EditIcon fontSize="small" color="primary"  />
                </ListItemIcon>
                <ListItemText primary="Rename" color="primary"/>
              </MenuItem>
              <MenuItem onClick={() => this.handleDeleteTag()}>
                <ListItemIcon>
                  <DeleteIcon fontSize="small" color="primary"/>
                </ListItemIcon>
                <ListItemText primary="Delete" color="primary"/>
              </MenuItem>
          </Menu>
          <Popover
            open={Boolean(this.state.renamePopoverElement)}
            anchorEl={this.state.renamePopoverElement}
            anchorOrigin={{
              vertical:'top',
              horizontal: 'right'
            }}
            transformOrigin={{
              vertical:'top',
              horizontal: 'right'
            }}
            id="rename_popover"
          >
            <Input
              id={RENAME_TAG_FIELD}
              autoFocus={true}
              defaultValue={this.state.currentTag}
              onBlur={event => {this.handleModifyTagValue();                      
                                this.handleRenamePopoverClose();
              }}
              onKeyDown={event => {
                if (event.key === 'Escape') { event.target.value = this.state.currentTag; }
              }}
              onKeyPress={event => {
                if (event.key === 'Enter') { event.target.blur(); }
                if (!TAG_VALUE_REGEX.test(event.key)) { event.preventDefault(); }
              }}
              endAdornment={
                <InputAdornment position="end">
                  <IconButton 
                    onClick= {() => {
                      this.handleModifyTagValue();
                      this.handleRenamePopoverClose();
                    }}
                  >
                      <CheckIcon/>
                  </IconButton>
                </InputAdornment>
              }
              disableUnderline={true}
              fullWidth={true}
              style={{height:"50px", "paddingLeft": "10px"}}
            />
          </Popover>
        </div>
      </div>
    </div>;
};

export default connect(
  state => ({
    selectNode: state.selectNode,
    saveDirtyStatus: state.saveDirtyStatus,
    currentOpenFileId: state.currentOpenFileId,
  }),
  dispatch => ({
    dispatchSetSaveDirtyStatusAction: status => dispatch(setSaveDirtyStatusAction(status)),
    dispatchSetToastAction: toast => dispatch(setToastAction(toast)),
  }),
)(TagMenu);
