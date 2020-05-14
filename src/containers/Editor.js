import React from "react";
import RichMarkdownEditor from 'rich-markdown-editor';
import {connect} from 'react-redux';
import {debounce} from 'lodash';

class Editor extends React.Component {
  LOCAL_STORAGE_KEY = 'saved';

  handleEditorChange = debounce(value => {
    if (!this.props.editorReadOnly) {
      localStorage.setItem(this.LOCAL_STORAGE_KEY, value());
    }
  }, 250);

  render() {
    const {body} = document;
    if (body) body.style.backgroundColor = this.props.editorDarkMode ? "#181A1B" : "#FFF";
    return (
      <RichMarkdownEditor
        readOnly={this.props.editorReadOnly}
        dark={this.props.editorDarkMode}
        defaultValue={localStorage.getItem(this.LOCAL_STORAGE_KEY) || ''}
        onChange={this.handleEditorChange}
      />
    );
  };
}

export default connect(state => ({editorDarkMode: state.editorDarkMode, editorReadOnly: state.editorReadOnly}))(Editor);
