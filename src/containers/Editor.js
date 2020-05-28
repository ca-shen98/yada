import React from "react";
import RichMarkdownEditor from 'rich-markdown-editor';
import {connect} from 'react-redux';
import {debounce} from 'lodash';

class Editor extends React.Component {
  CONTENT_LOCAL_STORAGE_KEY = 'saved';
  FILTERS_LOCAL_STORAGE_KEY = 'filters';

  handleEditorChange = debounce(value => {
    if (!this.props.editorReadOnly) {
      localStorage.setItem(this.CONTENT_LOCAL_STORAGE_KEY, value());
    }
  }, 250);

  traverse(rootNode, levelIndent){
    let filter = localStorage.getItem(this.FILTERS_LOCAL_STORAGE_KEY)
    console.log("filter = " + filter)
    console.log("n = " + rootNode);
    console.log(rootNode);
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
    // TODO: pull out tags here?
    this.traverse(node, "");
    return node;
  }

  render() {
    const {body} = document;
    if (body) body.style.backgroundColor = this.props.editorDarkMode ? "#181A1B" : "#FFF";
    return (
      <RichMarkdownEditor
        readOnly={this.props.editorReadOnly}
        dark={this.props.editorDarkMode}
        defaultValue={localStorage.getItem(this.CONTENT_LOCAL_STORAGE_KEY) || ''}
        onChange={this.handleEditorChange}
        onModelChange={this.handleModelChange}
      />
    );
  };
}

export default connect(state => ({editorDarkMode: state.editorDarkMode, editorReadOnly: state.editorReadOnly}))(Editor);
