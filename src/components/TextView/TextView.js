import "bootstrap/dist/css/bootstrap.min.css";
import "./TextView.css";
import React from "react";
import { connect } from "react-redux";
import Container from "react-bootstrap/Container";
import TagEditor from "../ViewComponents/TagEditor";
import { setTagsInViewAction } from "../../reducers/SetTagsInView";
import FileStorageSystemClient from "../../backend/FileStorageSystemClient";
import { FILE_TYPE } from "../../util/FileIdAndTypeUtils";
import RichMarkdownEditor from "rich-markdown-editor";
import { setToastAction, TOAST_SEVERITY } from "../../reducers/Toast";
import store from "../../store";
import {
  SET_SAVE_DIRTY_FLAG_ACTION_TYPE,
  CLEAR_SAVE_DIRTY_FLAG_ACTION_TYPE,
  CLEAR_SAVE_IN_PROGRESS,
  SET_SAVE_IN_PROGRESS,
} from "../../reducers/CurrentOpenFileState";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Switch from "@material-ui/core/Switch";
import { PERMISSION_TYPE } from "../../util/FileIdAndTypeUtils";

class TextView extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      allTagsData: props.data.allTagsData,
      displaySwitch: false,
    };
    this.props.setTagsInView(props.data.tagsInView);
  }

  keydownHandler = (event) => {
    if (
      (window.navigator.platform.match("Mac")
        ? event.metaKey
        : event.ctrlKey) &&
      event.keyCode === 83
    ) {
      event.preventDefault();
      if (this.props.saveDirtyFlag) {
        store.dispatch({ type: SET_SAVE_IN_PROGRESS });
        store.dispatch({ type: CLEAR_SAVE_DIRTY_FLAG_ACTION_TYPE });
        FileStorageSystemClient.doSaveViewSpec(
          this.props.tagsInView,
          this.props.currentOpenFileId.sourceId,
          this.props.currentOpenFileId.viewId,
          FILE_TYPE.TEXT_VIEW,
          false
        )
          .then(() => {
            store.dispatch({ type: CLEAR_SAVE_IN_PROGRESS });
            this.props.dispatchSetToastAction({
              message: "Saved view",
              severity: TOAST_SEVERITY.SUCCESS,
              open: true,
            });
          })
          .catch(() => {
            store.dispatch({ type: CLEAR_SAVE_IN_PROGRESS });
            store.dispatch({ type: SET_SAVE_DIRTY_FLAG_ACTION_TYPE });
            this.props.dispatchSetToastAction({
              message: "Failed to save view",
              severity: TOAST_SEVERITY.ERROR,
              open: true,
            });
          });
      }
    }
  };

  constructTextView = () => {
    return {
      type: "doc",
      content: this.props.tagsInView.map(
        (t) => this.state.allTagsData[t]["content"]
      ),
    };
  };

  componentDidMount = () => {
    document.addEventListener("keydown", this.keydownHandler);
  };
  componentDidUpdate = (prevProps) => {
    if (prevProps.data.tagsInView !== this.props.data.tagsInView) {
      this.props.setTagsInView(this.props.data.tagsInView);
    }
  };
  componentWillUnmount = () => {
    document.removeEventListener("keydown", this.keydownHandler);
  };

  render = () => {
    if (!this.state.allTagsData || this.props.tagsInView == null) {
      return (
        <Container>
          <h5>Loading Text View ...</h5>
        </Container>
      );
    } else {
      return (
        <Container>
          <FormControlLabel
            control={
              <Switch
                checked={
                  this.state.displaySwitch ||
                  this.props.userPermission === PERMISSION_TYPE.READ
                }
                onChange={() => {
                  this.setState({ displaySwitch: !this.state.displaySwitch });
                }}
                name="checkedB"
                color="primary"
                className="displayModeSwitch"
                disabled={this.props.userPermission === PERMISSION_TYPE.READ}
              />
            }
            label="Display Mode"
          />
          {!this.state.displaySwitch &&
            this.props.userPermission !== PERMISSION_TYPE.READ && (
              <TagEditor
                viewType={FILE_TYPE.TEXT_VIEW}
                allTagsData={this.state.allTagsData}
                tagsInView={this.props.tagsInView}
              />
            )}
          {this.props.tagsInView.length > 0 && (
            <RichMarkdownEditor
              className="TextViewEditor viewContent"
              readOnly={true}
              key={"text_view"}
              defaultValue={JSON.stringify(this.constructTextView())}
              jsonStrValue={true}
            />
          )}
        </Container>
      );
    }
  };
}

export default connect(
  (state) => ({
    tagsInView: state.tagsInView,
    currentOpenFileId: state.currentOpenFileId,
    saveDirtyFlag: state.saveDirtyFlag,
    userPermission: state.userPermission,
  }),
  (dispatch) => ({
    setTagsInView: (tagsInView) => dispatch(setTagsInViewAction(tagsInView)),
    dispatchSetToastAction: (toast) => dispatch(setToastAction(toast)),
  })
)(TextView);
