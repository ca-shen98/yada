import React from 'react';
import {connect} from 'react-redux';
import {debounce} from 'lodash';
import RichMarkdownEditor from 'rich-markdown-editor';
import TagFiltering from '../Tagging/extensions/TagFiltering';
import BlockTagging from '../Tagging/extensions/BlockTagging';
import FilterBar from '../Tagging/components/FilterBar';
import TagMenu from '../Tagging/components/TagMenu';
import {
  DOC_SOURCE_NAME_KEY_LOCAL_STORAGE_KEY_PREFIX,
  DOC_VIEWS_NAME_KEY_LOCAL_STORAGE_KEY_PREFIX,
  SOURCE_FILE_NAME_TYPE,
  CUSTOM_VIEW_FILE_TYPE,
  CUSTOM_VIEW_REF_NODE_TYPE,
} from '../reducers/SetFile';
import {INITIAL_SELECTION_LOCAL_STORAGE_KEY} from '../Tagging/extensions/BlockTagging';
import { Selection, TextSelection } from 'prosemirror-state';

class Editor extends React.Component {
  tagFiltersExtension = new TagFiltering();
  tagBlocksExtension = new BlockTagging();

  updateDocBlocks = (parent, childIdx, node, updatedDocTags) => {
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
        this.updateDocBlocks(node, i, node.content[i], updatedDocTags);
      }
    }
  }

  handleEditorChange = debounce(value => {
    if (this.props.readOnly) { return; }
    const docNodeStr = value(true);
    const docNode = JSON.parse(docNodeStr);
    const docSourceStrExisting =
      localStorage.getItem(DOC_SOURCE_NAME_KEY_LOCAL_STORAGE_KEY_PREFIX + this.props.docNameKey);
    const docSource = docSourceStrExisting ? JSON.parse(docSourceStrExisting) : {};
    if (this.props.fileNameKey !== SOURCE_FILE_NAME_TYPE && !docSource.hasOwnProperty('doc')) { return; }
    if (!docSource.hasOwnProperty('tags')) { docSource['tags'] = {}; }
    const updatedDocTags = {};
    const nodes = [docNode];
    while (nodes.length > 0) {
      const node = nodes.shift();
      if (node.hasOwnProperty('attrs') && node.attrs.hasOwnProperty('tags')) {
        for (const tag of Object.keys(node.attrs.tags)) {
          const tagId = node.attrs.tags[tag];
          if (!updatedDocTags.hasOwnProperty(tag)) { updatedDocTags[tag] = {}; }
          updatedDocTags[tag][tagId] = node;
        }
      }
      if (
        node.type !== 'paragraph' && node.type !== 'heading' && node.hasOwnProperty('content') &&
        (this.props.fileType !== CUSTOM_VIEW_FILE_TYPE || node.type === 'bullet_list')
      ) { for (const child of node.content) { nodes.push(child); } }
    }
    if (this.props.fileType !== CUSTOM_VIEW_FILE_TYPE) {
      docSource['doc'] = docNode;
      docSource['tags'] = updatedDocTags;
    } else if (docSource.hasOwnProperty('doc')) {
      // TODO (carl) writing back, inserting, lists ...
      // const docViews = localStorage.getItem(DOC_VIEWS_NAME_KEY_LOCAL_STORAGE_KEY_PREFIX + this.props.docNameKey)
      // const viewNodes = docViews[CUSTOM_VIEW_FILE_TYPE][this.props.fileNameKey]
      // let viewNodeIdx = 0;
      // for (const docNode of docNodes) {
      //   if (
      //     docNodes.attrs.hasOwnProperty(viewNodes[viewNodeIdx].tag) &&
      //     docNodes.attrs[viewNodes[viewNodeIdx].tag].hasOwnProperty(viewNodes[viewNodeIdx].id)
      //   ) { viewNodeIdx += 1; }
      //   else { viewNodes.insert(viewNodeIdx, docNode); } // TODO something nested lists?
      // }
      // docViews[CUSTOM_VIEW_FILE_TYPE][this.props.fileNameKey] = viewNodes
      // localStorage.setItem(
      //   DOC_VIEWS_NAME_KEY_LOCAL_STORAGE_KEY_PREFIX + this.props.docNameKey,
      //   JSON.stringify(docViews)
      // );
      for (let i = 0; i < docSource.doc.content.length; ++i) {
        this.updateDocBlocks(docSource.doc, i, docSource.doc.content[i], updatedDocTags);
      }
    }
    localStorage.setItem(
      DOC_SOURCE_NAME_KEY_LOCAL_STORAGE_KEY_PREFIX + this.props.docNameKey,
      JSON.stringify(docSource)
    );
  }, 1000);

  handleTagFiltersChange = () => {
    const transaction = this.tagFiltersExtension.editor.view.state.tr.setMeta(
      TagFiltering.pluginKey,
      this.props.tagFiltersExpr
    );
    this.tagFiltersExtension.editor.view.dispatch(transaction);
  }

  setInitialSelection = () => {
    this.tagBlocksExtension.mountSelect = true;
    const initialSelectionStr = localStorage.getItem(INITIAL_SELECTION_LOCAL_STORAGE_KEY);
    const initialSelection = initialSelectionStr ? JSON.parse(initialSelectionStr) : null;
    const selection = initialSelection ?
      TextSelection.create(
        this.tagBlocksExtension.editor.view.state.doc,
        initialSelection.anchor,
        initialSelection.head
      ) : Selection.atEnd(this.tagBlocksExtension.editor.view.state.doc);
    const tr = this.tagBlocksExtension.editor.view.state.tr.setSelection(selection);
    this.tagBlocksExtension.editor.view.dispatch(tr);
  };

  componentDidMount = () => {
    this.handleTagFiltersChange();
    this.setInitialSelection();
    this.tagBlocksExtension.editor.view.focus();
  };

  componentDidUpdate = prevProps => {
    if (
      this.props.docNameKey !== prevProps.docNameKey || this.props.fileNameKey !== prevProps.fileNameKey ||
      this.props.tagFiltersText !== prevProps.tagFiltersText
    ) { this.handleTagFiltersChange(); }
    this.tagBlocksExtension.editor.view.focus();
  };

  render = () => {
    const docSourceStr = localStorage.getItem(DOC_SOURCE_NAME_KEY_LOCAL_STORAGE_KEY_PREFIX + this.props.docNameKey);
    const docSource = docSourceStr ? JSON.parse(docSourceStr) : {};
    let value = '';
    if (this.props.fileType !== CUSTOM_VIEW_FILE_TYPE) { value = JSON.stringify(docSource.doc); }
    else if (docSource.hasOwnProperty('doc')) {
      const docCustomViews = JSON.parse(
        localStorage.getItem(DOC_VIEWS_NAME_KEY_LOCAL_STORAGE_KEY_PREFIX + this.props.docNameKey)
      )[CUSTOM_VIEW_FILE_TYPE];
      const docTags = docSource.hasOwnProperty('tags') ? docSource.tags : {};
      const viewNodes = docCustomViews[this.props.fileNameKey]
        .filter(node =>
          node.type !== CUSTOM_VIEW_REF_NODE_TYPE ||
          (docTags.hasOwnProperty(node.tag) && docTags[node.tag].hasOwnProperty(node.id))
        );
      if (viewNodes.length > 0) {
        const docNodes = { type: 'doc', content: [] };
        for (let i = 0; i < viewNodes.length; ++i) {
          let docNode = viewNodes[i];
          if (docNode.type === CUSTOM_VIEW_REF_NODE_TYPE) {
            docNode = docTags[docNode.tag][docNode.id];
            if (docNode.type === 'list_item') {
              docNode = { type: 'bullet_list', content: [docNode] };
              while (
                i + 1 < viewNodes.length && viewNodes[i + 1].type === CUSTOM_VIEW_REF_NODE_TYPE &&
                docTags[viewNodes[i+1].tag][viewNodes[i+1].id].type === 'list_item'
              ) {
                docNode.content.push(docTags[viewNodes[i+1].tag][viewNodes[i+1].id]);
                i += 1;
              }
            }
          }
          docNodes.content.push(docNode);
        }
        value = JSON.stringify(docNodes);
      }
    }
    return (
      <div className="MainPane">
        <FilterBar />
        <div className="Editor">
          <TagMenu tagBlocksEditorExtension={this.tagBlocksExtension} />
          <RichMarkdownEditor
            key={this.props.docNameKey + '.' + this.props.fileNameKey + this.props.fileType}
            defaultValue={value}
            jsonStrValue={!(!value)}
            readOnly={this.props.readOnly}
            onChange={this.handleEditorChange}
            onCancel={() => {}}
            extensions={[this.tagFiltersExtension, this.tagBlocksExtension]}
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
    tagFiltersText: state.tagFilters.text,
    tagFiltersExpr: state.tagFilters.expr,
    readOnly: state.readOnly,
  })
)(Editor);
