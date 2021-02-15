import { Plugin, PluginKey } from "prosemirror-state";
import { Decoration, DecorationSet } from "prosemirror-view";
import { setSelectNodeAction } from "../../reducers/CurrentOpenFileState";
import store from "../../store";

const SELECT_NODE_PLUGIN_NAME = "select-node";
export const SelectNodePluginKey = new PluginKey(SELECT_NODE_PLUGIN_NAME);

export default new Plugin({
  key: SelectNodePluginKey,
  state: {
    init: () => null,
    apply: (tr, _value, oldState) => {
      let head = tr.selection.head;
      let newState = null;
      let list_item = false;
      console.log("============================");
      tr.doc.nodesBetween(head, head, (node, pos) => {
        if (node.type.name === "list_item") {
          list_item = true;
        }
        if (node.hasOwnProperty("attrs") && node.attrs["tags"]) {
          if (!list_item || (list_item && node.type.name !== "paragraph")) {
            console.log(list_item + " " + node.type.name);
            console.log(node.attrs["tags"]);
            newState = { node, pos };
          }
        }
        // return true;
      });
      console.log("============================");
      if (
        (!oldState && newState) ||
        (oldState && !newState) ||
        (oldState &&
          newState &&
          (newState.pos !== oldState.pos || !newState.node.eq(oldState.node)))
      ) {
        store.dispatch(
          setSelectNodeAction(newState ? { pos: newState.pos } : null)
        );
      }
      return newState;
    },
  },
  props: {
    decorations: (state) => {
      const selectDecorations = [];
      const selectNode = SelectNodePluginKey.getState(state);
      if (selectNode) {
        let decoration = null;
        if (selectNode.node.type.name === "code_block") {
          decoration = Decoration.node(
            selectNode.pos,
            selectNode.pos + selectNode.node.nodeSize,
            { style: "background: #FAFAFA; outline: 10px solid #DCDCDC;" }
          );
        } else {
          decoration = Decoration.node(
            selectNode.pos,
            selectNode.pos + selectNode.node.nodeSize,
            { style: "background: #FAFAFA; outline: 1px solid #DCDCDC;" }
          );
        }
        selectDecorations.push(decoration);
      }
      return DecorationSet.create(state.doc, selectDecorations);
    },
  },
});
