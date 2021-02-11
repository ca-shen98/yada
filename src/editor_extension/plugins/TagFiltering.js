import { Plugin, PluginKey } from "prosemirror-state";
import { Decoration, DecorationSet } from "prosemirror-view";
import { SelectNodePluginKey } from "./SelectNode";

const TAG_FILTERING_PLUGIN_NAME = "tag-filtering";
export const TagFilteringPluginKey = new PluginKey(TAG_FILTERING_PLUGIN_NAME);

const matchTagFilters = (tags, tagFilters) => {
  if (!tagFilters) {
    return true;
  }
  if (!Array.isArray(tagFilters)) {
    return tags.hasOwnProperty(tagFilters);
  }
  // invariant: tagFilters isArray
  // only not expressions have array length 2
  if (tagFilters.length === 2) {
    return !matchTagFilters(tags, tagFilters[1]);
  }
  const match1 = matchTagFilters(tags, tagFilters[0]);
  if (tagFilters.length === 1) {
    return match1;
  }
  // invariant: length 3, [1] is op, [2] is tag or sub expression
  const andOp = tagFilters[1] === "&";
  // short circuit evaluation
  if (andOp !== match1) {
    return match1;
  }
  // invariant:
  // if andOp then !match1, so result should be match2,
  // if !andOp then match1, so result should be match2
  return matchTagFilters(tags, tagFilters[2]);
};

const evaluateTagFilters = (
  decorations,
  tagFilters,
  selectNode,
  node,
  parentTags,
  pos
) => {
  let match = false;
  const taggable = node.hasOwnProperty("attrs") && node.attrs["tags"];
  const nodeTags = { ...parentTags, ...(taggable ? node.attrs["tags"] : null) };
  if (taggable) {
    match = matchTagFilters(nodeTags, tagFilters);
  }
  if (!node.isTextblock) {
    let cumulativeChildSize = 1;
    for (let i = 0; i < node.childCount; ++i) {
      const child = node.child(i);
      const childPos = pos + cumulativeChildSize;
      const childMatch = evaluateTagFilters(
        decorations,
        tagFilters,
        selectNode,
        child,
        nodeTags,
        childPos
      );
      match = match || childMatch;
      cumulativeChildSize += child.nodeSize;
    }
  }
  if (pos !== 0 && !match) {
    decorations.push(
      Decoration.node(pos - 1, pos - 1 + node.nodeSize, {
        style: "display: none;",
      })
    );
  }
  return match;
};

export default new Plugin({
  key: TagFilteringPluginKey,
  state: {
    init: () => null,
    apply: (tr, v) => {
      const val = tr.getMeta(TagFilteringPluginKey);
      return val === undefined ? v : val;
    },
  },
  props: {
    decorations: (state) => {
      const filterDecorations = [];
      const tagFilters = TagFilteringPluginKey.getState(state);
      const selectNode = SelectNodePluginKey.getState(state);
      if (tagFilters) {
        evaluateTagFilters(
          filterDecorations,
          tagFilters,
          selectNode,
          state.doc,
          {},
          0
        );
      }
      return DecorationSet.create(state.doc, filterDecorations);
    },
  },
});
