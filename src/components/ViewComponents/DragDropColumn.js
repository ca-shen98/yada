import styled from "styled-components";
import React from "react";
import { Tag } from "./Tag";
import Separator from "./Separator";
import { Droppable } from "react-beautiful-dnd";
import { THEME } from "../../App";
import { FILE_TYPE } from "../../util/FileIdAndTypeUtils";
import { SEPARATOR_PREFIX, TAG_HOLDERS } from "./TagEditor";
import AddIcon from "@material-ui/icons/Add";
import Button from "@material-ui/core/Button";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { connect } from "react-redux";
import { setMetadataInViewAction } from "../../reducers/SetTagsInView";
import { SET_SAVE_DIRTY_FLAG_ACTION_TYPE } from "../../reducers/CurrentOpenFileState";

class InnerTagList extends React.Component {
  // performance optimization to prevent unnecessary renders
  shouldComponentUpdate(nextProps, nextState, nextContext) {
    return nextProps.tagData !== this.props.tagData;
  }

  render() {
    const tagList = [];
    const tagIds = Object.keys(this.props.tagData);
    if (
      this.props.viewType === FILE_TYPE.CARD_VIEW &&
      this.props.columnId === TAG_HOLDERS.IN_VIEW
    ) {
      for (let i = 0; i < tagIds.length; ++i) {
        const tagId = tagIds[i];
        tagList.push(
          <Tag
            key={tagId}
            tagId={tagId}
            index={i}
            tagInfo={this.props.tagData[tagId]}
          />
        );
        if (i % 2 === 1 && i !== tagIds.length - 1) {
          tagList.push(
            <hr
              style={{
                color: THEME.palette.primary.main,
                backgroundColor: THEME.palette.primary.main,
                height: 1,
              }}
            />
          );
        }
      }
    } else if (
      this.props.columnId === TAG_HOLDERS.IN_VIEW &&
      this.props.viewType === FILE_TYPE.SLIDE_VIEW
    ) {
      let separatorIndex = 0;
      let separators = this.props.metadataInView["separators"] || [];
      while (
        separatorIndex < separators.length &&
        separators[separatorIndex] === 0
      ) {
        tagList.push(
          <Separator
            key={`${SEPARATOR_PREFIX}_${separatorIndex}`}
            separatorId={`${SEPARATOR_PREFIX}_${separatorIndex}`}
            index={separatorIndex}
          />
        );
        ++separatorIndex;
      }
      for (let tagIndex = 0; tagIndex < tagIds.length; ++tagIndex) {
        const tagId = tagIds[tagIndex];
        tagList.push(
          <Tag
            key={tagId}
            tagId={tagId}
            index={tagIndex + separatorIndex}
            tagInfo={this.props.tagData[tagId]}
          />
        );
        while (
          separatorIndex < separators.length &&
          tagIndex + 1 === separators[separatorIndex]
        ) {
          tagList.push(
            <Separator
              key={`${SEPARATOR_PREFIX}_${separatorIndex}`}
              separatorId={`${SEPARATOR_PREFIX}_${separatorIndex}`}
              index={tagIndex + separatorIndex + 1}
            />
          );
          ++separatorIndex;
        }
      }
    } else {
      for (let i = 0; i < tagIds.length; ++i) {
        const tagId = tagIds[i];
        tagList.push(
          <Tag
            key={tagId}
            tagId={tagId}
            index={i}
            tagInfo={this.props.tagData[tagId]}
          />
        );
      }
    }
    return tagList;
  }
}

class DragDropColumn extends React.Component {
  constructor(props) {
    super(props);
    // used to maintain scroll when rendering updates to tag list
    this.tagListRef = React.createRef();
  }

  getSnapshotBeforeUpdate(prevProps, prevState) {
    const list = this.tagListRef.current;
    return list.scrollHeight - list.scrollTop;
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (snapshot !== null) {
      const list = this.tagListRef.current;
      list.scrollTop = list.scrollHeight - snapshot;
    }
  }

  addSlideSeparator() {
    const newSeparator = this.props.column.tagIds.length || 0;
    const metadataInView = {
      separators: [...this.props.metadataInView["separators"]],
    };
    metadataInView["separators"].push(newSeparator);
    this.props.setMetadataInView(metadataInView);
    this.props.dispatchSetSaveDirtyFlagAction();
  }

  render = () => {
    const Container = styled.div`
      border: 1px solid lightgrey;
      border-radius: 10px;
      padding: 8px;
      margin-top: 10px;
      margin-bottom: 10px;
      transition: background-color 0.2s ease;
      background-color: ${(props) =>
        props.isDraggingOver
          ? THEME.palette.grey[300]
          : THEME.palette.grey[100]};
    `;
    const Title = styled.h3`
      padding: 8px;
    `;
    const DroppableRegion = styled.div`
      padding: 8px;
    `;
    const TagList = styled.div`
      overflow-x: hidden;
      overflow-y: auto;
      height: 400px;
      padding-bottom: 30px;
    `;

    return (
      <Droppable droppableId={this.props.column.id}>
        {(provided, snapshot) => {
          return (
            <Container isDraggingOver={snapshot.isDraggingOver}>
              {this.props.viewType === FILE_TYPE.SLIDE_VIEW &&
              this.props.column.id === TAG_HOLDERS.IN_VIEW ? (
                <Row className="justify-content-md-center">
                  <Col xs="6">
                    <Title>{this.props.column.title}</Title>
                  </Col>
                  <Col xs="6" className="tag-editor-button-container">
                    <Button onClick={() => this.addSlideSeparator()}>
                      Split Slide
                      <AddIcon />
                    </Button>
                  </Col>
                </Row>
              ) : (
                <Title>{this.props.column.title}</Title>
              )}
              <DroppableRegion
                ref={provided.innerRef}
                {...provided.droppableProps}
              >
                <TagList ref={this.tagListRef}>
                  <InnerTagList
                    viewType={this.props.viewType}
                    columnId={this.props.column.id}
                    tagData={this.props.tagData}
                    metadataInView={this.props.metadataInView}
                  />
                  {provided.placeholder}
                </TagList>
              </DroppableRegion>
            </Container>
          );
        }}
      </Droppable>
    );
  };
}

export default connect(
  (state) => ({
    metadataInView: state.metadataInView,
  }),
  (dispatch) => ({
    setMetadataInView: (metadataInView) =>
      dispatch(setMetadataInViewAction(metadataInView)),
    dispatchSetSaveDirtyFlagAction: () =>
      dispatch({ type: SET_SAVE_DIRTY_FLAG_ACTION_TYPE }),
  })
)(DragDropColumn);
