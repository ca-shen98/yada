import React from 'react';
import {connect} from 'react-redux';
import Actions from '../../actions';
import { Node } from '../../../node_modules/rich-markdown-editor/node_modules/prosemirror-model';
import {SOURCE_FILE_NAME_TYPE} from '../../reducers/SetFile';

const BLOCK_TAGS_INPUT_ID = 'block_tags_input';
// const BLOCK_TAGS_REGEX = /^(#{[^#{}]+})?( *[,;]? *#{[^#{}]+})*$/;

class TagMenu extends React.Component {
  selectNodeUpdate = false;
  blockTagsUpdate = false;

  handleBlockTagsKeyPress = event => { if (event.key === 'Enter') { this.handleUpdateBlockTags(); } };

  handleUpdateBlockTags = () => {
    let blockTagsInput = {};
    try { blockTagsInput = JSON.parse(document.getElementById(BLOCK_TAGS_INPUT_ID).value); }
    catch (e) {
      document.getElementById(BLOCK_TAGS_INPUT_ID).value = this.getLoadBlockTags();
      return;
    }
    const newNode = JSON.parse(this.props.selectNode.node);
    newNode.attrs.tags = blockTagsInput;
    this.props.setSelectNode({
      pos: this.props.selectNode.pos,
      idx: this.props.selectNode.idx,
      parent: this.props.selectNode.parent,
      node: JSON.stringify(newNode),
    });
    const tr = this.props.tagBlocksEditorExtension.editor.view.state.tr.setNodeMarkup(
      this.props.selectNode.pos,
      null,
      newNode.attrs
    );
    this.props.tagBlocksEditorExtension.editor.view.dispatch(tr);
    this.blockTagsUpdate = true;
  };

  getLoadBlockTags = () => {
    const blockTags = this.props.selectNode ? JSON.parse(this.props.selectNode.node).attrs.tags : {};
    return JSON.stringify(blockTags);
  };

  shouldComponentUpdate = nextProps => {
    if (this.props.fileType !== nextProps.fileType || this.props.readOnly !== nextProps.readOnly) { return true; }
    if (this.blockTagsUpdate) {
      this.blockTagsUpdate = false;
      return this.blockTagsUpdate;
    }
    this.selectNodeUpdate = !((!this.props.selectNode && !nextProps.selectNode) || (
      this.props.selectNode && nextProps.selectNode &&
      Node.fromJSON(
        this.props.tagBlocksEditorExtension.editor.schema,
        JSON.parse(this.props.selectNode.node)
      ).eq(Node.fromJSON(
        this.props.tagBlocksEditorExtension.editor.schema,
        JSON.parse(nextProps.selectNode.node)
      ))
    ));
    return this.selectNodeUpdate;
  };

  componentDidUpdate = () => {
    if (this.selectNodeUpdate) {
      document.getElementById(BLOCK_TAGS_INPUT_ID).value = this.getLoadBlockTags();
      this.selectNodeUpdate = false;
    }
  };

  render = () => (
    <div>
      <input
        type="text"
        id={BLOCK_TAGS_INPUT_ID}
        onKeyPress={this.handleBlockTagsKeyPress}
        disabled={this.props.fileType !== SOURCE_FILE_NAME_TYPE || this.props.readOnly}
        defaultValue={this.getLoadBlockTags()}
      />
      <button
          type="button"
          onClick={this.handleUpdateBlockTags}
          disabled={this.props.fileType !== SOURCE_FILE_NAME_TYPE || this.props.readOnly}>
        #
      </button>
    </div>
  );
}

export default connect(
  state => ({ readOnly: state.readOnly, selectNode: state.selectNode, fileType: state.file.fileType }),
  dispatch => ({ setSelectNode: selectNode => dispatch(Actions.setSelectNode(selectNode)) })
)(TagMenu);
