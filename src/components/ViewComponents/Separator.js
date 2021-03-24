import React from "react";
import { Draggable } from "react-beautiful-dnd";
import { THEME } from "../../App";
import IconButton from "@material-ui/core/IconButton";
import DeleteIcon from "@material-ui/icons/Delete";
import { connect } from "react-redux";
import { setMetadataInViewAction } from "../../reducers/SetTagsInView";
import styled from "styled-components";
import { SET_SAVE_DIRTY_FLAG_ACTION_TYPE } from "../../reducers/CurrentOpenFileState";

class Separator extends React.Component {
  onClick(e) {
    e.preventDefault();
    const separators = Array.from(this.props.metadataInView["separators"]);
    let separatorToDelete = this.props.index;
    for (let i = 0; i < separators.length; ++i) {
      if (separators[i] === separatorToDelete) {
        separators.splice(i, 1);
        break;
      }
      // decrement separatorToDelete since current separator pushes next separators up an index
      --separatorToDelete;
    }
    this.props.setMetadataInView({ separators: separators });
    this.props.dispatchSetSaveDirtyFlagAction();
  }

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
            className="separator_container"
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
            <IconButton
              aria-label="delete"
              className="delete_btn"
              style={{
                color: THEME.palette.primary.main,
                borderColor: THEME.palette.primary.main,
                borderWidth: "thin",
                borderStyle: "dashed",
              }}
              onClick={(e) => this.onClick(e)}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Container>
        )}
      </Draggable>
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
)(Separator);
