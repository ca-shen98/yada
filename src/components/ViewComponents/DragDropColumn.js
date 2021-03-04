import styled from "styled-components";
import React from "react";
import Grid from "@material-ui/core/Grid";
import { Droppable, Draggable } from "react-beautiful-dnd";
import { THEME } from "../../App";
import { FILE_TYPE } from "../../util/FileIdAndTypeUtils";
import { TAG_HOLDERS } from "./TagEditor";
import AddIcon from "@material-ui/icons/Add";
import Button from "@material-ui/core/Button";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";

class Tag extends React.Component {
  render = () => {
    const Container = styled.div`
      border: 1px solid lightgrey;
      border-radius: 10px;
      padding: 8px;
      margin-top: 4px;
      margin-bottom: 4px;
      background-color: ${(props) =>
        props.isDragging
          ? THEME.palette.secondary.dark
          : THEME.palette.secondary.light};
    `;
    const TagId = styled.h6`
      word-break: break-word;
    `;
    const Content = styled.div`
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    `;
    return (
      <Draggable draggableId={this.props.tagId} index={this.props.index}>
        {(provided, snapshot) => (
          <Container
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            isDragging={snapshot.isDragging}
          >
            <Grid container spacing={1}>
              <Grid item xs={4}>
                <TagId>{this.props.tagInfo["tag_name"]}</TagId>
              </Grid>
              <Grid item xs={8}>
                <Content>{this.props.tagInfo.preview}</Content>
              </Grid>
            </Grid>
          </Container>
        )}
      </Draggable>
    );
  };
}

class Separator extends React.Component {
  render = () => {
    const Container = styled.div`
      height: 30px;
      padding: 2px;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
    `;
    return (
      <Draggable draggableId={this.props.separatorId} index={this.props.index}>
        {(provided, snapshot) => (
          <Container
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            isDragging={snapshot.isDragging}
          >
            <hr
              style={{
                color: THEME.palette.primary.main,
                backgroundColor: THEME.palette.primary.main,
                height: 1,
                width: "100%",
                position: "absolute",
              }}
            />
            <div
              style={{
                borderRadius: 5,
                backgroundColor: THEME.palette.primary.main,
                height: 10,
                width: 50,
                position: "absolute",
              }}
            />
          </Container>
        )}
      </Draggable>
    );
  };
}

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
      let j = 0;
      let separators = this.props.metadataInView["separators"] || [0, 1];
      for (let i = 0; i < tagIds.length; ++i) {
        const tagId = tagIds[i];
        tagList.push(
          <Tag
            key={tagId}
            tagId={tagId}
            index={i + j}
            tagInfo={this.props.tagData[tagId]}
          />
        );
        if (j < separators.length && i === separators[j]) {
          tagList.push(
            <Separator
              key={`separator_${j}`}
              separatorId={`separator_${j}`}
              index={i + j + 1}
              tagInfo={this.props.tagData[tagId]}
            />
          );
          ++j;
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
                    <Button
                      onClick={() => {
                        console.log("new slide");
                      }}
                    >
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

export default DragDropColumn;
