import styled from "styled-components";
import React from "react";
import Grid from "@material-ui/core/Grid";
import { Droppable, Draggable } from "react-beautiful-dnd";
import { THEME } from "../../App";
import { FILE_TYPE } from "../../util/FileIdAndTypeUtils";
import { TAG_HOLDERS } from "./TagEditor";

class Tag extends React.Component {
  render = () => {
    const Container = styled.div`
      border: 1px solid lightgrey;
      border-radius: 10px;
      padding: 8px;
      margin-bottom: 8px;
      background-color: ${(props) =>
        props.isDragging
          ? THEME.palette.secondary.dark
          : THEME.palette.secondary.light};
    `;
    const TagId = styled.h6``;
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

class InnerTagList extends React.Component {
  // performance optimization to prevent unnecessary renders
  shouldComponentUpdate(nextProps, nextState, nextContext) {
    return nextProps.tagData !== this.props.tagData;
  }

  render() {
    const tagList = [];
    const tagIds = Object.keys(this.props.tagData);
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
      if (
        this.props.viewType === FILE_TYPE.CARD_VIEW &&
        this.props.columnId === TAG_HOLDERS.IN_VIEW
      ) {
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
              <Title>{this.props.column.title}</Title>
              <DroppableRegion
                ref={provided.innerRef}
                {...provided.droppableProps}
              >
                <TagList ref={this.tagListRef}>
                  <InnerTagList
                    viewType={this.props.viewType}
                    columnId={this.props.column.id}
                    tagData={this.props.tagData}
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
