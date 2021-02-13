import "./Editor.css";
import React from "react";
import { connect } from "react-redux";
import SourceEditorWithTagFilters from "./SourceEditorWithTagFiltersInput";
import {
  checkSourceFileId,
  checkViewFileId,
  FILE_TYPE,
} from "../util/FileIdAndTypeUtils";
import ViewEditor from "./ViewEditor";

const DEFAULT_STATE = {
  fileType: FILE_TYPE.EMPTY,
};

class EditorManager extends React.Component {
  state = DEFAULT_STATE;

  changeFile = () => {
    if (checkSourceFileId(this.props.currentOpenFileId)) {
      this.setState({ fileType: FILE_TYPE.SOURCE });
    } else if (checkViewFileId(this.props.currentOpenFileId)) {
      this.setState({ fileType: FILE_TYPE.CARD_VIEW });
    } else {
      this.setState({ fileType: FILE_TYPE.EMPTY });
    }
  };

  componentDidMount = () => {
    this.changeFile();
  };

  componentDidUpdate = (prevProps) => {
    if (
      prevProps.currentOpenFileId.sourceId !==
        this.props.currentOpenFileId.sourceId ||
      prevProps.currentOpenFileId.viewId !== this.props.currentOpenFileId.viewId
    ) {
      this.changeFile();
    }
  };

  render = () => {
    return (
      <div className="MainContainer">
        <div className="editor_container">
          {this.state.fileType === FILE_TYPE.EMPTY ? (
            <div className="placeholder_editor">
              <h5>Click or create a new document from the left pane</h5>
            </div>
          ) : this.state.fileType === FILE_TYPE.SOURCE ? (
            <SourceEditorWithTagFilters />
          ) : (
            <ViewEditor />
          )}
        </div>
      </div>
    );
  };
}

export default connect((state) => ({
  currentOpenFileId: state.currentOpenFileId,
  currentOpenFileName: state.currentOpenFileName,
}))(EditorManager);
