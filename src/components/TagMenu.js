import './TagMenu.css';
import {defer} from 'lodash';
import {v4 as uuidv4} from 'uuid';
import React from 'react';
import {connect} from 'react-redux';
import {SET_SAVE_DIRTY_FLAG_ACTION_TYPE} from '../reducers/CurrentOpenFileState';

import BlockTaggingEditorExtension from '../editor_extension/BlockTagging';

const BLOCK_NODE_TAGS_LIST_ID = 'block_node_tags_list';

const ADD_TAG_INPUT_ID = 'add_tag_input';

const MODIFY_TAG_INPUT_ID_PREFIX = 'modify_tag_input_';

const TAG_VALUE_REGEX = /[^{}]/;
const INVALID_TAG_VALUE_REGEX = /[{}]/;

class TagMenu extends React.Component {

  state = { selectNodeAttrs: {}, modifying: '' }

  handleAddTag = () => {
    const tag = document.getElementById(ADD_TAG_INPUT_ID).value.trim();
    if (!tag || INVALID_TAG_VALUE_REGEX.test(tag) || !this.props.selectNode) { return false; }
    if (this.state.selectNodeAttrs.hasOwnProperty('tags') && this.state.selectNodeAttrs.tags.hasOwnProperty(tag)) {
      alert('tag value "' + tag + '" already exists');
      return false;
    }
    const newSelectNodeAttrs = {...this.state.selectNodeAttrs};
    if (!newSelectNodeAttrs['tags']) { newSelectNodeAttrs['tags'] = {}; }
    newSelectNodeAttrs.tags[tag] = uuidv4();
    BlockTaggingEditorExtension.editor.view.dispatch(
      BlockTaggingEditorExtension.editor.view.state.tr.setNodeMarkup(
        this.props.selectNode.pos,
        null,
        newSelectNodeAttrs,
      )
    );
    this.props.dispatchSetSaveDirtyFlagAction();
    return true;
  };

  handleDeleteTag = tag => {
    if (
      !this.props.selectNode || !this.state.selectNodeAttrs.hasOwnProperty('tags') ||
      !this.state.selectNodeAttrs.tags.hasOwnProperty(tag)
    ) { return false; }
    const newSelectNodeAttrs = {...this.state.selectNodeAttrs};
    delete newSelectNodeAttrs.tags[tag];
    BlockTaggingEditorExtension.editor.view.dispatch(
      BlockTaggingEditorExtension.editor.view.state.tr.setNodeMarkup(
        this.props.selectNode.pos,
        null,
        newSelectNodeAttrs,
      )
    );
    this.props.dispatchSetSaveDirtyFlagAction();
    return true;
  };

  handleModifyTagValue = oldTagValue => {
    const newTagValue = document.getElementById(MODIFY_TAG_INPUT_ID_PREFIX + oldTagValue).value.trim();
    if (
      !newTagValue || INVALID_TAG_VALUE_REGEX.test(newTagValue) || !this.props.selectNode ||
      !this.state.selectNodeAttrs.hasOwnProperty('tags') ||
      !this.state.selectNodeAttrs.tags.hasOwnProperty(oldTagValue)
    ) { return false; }
    if (newTagValue === oldTagValue) { return true; }
    if (this.state.selectNodeAttrs.tags.hasOwnProperty(newTagValue)) {
      alert('tag value "' + newTagValue + '" already exists');
      return false;
    }
    const newSelectNodeAttrs = {...this.state.selectNodeAttrs};
    newSelectNodeAttrs.tags[newTagValue] = newSelectNodeAttrs.tags[oldTagValue];
    delete newSelectNodeAttrs.tags[oldTagValue];
    BlockTaggingEditorExtension.editor.view.dispatch(
      BlockTaggingEditorExtension.editor.view.state.tr.setNodeMarkup(
        this.props.selectNode.pos,
        null,
        newSelectNodeAttrs,
      )
    );
    this.props.dispatchSetSaveDirtyFlagAction();
    return true;
  };

  handleStartModifyingTagValue = (tag) => {
    this.setState({ modifying: tag });
    defer(() => {
      const input = document.getElementById(MODIFY_TAG_INPUT_ID_PREFIX + tag);
      input.focus();
      input.setSelectionRange(0, input.value.length);
    });
  };
  
  componentDidUpdate = prevProps => {
    if (
      prevProps.currentOpenFileId.sourceId !== this.props.currentOpenFileId.sourceId ||
      prevProps.currentOpenFileId.viewId !== this.props.currentOpenFileId.viewId ||
      (!prevProps.selectNode && this.props.selectNode) || (prevProps.selectNode && !this.props.selectNode) ||
      (prevProps.selectNode && this.props.selectNode && prevProps.selectNode.pos !== this.props.selectNode.pos)
    ) {
      document.getElementById(ADD_TAG_INPUT_ID).value = '';
      let selectNodeAttrs = {};
      if (this.props.selectNode) {
        const node = BlockTaggingEditorExtension.editor.view.state.doc.nodeAt(this.props.selectNode.pos);
        if (node && node.hasOwnProperty('attrs')) { selectNodeAttrs = {...node.attrs}; }
      }
      this.setState({ selectNodeAttrs });
    }
  };

  render = () =>
    <div className="MarginPane">
      <div id="tag_menu_wrapper">
        <div className="InputRow" id="add_tag_input_row">
          <input
            id={ADD_TAG_INPUT_ID}
            title="new tag"
            placeholder="new tag"
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
          />
          <button
            className="MonospaceCharButton"
            title="add"
            disabled={!this.props.selectNode}
            onClick={this.handleAddTag}>
            {'+'}
          </button>
        </div>
        <div id="tag_menu_list_container">
          {
            this.props.selectNode && this.state.selectNodeAttrs.hasOwnProperty('tags') &&
            Object.keys(this.state.selectNodeAttrs.tags).length > 0
              ? <ul id={BLOCK_NODE_TAGS_LIST_ID}>
                  {
                    Object.keys(this.state.selectNodeAttrs.tags).map(tag =>
                      <li key={tag}>
                        <div className="ButtonRow">
                          <input
                            id={MODIFY_TAG_INPUT_ID_PREFIX + tag}
                            defaultValue={tag}
                            placeholder={tag}
                            disabled={this.state.modifying !== tag}
                            onBlur={event => {
                              if (this.handleModifyTagValue(tag)) {
                                if (this.state.modifying === tag) { this.setState({ modifying: '' }); }
                              } else { event.target.focus(); }
                            }}
                            onKeyDown={event => {
                              if (event.key === 'Escape') {
                                event.target.value = tag;
                                event.target.setSelectionRange(0, 0);
                                if (this.state.modifying === tag) { this.setState({ modifying: '' }); }
                              }
                            }}
                            onKeyPress={event => {
                              if (event.key === 'Enter') { event.target.blur(); }
                              if (!TAG_VALUE_REGEX.test(event.key)) { event.preventDefault(); }
                            }}
                          />
                          <button
                            className="MonospaceCharButton"
                            title="modify"
                            hidden={this.state.modifying === tag}
                            onClick={() => { this.handleStartModifyingTagValue(tag); }}>
                            {'#'}
                          </button>
                          <button
                            className="MonospaceCharButton"
                            title="remove"
                            onClick={() => { this.handleDeleteTag(tag); }}>
                            {'-'}
                          </button>
                        </div>
                      </li>
                    )
                  }
                </ul>
              : <div className="PlaceholderDivWithText" id="no_tags_placeholder">
                  {'no ' + (!this.props.selectNode ? 'selected block' : 'block tags')}
                </div>
          }
        </div>
      </div>
    </div>;
};

export default connect(
  state => ({
    selectNode: state.selectNode,
    saveDirtyFlag: state.saveDirtyFlag,
    currentOpenFileId: state.currentOpenFileId,
  }),
  dispatch => ({ dispatchSetSaveDirtyFlagAction: () => dispatch({ type: SET_SAVE_DIRTY_FLAG_ACTION_TYPE }) }),
)(TagMenu);
