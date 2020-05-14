import React from "react";
import RichMarkdownEditor from 'rich-markdown-editor';
import { debounce } from 'lodash';

class Editor extends React.Component {
  handleEditorChange = debounce(value => {
    if (!this.props.editorReadOnly) {
      localStorage.setItem('saved', value());
    }
  }, 250);

  render = () => (
    <RichMarkdownEditor
      readOnly={this.props.editorReadOnly}
      defaultValue={localStorage.getItem('saved') || ''}
      onChange={this.handleEditorChange}
    />
  );
}

export default Editor;
