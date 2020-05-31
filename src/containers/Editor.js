import React from 'react';
import RichMarkdownEditor from 'rich-markdown-editor';
import {connect} from 'react-redux';
import {debounce} from 'lodash';

class Editor extends React.Component {
  FILE_NAME_PREFIX_LOCAL_STORAGE_KEY = 'file_';

  handleEditorChange = debounce(value => {
    if (!this.props.editorReadOnly) {
      localStorage.setItem(this.FILE_NAME_PREFIX_LOCAL_STORAGE_KEY + this.props.fileNameKey, value());
    }
  }, 250);

  traverse(rootNode, levelIndent){
    if(rootNode.isText){
      console.log(levelIndent + rootNode.text);
    }
    if(!rootNode.isLeaf){
      for(let i = 0 ; i < rootNode.childCount; i++){
        this.traverse(rootNode.child(i), levelIndent + "\t");
      }
    }
  }

  handleModelChange = (node) => {
    console.log("got here");
    this.traverse(node, "");
    return node;
  }

  render = () => {
    const {body} = document;
    if (body) body.style.backgroundColor = this.props.editorDarkMode ? '#181A1B' : '#FFF';
    return (
      <RichMarkdownEditor
        readOnly={this.props.editorReadOnly}
        dark={this.props.editorDarkMode}
        key={this.props.fileNameKey}
        defaultValue={localStorage.getItem(this.FILE_NAME_PREFIX_LOCAL_STORAGE_KEY + this.props.fileNameKey) || ''}
        tagFilters={this.props.tagFilters}
        onChange={this.handleEditorChange}
        onModelChange={this.handleModelChange}
      />
    );
  };
}

export default connect(
  state => ({
    editorDarkMode: state.editorDarkMode,
    editorReadOnly: state.editorReadOnly,
    fileNameKey: state.fileNameKey,
    tagFilters: state.tagFilters,
  }),
)(Editor);
