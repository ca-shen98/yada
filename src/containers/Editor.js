import React from 'react';
import {connect} from 'react-redux';
import {debounce} from 'lodash';
import {getDocument, putDocument} from '../backend/yaas'
import RichMarkdownEditor from 'rich-markdown-editor';
import FilterBar from '../components/FilterBar';
import {
  DOC_SOURCE_NAME_KEY_LOCAL_STORAGE_KEY_PREFIX,
  DOC_VIEWS_NAME_KEY_LOCAL_STORAGE_KEY_PREFIX,
  SOURCE_FILE_NAME_TYPE,
  CUSTOM_VIEW_FILE_TYPE,
} from '../reducers/SetFile';

class Editor extends React.Component {
  currentJSON = null;

  state = {
    defaultJSON: null,
    serverRunning: true
  }

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
    if (this.props.readOnly) { return; }
    if (this.state.serverRunning) {
      this.currentJSON = value(true);
      return;
    }
    const docNodeStr = value(true);
    const docNode = JSON.parse(docNodeStr);
    const docSourceStrExisting =
      localStorage.getItem(DOC_SOURCE_NAME_KEY_LOCAL_STORAGE_KEY_PREFIX + this.props.docNameKey);
    const docSource = docSourceStrExisting ? JSON.parse(docSourceStrExisting) : {};
    if (this.props.fileNameKey !== SOURCE_FILE_NAME_TYPE && !docSource.hasOwnProperty('doc')) { return; }
    if (!docSource.hasOwnProperty('tags')) { docSource['tags'] = {}; }
    const updatedDocTags = {};
    const nodes = [];
    for (const node of docNode.content) { nodes.push(node); }
    while (nodes.length > 0) {
      const node = nodes.shift();
      let save = true;
      if (node.hasOwnProperty('attrs') && node.attrs.hasOwnProperty('tags')) {
        for (const tag of Object.keys(node.attrs.tags)) {
          const tagId = node.attrs.tags[tag];
          if (!docSource.tags.hasOwnProperty(tag) || !docSource.tags[tag].hasOwnProperty(tagId)) {
            save = false;
            break;
          }
          docSource.tags[tag][tagId] = node;
          if (!updatedDocTags.hasOwnProperty(tag)) { updatedDocTags[tag] = {}; }
          updatedDocTags[tag][tagId] = node;
        }
      }
      if (save && node.type !== 'paragraph' && node.type !== 'heading' && node.hasOwnProperty('content')) {
        for (const child of node.content) { nodes.push(child); }
      }
    }
    if (this.props.fileType !== CUSTOM_VIEW_FILE_TYPE) { docSource['doc'] = docNode; }
    else if (docSource.hasOwnProperty('doc')) {
      for (let i = 0; i < docSource.doc.content.length; ++i) {
        Editor.updateDocBlocks(docSource.doc, i, docSource.doc.content[i], updatedDocTags);
      }
    }
    localStorage.setItem(
      DOC_SOURCE_NAME_KEY_LOCAL_STORAGE_KEY_PREFIX + this.props.docNameKey,
      JSON.stringify(docSource)
    );
  }, 250);

  componentDidMount(){
    getDocument(1).then(
      data => {
        this.setState({ defaultJSON: data });
        this.currentJSON = data;
      }
    ).catch (() => {
      this.setState({ defaultJSON: "", serverRunning: false })
    })
  }

  render = () => {
    if (this.state.defaultJSON == null) { return (<div>Loading...</div>); }
    if (this.state.serverRunning) {
      return (
        <div className="MainPane">
          <FilterBar/>
          <div className="Editor">
            <RichMarkdownEditor
              defaultValue={this.state.defaultJSON}
              jsonStrValue={true}
              tagFilters={this.props.tagFiltersExpr}
              readOnly={this.props.readOnly}
              onSave={() => putDocument(this.currentJSON, 1)}
              onChange={this.handleEditorChange}
            />
          </div>
        </div>
      );
    }
    const docSourceStr = localStorage.getItem(DOC_SOURCE_NAME_KEY_LOCAL_STORAGE_KEY_PREFIX + this.props.docNameKey);
    const docSource = docSourceStr ? JSON.parse(docSourceStr) : {};
    let value = '';
    if (this.props.fileType !== CUSTOM_VIEW_FILE_TYPE) { value = JSON.stringify(docSource.doc); }
    else if (docSource.hasOwnProperty('doc')) {
      const docCustomViews = JSON.parse(
        localStorage.getItem(DOC_VIEWS_NAME_KEY_LOCAL_STORAGE_KEY_PREFIX + this.props.docNameKey)
      )[CUSTOM_VIEW_FILE_TYPE];
      const docTags = docSource.hasOwnProperty('tags') ? docSource.tags : {};
      const viewTags = docCustomViews[this.props.fileNameKey]
        .filter(tag => !docTags.hasOwnProperty(tag.tag) || !docTags.hasOwnProperty(tag.id));
      if (viewTags.length > 0) {
        value = JSON.stringify({type: 'doc', content: viewTags.map(tag => docTags[tag.tag][tag.id])});
      }
    }
    return (
      <div className="MainPane">
        <FilterBar />
        <div className="Editor">
          <RichMarkdownEditor
            key={this.props.docNameKey + '.' + this.props.fileNameKey + this.props.fileType}
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
    fileType: state.file.fileType,
    tagFiltersExpr: state.tagFilters.expr,
    readOnly: state.readOnly,
  })
)(Editor);
