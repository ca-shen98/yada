import "bootstrap/dist/css/bootstrap.min.css";
import "./SlideView.css";
import React from "react";
import { connect } from "react-redux";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Slide from "./Slide";
import PresentationView from "./PresentationView";
import TagEditor from "../ViewComponents/TagEditor";
import {
  setMetadataInViewAction,
  setTagsInViewAction,
} from "../../reducers/SetTagsInView";
import FileStorageSystemClient from "../../backend/FileStorageSystemClient";
import { FILE_TYPE } from "../../util/FileIdAndTypeUtils";
import { setToastAction, TOAST_SEVERITY } from "../../reducers/Toast";
import store from "../../store";
import {
  SET_SAVE_DIRTY_FLAG_ACTION_TYPE,
  CLEAR_SAVE_DIRTY_FLAG_ACTION_TYPE,
  CLEAR_SAVE_IN_PROGRESS,
  SET_SAVE_IN_PROGRESS,
} from "../../reducers/CurrentOpenFileState";
import ExitToAppIcon from "@material-ui/icons/ExitToApp";
import PlayArrowIcon from "@material-ui/icons/PlayArrow";
import Button from "@material-ui/core/Button";
import { IconButton } from "@material-ui/core";
import { PERMISSION_TYPE } from "../../util/FileIdAndTypeUtils";

class SlideView extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      allTagsData: props.data.allTagsData,
      presentationSwitch: false,
    };
    this.props.setTagsInView(props.data.tagsInView);
    this.props.setMetadataInView(props.data.metadataInView);
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
          FILE_TYPE.SLIDE_VIEW,
          false,
          this.props.metadataInView
        )
          .then(() => {
            store.dispatch({ type: CLEAR_SAVE_IN_PROGRESS });
            this.props.dispatchSetToastAction({
              message: "Saved view",
              severity: TOAST_SEVERITY.SUCCESS,
              open: true,
            });
          })
          .catch((failure) => {
            store.dispatch({ type: CLEAR_SAVE_IN_PROGRESS });
            store.dispatch({ type: SET_SAVE_DIRTY_FLAG_ACTION_TYPE });
            this.props.dispatchSetToastAction({
              message: failure.message,
              severity: TOAST_SEVERITY.ERROR,
              open: true,
            });
          });
      }
    }
  };

  constructDoc = (tagIds) => {
    return {
      type: "doc",
      content: tagIds.map((t) => this.state.allTagsData[t]["content"]),
    };
  };

  constructSlide = (slideIndex, startIndex, endIndex) => {
    const tagIds = [];
    for (let i = startIndex; i < endIndex; ++i) {
      tagIds.push(this.props.tagsInView[i]);
    }
    const slideContent = {
      index: slideIndex,
      doc: tagIds.length === 0 ? null : this.constructDoc(tagIds),
    };
    return <Slide content={slideContent} />;
  };

  generateSlides = () => {
    const slides = [];
    let slideIndex = 0;
    let tagsIndex = 0;
    let separatorIndex = 0;
    const separators = this.props.metadataInView["separators"] || [];
    while (tagsIndex < this.props.tagsInView.length) {
      const splitIndex =
        separatorIndex < separators.length
          ? separators[separatorIndex++]
          : this.props.tagsInView.length;
      slides.push(
        <Row key={`row_${slideIndex}`} className="justify-content-md-center">
          <Col sm="12">
            {this.constructSlide(slideIndex++, tagsIndex, splitIndex)}
          </Col>
        </Row>
      );
      tagsIndex = splitIndex;
    }
    return slides;
  };

  componentDidMount = () => {
    document.addEventListener("keydown", this.keydownHandler);
  };
  componentDidUpdate = (prevProps) => {
    if (prevProps.data.tagsInView !== this.props.data.tagsInView) {
      this.props.setTagsInView(this.props.data.tagsInView);
    }
    if (prevProps.data.metadataInView !== this.props.data.metadataInView) {
      this.props.setMetadataInView(this.props.data.metadataInView);
    }
  };
  componentWillUnmount = () => {
    document.removeEventListener("keydown", this.keydownHandler);
  };

  render = () => {
    if (!this.state.allTagsData || this.props.tagsInView == null) {
      return (
        <Container>
          <h5>Loading Slide Deck ...</h5>
        </Container>
      );
    } else {
      const slides = this.generateSlides();
      return (
        <Container>
          <Button
            variant="contained"
            color="primary"
            endIcon={<PlayArrowIcon />}
            onClick={() => this.setState({ presentationSwitch: true })}
          >
            Play
          </Button>
          {this.state.presentationSwitch ? (
            <div>
              <IconButton
                onClick={() => this.setState({ presentationSwitch: false })}
                className="exit_presentation"
                color="secondary"
                aria-label="exit presentation"
                component="span"
              >
                <ExitToAppIcon />
              </IconButton>
              <PresentationView slides={slides} />
            </div>
          ) : (
            <div>
              {this.props.userPermission !== PERMISSION_TYPE.READ ? (
                <TagEditor
                  viewType={FILE_TYPE.SLIDE_VIEW}
                  allTagsData={this.state.allTagsData}
                  tagsInView={this.props.tagsInView}
                />
              ) : null}
              <div className="viewContent">{slides}</div>
            </div>
          )}
        </Container>
      );
    }
  };
}

export default connect(
  (state) => ({
    tagsInView: state.tagsInView,
    metadataInView: state.metadataInView,
    currentOpenFileId: state.currentOpenFileId,
    saveDirtyFlag: state.saveDirtyFlag,
    userPermission: state.userPermission,
  }),
  (dispatch) => ({
    setTagsInView: (tagsInView) => dispatch(setTagsInViewAction(tagsInView)),
    setMetadataInView: (metadataInView) =>
      dispatch(setMetadataInViewAction(metadataInView)),
    dispatchSetToastAction: (toast) => dispatch(setToastAction(toast)),
  })
)(SlideView);
