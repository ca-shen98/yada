import React from 'react';
import {connect} from 'react-redux';
import {debounce} from 'lodash';
import RichMarkdownEditor from 'rich-markdown-editor';
import FilterBar from '../components/FilterBar';
import {
  DOC_SOURCE_NAME_KEY_LOCAL_STORAGE_KEY_PREFIX,
  DOC_VIEWS_NAME_KEY_LOCAL_STORAGE_KEY_PREFIX,
  DOC_TAGS_LOCAL_STORAGE_KEY_PREFIX,
  SOURCE_FILE_NAME
} from '../reducers/SetFile';

class Editor extends React.Component {

  handleEditorChange = debounce(value => {
    if (!this.props.readOnly) {
      localStorage.setItem(DOC_SOURCE_NAME_KEY_LOCAL_STORAGE_KEY_PREFIX + this.props.docNameKey, value(true));
    }
  }, 250);

  render = () => {
    let value = '';
    if (this.props.fileNameKey !== SOURCE_FILE_NAME) {
      const docTagsStr = localStorage.getItem(DOC_TAGS_LOCAL_STORAGE_KEY_PREFIX + this.props.docNameKey);
      const docTags = docTagsStr ? JSON.parse(docTagsStr) : {};
      const docViews =
        JSON.parse(localStorage.getItem(DOC_VIEWS_NAME_KEY_LOCAL_STORAGE_KEY_PREFIX + this.props.docNameKey));
      const viewTags = docViews[this.props.fileNameKey];
      if (viewTags.length > 0) {
        value = JSON.stringify({
          type: 'doc',
          content: viewTags.map(tag => docTags[tag.tag][tag.id]),
        });
      }
    } else {
      value = localStorage.getItem(DOC_SOURCE_NAME_KEY_LOCAL_STORAGE_KEY_PREFIX + this.props.docNameKey) || '';
    }
    return (
      <div className="MainPane">
        <FilterBar />
        <div className="Editor">
          <RichMarkdownEditor
            key={this.props.docNameKey + '.' + this.props.fileNameKey}
            defaultValue={value}
            jsonStrValue={!(!value)}
            tagFilters={this.props.tagFiltersExpr}
            readOnly={this.props.readOnly}
            onChange={this.handleEditorChange}
          />
        </div>
      </div>
    );
  };
}

export default connect(
  state => ({
    docNameKey: state.file.docNameKey,
    fileNameKey: state.file.fileNameKey,
    tagFiltersExpr: state.tagFilters.expr,
    readOnly: state.readOnly,
  }),
)(Editor);
