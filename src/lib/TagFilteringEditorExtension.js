import { Extension } from 'rich-markdown-editor';

const ProsemirrorState = require('prosemirror-state');
const ProsemirrorView = require('prosemirror-view');

export default class TagFiltering extends Extension {
  static PLUGIN_NAME = "tag-filtering";
  static pluginKey = new ProsemirrorState.PluginKey(TagFiltering.PLUGIN_NAME);
  static TAG_REGEX = /#{[^#{}]+}/g;

  get name() { return TagFiltering.PLUGIN_NAME; }

  matchTagFilters = (tags, tagFilters) => {
    if (!tagFilters) { return true; }
    if (!Array.isArray(tagFilters)) { return tags.has(tagFilters); }
    // invariant: tagFilters isArray
    // only not expressions have array length 2
    if (tagFilters.length === 2) { return !this.matchTagFilters(tags, tagFilters[1]); }
    const match1 = this.matchTagFilters(tags, tagFilters[0]);
    if (tagFilters.length === 1) { return match1; }
    // invariant: length 3, [1] is op, [2] is tag or sub expression
    const andOp = tagFilters[1] === "&";
    // short circuit evaluation
    if (andOp !== match1) { return match1; }
    // invariant:
    // if andOp then !match1, so result should be "match2",
    // if !andOp then match1, so result should be "match2"
    return this.matchTagFilters(tags, tagFilters[2]);
  };

  evaluateTagFilters = (decs, schema, tagFilters, node, parent, parentTags, pos) => {
    let match = false;
    const nodeTags = new Set([...parentTags]);
    const isTagFilterableBlock = (node.isTextblock && parent.type !== schema.nodes.list_item) ||
      node.type === schema.nodes.bullet_list || node.type === schema.nodes.ordered_list;
    if (isTagFilterableBlock) {
      for (const nodeTag of Object.keys(node.attrs.tags)) { nodeTags.add(nodeTag); }
      match = this.matchTagFilters(nodeTags, tagFilters);
    }
    if (!node.isTextblock) {
      let cumulativeChildSize = 1;
      for (let i = 0; i < node.childCount; ++i) {
        const child = node.child(i);
        const childMatch =
          this.evaluateTagFilters(decs, schema, tagFilters, child, node, nodeTags, pos + cumulativeChildSize);
        match = match || childMatch;
        cumulativeChildSize += child.nodeSize;
      }
    }
    // TODO (carl) other types of nodes / blocks
    if (isTagFilterableBlock && !match) {
      decs.push(ProsemirrorView.Decoration.node(pos - 1, pos - 1 + node.nodeSize, { style: 'display:none;' }));
    }
    return match;
  };

  get plugins() {
    return [
      new ProsemirrorState.Plugin({
        key: TagFiltering.pluginKey,
        state: {
          init: () => null,
          apply: (tr, v) => {
            // TODO (carl) handle readonly toggling?
            const val = tr.getMeta(TagFiltering.pluginKey);
            return val === undefined ? v : val;
          },
        },
        props: {
          decorations: state => {
            const filterDecs = [];
            const tagFilters = TagFiltering.pluginKey.getState(state);
            if (tagFilters) {
              this.evaluateTagFilters(filterDecs, state.schema, tagFilters, state.doc, null, new Set(), 0);
            }
            return ProsemirrorView.DecorationSet.create(state.doc, filterDecs);
          },
        },
      }),
    ];
  }
}
