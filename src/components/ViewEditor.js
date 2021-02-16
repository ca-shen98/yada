import "./ViewEditor.css";
import React from "react";
import { connect } from "react-redux";
import { FILE_TYPE, NO_OPEN_FILE_ID } from "../util/FileIdAndTypeUtils";
import FileStorageSystemClient from "../backend/FileStorageSystemClient";
import { handleSetCurrentOpenFileId } from "./Navigator";
import CardDeck from "./CardView/CardDeck";
import TextView from "./TextView/TextView";
import { setTagsInViewAction } from "../reducers/SetTagsInView";
import { setToastAction, TOAST_SEVERITY } from "../reducers/Toast";
import { Steps } from "intro.js-react";
import { setNewUserAction } from "../reducers/Steps";
import {
  SET_FILE_LOADING,
  CLEAR_FILE_LOADING,
} from "../reducers/CurrentOpenFileState";
import CircularProgress from "@material-ui/core/CircularProgress";

class ViewEditor extends React.Component {
  state = {
    sourceId: 0,
    viewId: 0,
    data: null,
    fileType: FILE_TYPE.EMPTY,
    steps: [
      {
        title: "Welcome to Views!",
        intro:
          "Here you can make all kinds of views on top of your source document",
      },
      {
        title: "View Editor ⌨️",
        element: ".dragDrop",
        intro:
          "This is a <b>drag and drop</b> interface. Simply drag a tag from the Available Tags column to the Tags in View one to include it!",
      },
      {
        title: "View Preview 👀",
        element: ".viewContent",
        intro:
          "Here you can see the content of the view based on the tags you have selected above",
      },
      {
        title: "Display Mode 🖥",
        element: ".displayModeSwitch",
        intro: "Use this switch to toggle the Display Mode!",
      },
    ],
    cardTourStart: this.props.newUser,
  };

  changeFile = async () => {
    this.props.dispatchSetFileLoading();
    FileStorageSystemClient.doGetView(this.props.currentOpenFileId).then(
      (value) => {
        this.props.dispatchClearFileLoading();
        if (value === null) {
          this.props.dispatchSetToastAction({
            message: "Failed to retrieve view",
            severity: TOAST_SEVERITY.ERROR,
            open: true,
          });
          handleSetCurrentOpenFileId(NO_OPEN_FILE_ID);
        } else {
          let items = value["tags"]["items"];
          Object.keys(items).forEach(function (tagId) {
            if (items[tagId]["content"].type === "list_item") {
              let list_item_content = items[tagId]["content"];
              items[tagId]["content"] = {
                type: "bullet_list",
                content: [list_item_content],
              };
            }
          });
          this.props.setTagsInView([]); // clear any tagsInView currently stored
          this.setState({
            sourceId: this.props.currentOpenFileId.sourceId,
            viewId: this.props.currentOpenFileId.viewId,
            data: {
              tagsInView: value["view"]["order"],
              allTagsData: value["tags"]["items"],
            },
            fileType: this.props.currentOpenFileId.viewType,
          });
        }
      }
    );
  };

  componentDidMount = () => {
    this.changeFile().then(() => console.log("Mounted view file"));
  };
  componentDidUpdate = (prevProps) => {
    if (
      prevProps.currentOpenFileId.sourceId !==
        this.props.currentOpenFileId.sourceId ||
      prevProps.currentOpenFileId.viewId !== this.props.currentOpenFileId.viewId
    ) {
      this.changeFile().then(() => console.log("Updated view file"));
    }
    if (prevProps.newUser !== this.props.newUser) {
      this.setState({ cardTourStart: this.props.newUser });
    }
  };

  onStepsExit = () => {
    this.setState(() => ({ cardTourStart: false }));
    this.props.dispatchNewUserAction(false);
  };

  render = () => {
    return (
      <div className="viewContainer">
        <Steps
          enabled={this.state.cardTourStart && this.props.tagEditorOpened}
          steps={this.state.steps}
          initialStep={0}
          onExit={this.onStepsExit}
          options={{
            disableInteraction: true,
            exitOnOverlayClick: false,
            exitOnEsc: false,
          }}
        />
        {this.props.fileLoading ? (
          <CircularProgress
            color="primary"
            style={{
              position: "absolute",
              top: "40%",
              left: "45%",
              height: "100px",
              width: "100px",
            }}
          />
        ) : this.state.fileType === FILE_TYPE.CARD_VIEW ? (
          <CardDeck data={this.state.data} />
        ) : this.state.fileType === FILE_TYPE.TEXT_VIEW ? (
          <TextView data={this.state.data} />
        ) : null}
      </div>
    );
  };
}

export default connect(
  (state) => ({
    currentOpenFileId: state.currentOpenFileId,
    newUser: state.newUser,
    tagEditorOpened: state.tagEditorOpened,
    fileLoading: state.fileLoading,
  }),
  (dispatch) => ({
    setTagsInView: (tagsInView) => dispatch(setTagsInViewAction(tagsInView)),
    dispatchSetToastAction: (toast) => dispatch(setToastAction(toast)),
    dispatchNewUserAction: (newUser) => dispatch(setNewUserAction(newUser)),
    dispatchSetFileLoading: () => dispatch({ type: SET_FILE_LOADING }),
    dispatchClearFileLoading: () => dispatch({ type: CLEAR_FILE_LOADING }),
  })
)(ViewEditor);
