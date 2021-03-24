import React from "react";
import { connect } from "react-redux";
import Container from "react-bootstrap/Container";
import DragDropColumn from "./DragDropColumn";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { DragDropContext } from "react-beautiful-dnd";
import {
  setMetadataInViewAction,
  setTagsInViewAction,
} from "../../reducers/SetTagsInView";
import { SET_SAVE_DIRTY_FLAG_ACTION_TYPE } from "../../reducers/CurrentOpenFileState";
import { setTagEditorOpenedAction } from "../../reducers/Steps";
import "./TagEditor.css";
import { FILE_TYPE } from "../../util/FileIdAndTypeUtils";

export const TAG_HOLDERS = {
  AVAILABLE: "tags_available",
  IN_VIEW: "tags_in_view",
};

export const SEPARATOR_PREFIX = "separator";

// Helper functions to Deal with Tag Id and Separator shifting at the end of a drag action
function removeTagIdWithSep(start, source_index, separators) {
  // Remove tagId and adjust separators from source
  const startTagIds = Array.from(start.tagIds);
  // count number of separators prior to `source.index`
  let offset = 0;
  for (let i = 0; i < separators.length; ++i) {
    if (separators[i] >= source_index - i) {
      break;
    }
    ++offset;
  }
  const tagIdToRemove = source_index - offset;
  // remove source tagId
  startTagIds.splice(tagIdToRemove, 1);
  // adjust separators
  for (let i = offset; i < separators.length; ++i) {
    --separators[i];
  }
  return {
    ...start,
    tagIds: startTagIds,
    metadataInView: {
      separators: separators,
    },
  };
}
function insertTagIdWithSep(
  finish,
  destination_index,
  separators,
  draggableId
) {
  // Insert tagId and adjust separators from source
  const finishTagIds = Array.from(finish.tagIds);
  // count number of separators prior to `destination_index`
  let offset = 0;
  for (let i = 0; i < separators.length; ++i) {
    if (separators[i] >= destination_index - i) {
      break;
    }
    ++offset;
  }
  const tagIdInsertion = destination_index - offset;
  // insert destination tagId
  finishTagIds.splice(tagIdInsertion, 0, draggableId);
  // adjust separators
  for (let i = offset; i < separators.length; ++i) {
    ++separators[i];
  }
  return {
    ...finish,
    tagIds: finishTagIds,
    metadataInView: {
      separators: separators,
    },
  };
}

function insertTagId(finish, destination_index, draggableId) {
  const finishTagIds = Array.from(finish.tagIds);
  finishTagIds.splice(destination_index, 0, draggableId);
  return {
    ...finish,
    tagIds: finishTagIds,
  };
}
function removeTagId(start, source_index) {
  const startTagIds = Array.from(start.tagIds);
  startTagIds.splice(source_index, 1);
  return {
    ...start,
    tagIds: startTagIds,
  };
}
function createNewState(state, newStart, newFinish) {
  return {
    ...state,
    columns: {
      ...state.columns,
      [newStart.id]: newStart,
      [newFinish.id]: newFinish,
    },
  };
}

class TagEditor extends React.Component {
  constructor(props) {
    super(props);
    const tagsInView = new Set(this.props.tagsInView);
    const availableTags = Object.keys(this.props.allTagsData).filter(
      (t) => !tagsInView.has(t)
    );

    // parse nodes to obtain preview
    function getPreview(node) {
      for (let i = 0; i < node.content.length; ++i) {
        const contentNode = node.content[i];
        if (contentNode.type === "text") {
          return contentNode.text;
        } else if (contentNode) {
          const recurseResponse = getPreview(contentNode);
          if (recurseResponse !== "") return recurseResponse;
        }
      }
      return "";
    }

    const tagData = this.props.allTagsData;
    Object.keys(tagData).forEach((tagId) => {
      tagData[tagId]["preview"] = getPreview(tagData[tagId].content);
    });

    this.state = {
      tagData: tagData,
      columns: {
        tags_in_view: {
          id: TAG_HOLDERS.IN_VIEW,
          title: "Tags in View",
          tagIds: this.props.tagsInView,
          metadataInView: this.props.metadataInView,
        },
        tags_available: {
          id: TAG_HOLDERS.AVAILABLE,
          title: "Available Tags",
          tagIds: availableTags,
          metadataInView: {},
        },
      },
      columnOrder: ["tags_in_view", "tags_available"],
    };
  }

  onDragEnd = (result) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    // no change made
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const isSeparator = draggableId.startsWith(SEPARATOR_PREFIX);
    if (isSeparator) {
      // only allow separators to move in "Tags in View"
      if (destination.droppableId === TAG_HOLDERS.IN_VIEW) {
        const column = this.state.columns[TAG_HOLDERS.IN_VIEW];
        const separators = Array.from(this.props.metadataInView["separators"]);

        // replace source index with destination index
        let oldSeparator = source.index;
        for (let i = 0; i < separators.length; ++i) {
          if (separators[i] === oldSeparator) {
            separators.splice(i, 1);
            break;
          }
          // decrement oldSeparator since current separator pushes next separators up an index
          --oldSeparator;
        }
        if (separators.length === 0) {
          separators.push(destination.index);
        } else {
          let insertionPoint = 0;
          while (insertionPoint < separators.length) {
            if (separators[insertionPoint] > destination.index) {
              break;
            }
            ++insertionPoint;
          }
          // need to subtract number of separators in order to insert the actual index of the separator with respect to the tagIds
          separators.splice(
            insertionPoint,
            0,
            destination.index - insertionPoint
          );
        }

        const newColumn = {
          ...column,
          metadataInView: {
            separators: separators,
          },
        };

        let newState = {
          ...this.state,
          columns: {
            ...this.state.columns,
            [newColumn.id]: newColumn,
          },
        };
        this.props.setMetadataInView(newColumn.metadataInView);
        this.setState(newState);
        this.props.dispatchSetSaveDirtyFlagAction();
      }
    } else {
      if (
        this.props.viewType === FILE_TYPE.SLIDE_VIEW &&
        (source.droppableId === TAG_HOLDERS.IN_VIEW ||
          destination.droppableId === TAG_HOLDERS.IN_VIEW)
      ) {
        // special handling for tags in slide view due to changing offsets with separators
        if (
          source.droppableId === TAG_HOLDERS.IN_VIEW &&
          destination.droppableId === TAG_HOLDERS.AVAILABLE
        ) {
          const start = this.state.columns[source.droppableId];
          const finish = this.state.columns[destination.droppableId];
          const newStart = removeTagIdWithSep(
            start,
            source.index,
            Array.from(this.props.metadataInView["separators"])
          );
          const newFinish = insertTagId(finish, destination.index, draggableId);
          const newState = createNewState(this.state, newStart, newFinish);
          this.props.setTagsInView(newState.columns.tags_in_view.tagIds);
          this.props.setMetadataInView(newStart.metadataInView);
          this.setState(newState);
          this.props.dispatchSetSaveDirtyFlagAction();
        } else if (
          source.droppableId === TAG_HOLDERS.AVAILABLE &&
          destination.droppableId === TAG_HOLDERS.IN_VIEW
        ) {
          const start = this.state.columns[source.droppableId];
          const finish = this.state.columns[destination.droppableId];
          const newStart = removeTagId(start, source.index);
          const newFinish = insertTagIdWithSep(
            finish,
            destination.index,
            Array.from(this.props.metadataInView["separators"]),
            draggableId
          );
          const newState = createNewState(this.state, newStart, newFinish);
          this.props.setTagsInView(newState.columns.tags_in_view.tagIds);
          this.props.setMetadataInView(newFinish.metadataInView);
          this.setState(newState);
          this.props.dispatchSetSaveDirtyFlagAction();
        } else if (
          source.droppableId === TAG_HOLDERS.IN_VIEW &&
          destination.droppableId === TAG_HOLDERS.IN_VIEW
        ) {
          let tags_in_view_column = this.state.columns[source.droppableId];
          const separators = Array.from(
            this.props.metadataInView["separators"]
          );
          tags_in_view_column = removeTagIdWithSep(
            tags_in_view_column,
            source.index,
            separators
          );
          tags_in_view_column = insertTagIdWithSep(
            tags_in_view_column,
            destination.index,
            tags_in_view_column.metadataInView.separators,
            draggableId
          );
          const newState = {
            ...this.state,
            columns: {
              ...this.state.columns,
              [tags_in_view_column.id]: tags_in_view_column,
            },
          };
          this.props.setTagsInView(tags_in_view_column.tagIds);
          this.props.setMetadataInView(tags_in_view_column.metadataInView);
          this.setState(newState);
          this.props.dispatchSetSaveDirtyFlagAction();
        }
      } else {
        let newState;
        if (destination.droppableId === source.droppableId) {
          // reorder within same list
          const column = this.state.columns[source.droppableId];
          const newTagIds = Array.from(column.tagIds);
          newTagIds.splice(source.index, 1);
          newTagIds.splice(destination.index, 0, draggableId);

          const newColumn = {
            ...column,
            tagIds: newTagIds,
          };

          newState = {
            ...this.state,
            columns: {
              ...this.state.columns,
              [newColumn.id]: newColumn,
            },
          };

          if (column.id === TAG_HOLDERS.IN_VIEW) {
            // set dirty flag when tags are re-ordered within Tags In View Holder
            this.props.dispatchSetSaveDirtyFlagAction();
          }
        } else {
          // move to another list
          const start = this.state.columns[source.droppableId];
          const finish = this.state.columns[destination.droppableId];
          const newStart = removeTagId(start, source.index);
          const newFinish = insertTagId(finish, destination.index);
          newState = createNewState(this.state, newStart, newFinish);
          this.props.dispatchSetSaveDirtyFlagAction();
        }
        this.props.setTagsInView(newState.columns.tags_in_view.tagIds);
        this.setState(newState);
      }
    }
  };

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (prevProps.tagsInView !== this.props.tagsInView) {
      const tagsInView = new Set(this.props.tagsInView);
      const availableTags = Object.keys(this.props.allTagsData).filter(
        (t) => !tagsInView.has(t)
      );
      const newState = Object.assign({}, this.state);
      newState.columns.tags_in_view.tagIds = this.props.tagsInView;
      newState.columns.tags_available.tagIds = availableTags;
      this.setState(newState);
    }
  }

  componentDidMount() {
    this.props.dispatchSetTagEditorOpenedAction(true);
  }

  render = () => {
    return (
      <DragDropContext onDragEnd={this.onDragEnd}>
        <Container style={{ padding: 0 }}>
          <Row className="justify-content-md-center dragDrop">
            {this.state.columnOrder.map((columnId) => {
              const column = this.state.columns[columnId];
              // Generate subdict here
              let tagDataInColumn = {};
              for (const tagId of column.tagIds) {
                tagDataInColumn[tagId] = this.state.tagData[tagId];
              }
              return (
                <Col key={column.id} md="12" lg="6">
                  <DragDropColumn
                    viewType={this.props.viewType}
                    key={column.id}
                    column={column}
                    tagData={tagDataInColumn}
                    metadataInView={column.metadataInView}
                  />
                </Col>
              );
            })}
          </Row>
        </Container>
      </DragDropContext>
    );
  };
}

export default connect(
  (state) => ({
    tagsInView: state.tagsInView,
    metadataInView: state.metadataInView,
    saveDirtyFlag: state.saveDirtyFlag,
  }),
  (dispatch) => ({
    setTagsInView: (tagsInView) => dispatch(setTagsInViewAction(tagsInView)),
    setMetadataInView: (metadataInView) =>
      dispatch(setMetadataInViewAction(metadataInView)),
    dispatchSetSaveDirtyFlagAction: () =>
      dispatch({ type: SET_SAVE_DIRTY_FLAG_ACTION_TYPE }),
    dispatchSetTagEditorOpenedAction: (tagMenuEditor) =>
      dispatch(setTagEditorOpenedAction(tagMenuEditor)),
  })
)(TagEditor);
