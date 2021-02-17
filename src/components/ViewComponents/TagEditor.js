import React from "react";
import { connect } from "react-redux";
import Container from "react-bootstrap/Container";
import DragDropColumn from "./DragDropColumn";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { DragDropContext } from "react-beautiful-dnd";
import { setTagsInViewAction } from "../../reducers/SetTagsInView";
import { SET_SAVE_DIRTY_FLAG_ACTION_TYPE } from "../../reducers/CurrentOpenFileState";
import { setTagEditorOpenedAction } from "../../reducers/Steps";

export const TAG_HOLDERS = {
  AVAILABLE: "tags_available",
  IN_VIEW: "tags_in_view",
};

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
      const preview = getPreview(tagData[tagId].content);
      const maxPreviewLength = 50;
      tagData[tagId]["preview"] = preview.substring(0, maxPreviewLength);
      if (preview.length > maxPreviewLength) {
        tagData[tagId]["preview"] += " . . .";
      }
    });

    this.state = {
      tagData: tagData,
      columns: {
        tags_in_view: {
          id: TAG_HOLDERS.IN_VIEW,
          title: "Tags in View",
          tagIds: this.props.tagsInView,
        },
        tags_available: {
          id: TAG_HOLDERS.AVAILABLE,
          title: "Available Tags",
          tagIds: availableTags,
        },
      },
      columnOrder: ["tags_in_view", "tags_available"],
    };
  }

  onDragEnd = (result) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    )
      return;

    let newState = {};
    if (destination.droppableId === source.droppableId) {
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
    } else {
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
  };

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (prevProps.tagsInView !== this.props.tagsInView) {
      const tagsInView = new Set(this.props.tagsInView);
      const availableTags = Object.keys(this.props.allTagsData).filter(
        (t) => !tagsInView.has(t)
      );
      const newState = Object.assign({}, this.state);
      newState.columns.tags_in_view.tagIds = tagsInView;
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
    saveDirtyFlag: state.saveDirtyFlag,
  }),
  (dispatch) => ({
    setTagsInView: (tagsInView) => dispatch(setTagsInViewAction(tagsInView)),
    dispatchSetSaveDirtyFlagAction: () =>
      dispatch({ type: SET_SAVE_DIRTY_FLAG_ACTION_TYPE }),
    dispatchSetTagEditorOpenedAction: (tagMenuEditor) =>
      dispatch(setTagEditorOpenedAction(tagMenuEditor)),
  })
)(TagEditor);
