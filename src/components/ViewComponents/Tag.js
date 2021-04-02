import React from "react";
import { Draggable } from "react-beautiful-dnd";
import Grid from "@material-ui/core/Grid";

export class Tag extends React.Component {
  render = () => {
    return (
      <Draggable draggableId={this.props.tagId} index={this.props.index}>
        {(provided, snapshot) => (
          <div
            className={`tag_container ${
              snapshot.isDragging
                ? "tag_container_dragging"
                : "tag_container_stationary"
            }`}
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            isDragging={snapshot.isDragging}
          >
            <Grid container spacing={1}>
              <Grid item xs={4}>
                <h6 className="tag_name">{this.props.tagInfo["tag_name"]}</h6>
              </Grid>
              <Grid item xs={8}>
                <div className="tag_content">{this.props.tagInfo.preview}</div>
              </Grid>
            </Grid>
          </div>
        )}
      </Draggable>
    );
  };
}
