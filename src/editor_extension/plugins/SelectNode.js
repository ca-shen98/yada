import {Plugin, PluginKey} from 'prosemirror-state';
import {Decoration, DecorationSet} from 'prosemirror-view';
import store from '../../store';
import {setSelectNodeAction} from '../../reducers/CurrentOpenFileState';
import {FILE_TYPES} from '../../reducers/FileStorageSystem';
import {calculateFileIdKeyDerivedParameters} from '../../components/Navigator';
import {TagFilteringPluginKey} from './TagFiltering';

const SELECT_NODE_PLUGIN_NAME = 'select-node';
export const SelectNodePluginKey = new PluginKey(SELECT_NODE_PLUGIN_NAME);

const checkEnterStepType = step => step.stepType === 'replace' && step.from === step.to && step.structure;

export default new Plugin({
  key: SelectNodePluginKey,
  state: {
    init: () => null,
    apply: (tr, _value, oldState) => {
      let head = tr.selection.head;
      let newState = null;
      tr.doc.nodesBetween(head, head, (node, pos) => { if (node.isTextblock) { newState = { node, pos }; } });
      if (
        (!oldState && newState) || (oldState && !newState) ||
        (oldState && newState && (newState.pos !== oldState.pos || !newState.node.eq(oldState.node)))
      ) { store.dispatch(setSelectNodeAction(newState ? { pos: newState.pos } : null)); }
      return newState;
    },
  },
  filterTransaction: (tr, state) => {
    const { fileType } = calculateFileIdKeyDerivedParameters(store.getState().currentOpenFileIdKey);
    return (fileType === FILE_TYPES.SOURCE && !TagFilteringPluginKey.getState(state)) ||
      tr.steps.every(step => !checkEnterStepType(step.toJSON()));
  },
  props: {
    decorations: state => {
      const selectDecorations = [];
      const selectNode = SelectNodePluginKey.getState(state);
      if (selectNode) {
        selectDecorations.push(Decoration.node(
          selectNode.pos,
          selectNode.pos + selectNode.node.nodeSize,
          { style: 'background: #FAFAFA; outline: 1px solid #DCDCDC;' },
        ));
      }
      return DecorationSet.create(state.doc, selectDecorations);
    },
  },
});
