import { Plugin, PluginKey } from "prosemirror-state";
import { checkSourceFileId } from "../../util/FileIdAndTypeUtils";
import { TagFilteringPluginKey } from "./TagFiltering";
import store from "../../store";

const CANCEL_LINE_BREAKS_PLUGIN_NAME = "cancel-line-breaks";
export const CancelLineBreaksPluginKey = new PluginKey(
  CANCEL_LINE_BREAKS_PLUGIN_NAME
);

const checkInsertLineBreakReplaceStep = (step) =>
  step.slice.content.content.some((node) => !node.isLeaf);

const checkRemoveLineBreakReplaceStep = (step, doc) => {
  if (step.from === step.to) {
    return false;
  }
  const fromNode = doc.nodeAt(step.from);
  const toNode = doc.nodeAt(step.to);
  if (toNode) {
    return !fromNode || (fromNode && !fromNode.eq(toNode));
  }
  return !fromNode || !doc.nodeAt(step.to - 1).eq(fromNode);
};

export default new Plugin({
  key: CancelLineBreaksPluginKey,
  filterTransaction: (tr, state) =>
    (checkSourceFileId(store.getState().currentOpenFileId) &&
      !TagFilteringPluginKey.getState(state)) ||
    tr.steps.every(
      (step) =>
        step.toJSON().stepType !== "replace" ||
        (!checkInsertLineBreakReplaceStep(step) &&
          !checkRemoveLineBreakReplaceStep(step, state.doc))
    ),
});
