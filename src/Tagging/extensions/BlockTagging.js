import { Extension } from 'rich-markdown-editor';
import {debounce} from 'lodash';
import store from '../../store';
import Actions from '../../actions';
import { Plugin, PluginKey } from 'prosemirror-state';
import { Decoration, DecorationSet } from 'prosemirror-view';

export const INITIAL_SELECTION_LOCAL_STORAGE_KEY = 'initialSelection';

export const isTaggableBlock = (node, parent) => node.type === node.type.schema.nodes.list_item ||
  (node.isTextblock && parent.type !== node.type.schema.nodes.list_item);

export default class BlockTagging extends Extension {
  static PLUGIN_NAME = 'block-tagging';
  static pluginKey = new PluginKey(BlockTagging.PLUGIN_NAME);

  mountSelect = false;

  get name() { return BlockTagging.PLUGIN_NAME; }

  get plugins() {
    return [
      new Plugin({
        key: BlockTagging.pluginKey,
        state: {
          init: () => null, // ({ node: null, pos: -1 }), // [],
          apply: (tr, v) => {
            // const sel = [];
            // if (!tr.selection.empty) {
            //   for (let i = tr.selection.content().content.content.length - 1; i >= 0; --i) {
            //     sel.push(tr.selection.content().content.content[i]);
            //   }
            // }
            // const val = [];
            // tr.doc.nodesBetween(tr.selection.from, tr.selection.to, (node, pos, parent, idx) => {
              // const selNode = sel.pop();
              // if (selNode) {
              //   for (let i = selNode.content.content.length - 1; i >= 0; --i) { sel.push(selNode.content.content[i]); }
              // }
            //   if (
            //     isTaggableBlock(node, parent) &&
            //     (!selNode || selNode.isTextblock || selNode.content.firstChild.isTextblock)
            //   ) { val.push({ node, pos, parent, idx }); }
            // });
            // return tr.selection.empty ? val.slice(-1) : val;
            let val = null;
            let head = tr.selection.head;
            if (tr.selection.anchor === 0) {
              // tr.selection.anchor = 1;
              head -= 1;
            }
            tr.doc.nodesBetween(head, head, (node, pos, parent, idx) => {
              if (isTaggableBlock(node, parent)) { val = { node, pos, parent, idx }; }
            })
            if (this.mountSelect) {
              debounce(
                () => {
                  localStorage.setItem(
                    INITIAL_SELECTION_LOCAL_STORAGE_KEY,
                    JSON.stringify({ anchor: tr.selection.anchor, head: tr.selection.head })
                  );
                  store.dispatch(Actions.setSelectNode({
                    pos: val.pos,
                    idx: val.idx,
                    node: JSON.stringify(val.node.toJSON()),
                    parent: JSON.stringify(val.parent.toJSON()),
                  }));
                },
                250
              )();
            }
            return val;
          },
        },
        props: {
          decorations: state => {
            const selectDecs = [];
            // for (const { node, pos } of BlockTagging.pluginKey.getState(state)) {
            const selNode = BlockTagging.pluginKey.getState(state);
            if (selNode) {
              selectDecs.push(Decoration.node(
                selNode.pos,
                selNode.pos + selNode.node.nodeSize,
                { style: 'background: #FAFAFA; outline: 1px solid #DCDCDC;' }
              ));
            }
            return DecorationSet.create(state.doc, selectDecs);
          },
        },
      }),
    ];
  }
}
