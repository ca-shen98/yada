import React from 'react';
import RichMarkdownEditor from 'rich-markdown-editor';
import {connect} from 'react-redux';
import {debounce} from 'lodash';
import {FILE_NAME_PREFIX_LOCAL_STORAGE_KEY} from '../reducers/ChangeFileNameKey';

class Editor extends React.Component {

  handleEditorChange = debounce(value => {
    if (!this.props.editorReadOnly) {
      localStorage.setItem(FILE_NAME_PREFIX_LOCAL_STORAGE_KEY + this.props.fileNameKey, value());
    }
  }, 250);

  render = () => {
    const {body} = document;
    if (body) body.style.backgroundColor = this.props.editorDarkMode ? '#181A1B' : '#FFF';
    return (
      <RichMarkdownEditor
        readOnly={this.props.editorReadOnly}
        dark={this.props.editorDarkMode}
        key={this.props.fileNameKey}
        defaultValue={localStorage.getItem(FILE_NAME_PREFIX_LOCAL_STORAGE_KEY + this.props.fileNameKey) || ''}
        tagFilters={this.props.tagFiltersExpr}
        onChange={this.handleEditorChange}
      />
    );
  };
}

export default connect(
  state => ({
    editorDarkMode: state.editorDarkMode,
    editorReadOnly: state.editorReadOnly,
    fileNameKey: state.fileNameKey,
    tagFiltersExpr: state.tagFilters.expr,
  }),
)(Editor);
