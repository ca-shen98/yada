import React from 'react';
import RichMarkdownEditor from 'rich-markdown-editor';
import FilterBar from "../components/FilterBar";
import {connect} from 'react-redux';
import {debounce} from 'lodash';
import {FILE_NAME_KEY_PREFIX_LOCAL_STORAGE_KEY} from '../reducers/ChangeFileNameKey';

class Editor extends React.Component {

  handleEditorChange = debounce(value => {
    if (!this.props.readOnly) {
      localStorage.setItem(FILE_NAME_KEY_PREFIX_LOCAL_STORAGE_KEY + this.props.fileNameKey, value());
    }
  }, 250);

  render = () => (
    <div className="MainPane">
      <FilterBar />
      <div className="Editor">
        <RichMarkdownEditor
          readOnly={this.props.readOnly}
          key={this.props.fileNameKey}
          defaultValue={localStorage.getItem(FILE_NAME_KEY_PREFIX_LOCAL_STORAGE_KEY + this.props.fileNameKey) || ''}
          tagFilters={this.props.tagFiltersExpr}
          onChange={this.handleEditorChange}
        />
      </div>
    </div>
  );
}

export default connect(
  state => ({ readOnly: state.readOnly, fileNameKey: state.fileNameKey, tagFiltersExpr: state.tagFilters.expr }),
)(Editor);
