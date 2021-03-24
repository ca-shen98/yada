import React from "react";
import { THEME } from "../../App";
import { Draggable } from "react-beautiful-dnd";
import Grid from "@material-ui/core/Grid";
import styled from "styled-components";

export class Tag extends React.Component {
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
