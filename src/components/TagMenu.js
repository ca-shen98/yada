import './TagMenu.css';
import {defer} from 'lodash';
import {v4 as uuidv4} from 'uuid';
import React from 'react';
import {connect} from 'react-redux';
import {
  SET_SAVE_DIRTY_FLAG_ACTION_TYPE,
  SET_MODIFYING_TAG_FILTERS_FLAG_ACTION_TYPE,
} from '../reducers/CurrentOpenFileState';
import {calculateFileIdKeyDerivedParameters} from './Navigator';
import {TAG_FILTERING_INPUT_ID} from './Editor';

import BlockTaggingEditorExtension from '../editor_extension/BlockTagging';

const BLOCK_NODE_TAGS_LIST_ID = 'block_node_tags_list';

const ADD_TAG_INPUT_ID = 'add_tag_input';

const TAG_VALUE_REGEX = /[^{}]/;
const INVALID_TAG_VALUE_REGEX = /[{}]/;

class TagMenu extends React.Component {

  state = { selectNodeAttrs: null }

  static getDerivedStateFromProps = props => {
    let selectNodeAttrs = null;
    if (props.selectNode) {
      const node = BlockTaggingEditorExtension.editor.view.state.doc.nodeAt(props.selectNode.pos);
      if (node && node.hasOwnProperty('attrs')) { selectNodeAttrs = node.attrs; }
    }
    return { selectNodeAttrs };
  };

  handleAddTag = () => {
    const tag = document.getElementById(ADD_TAG_INPUT_ID).value.trim();
    if (
      !tag || INVALID_TAG_VALUE_REGEX.test(tag) || !this.props.selectNode || !this.state.selectNodeAttrs
    ) { return false; }
    if (this.state.selectNodeAttrs['tags'] && this.state.selectNodeAttrs.tags.hasOwnProperty(tag)) {
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
    if (!this.props.saveDirtyFlag) { this.props.dispatchSetSaveDirtyFlagAction(); }
    return true;
  };

  handleDeleteTag = tag => {
    if (
      !this.props.selectNode || !this.state.selectNodeAttrs || !this.state.selectNodeAttrs['tags'] ||
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
    if (!this.props.saveDirtyFlag) { this.props.dispatchSetSaveDirtyFlagAction(); }
    return true;
  };

  handleTagClick = tag => {
    const tagFilteringInput = document.getElementById(TAG_FILTERING_INPUT_ID);
    const tagFilteringInputValue = tagFilteringInput.value.trim();
    this.props.dispatchSetModifyingTagFiltersFlagAction();
    defer(() => {
      tagFilteringInput.value =
        (tagFilteringInputValue ? '( ' + tagFilteringInputValue + ' ) & ' : '') + '#{' + tag + '}';
      tagFilteringInput.focus();
      tagFilteringInput.setSelectionRange(tagFilteringInput.value.length, tagFilteringInput.value.length);
    });
  };
  
  componentDidUpdate = prevProps => {
    if (
      prevProps.currentOpenFileIdKey.sourceIdKey !== this.props.currentOpenFileIdKey.sourceIdKey ||
      prevProps.currentOpenFileIdKey.viewIdKey !== this.props.currentOpenFileIdKey.viewIdKey ||
      (!prevProps.selectNode && this.props.selectNode) || (prevProps.selectNode && !this.props.selectNode) ||
      (prevProps.selectNode && this.props.selectNode && prevProps.selectNode.pos !== this.props.selectNode.pos)
    ) { document.getElementById(ADD_TAG_INPUT_ID).value = ''; }
  };

  render = () => {
    const { validFileIdKey } = calculateFileIdKeyDerivedParameters(this.props.currentOpenFileIdKey);
    return (
      <div className="MarginPane">
        <div id="tag_menu_wrapper">
          <div className="InputRow" id="add_tag_input_row">
            <input
              id={ADD_TAG_INPUT_ID}
              title="new tag"
              placeholder="new tag"
              disabled={!validFileIdKey || !this.props.selectNode}
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
              disabled={!validFileIdKey || !this.props.selectNode}
              onClick={this.handleAddTag}>
              {'+'}
            </button>
          </div>
          <div id="tag_menu_list_container">
            {
              validFileIdKey && this.props.selectNode && this.state.selectNodeAttrs &&
              this.state.selectNodeAttrs['tags'] && Object.keys(this.state.selectNodeAttrs.tags).length > 0
                ? <ul id={BLOCK_NODE_TAGS_LIST_ID}>
                    {
                      Object.keys(this.state.selectNodeAttrs.tags).map(tag =>
                        <li key={tag}>
                          <div className="ButtonRow">
                            <button
                              title="include in tag filters"
                              onClick={() => { this.handleTagClick(tag); }}>
                              {tag}
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
                    no {!validFileIdKey ? 'open doc' : (!this.props.selectNode ? 'selected block' : 'block tags')}
                  </div>
            }
          </div>
        </div>
      </div>
    );
  };
};

export default connect(
  state => ({
    selectNode: state.selectNode,
    saveDirtyFlag: state.saveDirtyFlag,
    currentOpenFileIdKey: state.currentOpenFileIdKey,
  }),
  dispatch => ({
    dispatchSetSaveDirtyFlagAction: () => dispatch({ type: SET_SAVE_DIRTY_FLAG_ACTION_TYPE }),
    dispatchSetModifyingTagFiltersFlagAction: () => dispatch({ type: SET_MODIFYING_TAG_FILTERS_FLAG_ACTION_TYPE }),
  }),
)(TagMenu);
