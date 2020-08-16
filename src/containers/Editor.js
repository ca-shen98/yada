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

  static updateDocBlocks = (parent, childIdx, node, updatedDocTags) => {
    if (node.hasOwnProperty('attrs') && node.attrs.hasOwnProperty('tags')) {
      for (const tag of Object.keys(node.attrs.tags)) {
        const tagId = node.attrs.tags[tag];
        if (updatedDocTags.hasOwnProperty(tag) && updatedDocTags[tag].hasOwnProperty(tagId)) {
          parent.content[childIdx] = updatedDocTags[tag][tagId];
          return;
        }
      }
    }
    if (node.type !== 'paragraph' && node.type !== 'heading' && node.hasOwnProperty('content')) {
      for (let i = 0; i < node.content.length; ++i) {
        Editor.updateDocBlocks(node, i, node.content[i], updatedDocTags);
      }
    }
  }

  handleEditorChange = debounce(value => {
    if (!this.props.readOnly) {
      const docNodeStr = value(true);
      const docNode = JSON.parse(docNodeStr);
      const docTagsStr = localStorage.getItem(DOC_TAGS_LOCAL_STORAGE_KEY_PREFIX + this.props.docNameKey);
      const docTags = docTagsStr ? JSON.parse(docTagsStr) : {};
      const updatedDocTags = {};
      const nodes = [];
      for (const node of docNode.content) { nodes.push(node); }
      while (nodes.length > 0) {
        const node = nodes.shift();
        let save = true;
        if (node.hasOwnProperty('attrs') && node.attrs.hasOwnProperty('tags')) {
          for (const tag of Object.keys(node.attrs.tags)) {
            const tagId = node.attrs.tags[tag];
            if (!docTags.hasOwnProperty(tag) || !docTags[tag].hasOwnProperty(tagId)) {
              save = false;
              break;
            }
            docTags[tag][tagId] = node;
            if (!updatedDocTags.hasOwnProperty(tag)) { updatedDocTags[tag] = {}; }
            updatedDocTags[tag][tagId] = node;
          }
        }
        if (save && node.type !== 'paragraph' && node.type !== 'heading' && node.hasOwnProperty('content')) {
          for (const child of node.content) { nodes.push(child); }
        }
      }
      localStorage.setItem(DOC_TAGS_LOCAL_STORAGE_KEY_PREFIX + this.props.docNameKey, JSON.stringify(docTags));
      let docSourceStr = docNodeStr;
      if (this.props.fileNameKey !== SOURCE_FILE_NAME) {
        const docSource =
          JSON.parse(localStorage.getItem(DOC_SOURCE_NAME_KEY_LOCAL_STORAGE_KEY_PREFIX + this.props.docNameKey));
        for (let i = 0; i < docSource.content.length; ++i) {
          Editor.updateDocBlocks(docSource, i, docSource.content[i], updatedDocTags);
        }
        docSourceStr = JSON.stringify(docSource);
      }
      localStorage.setItem(DOC_SOURCE_NAME_KEY_LOCAL_STORAGE_KEY_PREFIX + this.props.docNameKey, docSourceStr);
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
