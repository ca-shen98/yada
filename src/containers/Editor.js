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

  render = () => (
    <RichMarkdownEditor
      readOnly={this.props.editorReadOnly}
      defaultValue={localStorage.getItem(this.LOCAL_STORAGE_KEY) || ''}
      onChange={this.handleEditorChange}
    />
  );
}

export default connect(state => ({editorReadOnly: state.editorReadOnly}))(Editor);
