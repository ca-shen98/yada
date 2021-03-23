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

export const TAG_HOLDERS = {
  AVAILABLE: "tags_available",
  IN_VIEW: "tags_in_view",
};

export const SEPARATOR_PREFIX = "separator";

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
        // don't allow separator to be moved to top
        if (destination.index === 0) {
          return;
        }
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
          console.log(separators);
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
      }
    } else {
      let newState = {};
      // TODO: fix this for slides + tags in view
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
        const startTagIds = Array.from(start.tagIds);
        startTagIds.splice(source.index, 1);
        const newStart = {
          ...start,
          tagIds: startTagIds,
        };

        const finishTagIds = Array.from(finish.tagIds);
        finishTagIds.splice(destination.index, 0, draggableId);
        const newFinish = {
          ...finish,
          tagIds: finishTagIds,
        };

        newState = {
          ...this.state,
          columns: {
            ...this.state.columns,
            [newStart.id]: newStart,
            [newFinish.id]: newFinish,
          },
        };
        this.props.dispatchSetSaveDirtyFlagAction();
      }
      this.props.setTagsInView(newState.columns.tags_in_view.tagIds);
      this.setState(newState);
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
