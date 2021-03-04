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
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Switch from "@material-ui/core/Switch";

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

  constructDoc = (tagId) => {
    const node = this.state.allTagsData[tagId]["content"];
    return {
      type: "doc",
      content: [node],
    };
  };

  constructSlide = (index) => {
    const slideContent = {
      index: index,
      doc: this.constructDoc(this.props.tagsInView[index]),
    };
    return <Slide content={slideContent} />;
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
      const slides = [];
      for (let i = 0; i < this.props.tagsInView.length; ++i) {
        slides.push(
          <Row key={`row_${i}`} className="justify-content-md-center">
            <Col sm="12">{this.constructSlide(i)}</Col>
          </Row>
        );
      }
      return (
        <Container>
          <FormControlLabel
            control={
              <Switch
                checked={this.state.presentationSwitch}
                onChange={() => {
                  this.setState({
                    presentationSwitch: !this.state.presentationSwitch,
                  });
                }}
                name="checkedB"
                color="primary"
                className="presentationModeSwitch"
              />
            }
            label="Presentation Mode"
          />
          {this.state.presentationSwitch ? (
            <PresentationView slides={slides} />
          ) : (
            <div>
              <TagEditor
                viewType={FILE_TYPE.SLIDE_VIEW}
                allTagsData={this.state.allTagsData}
                tagsInView={this.props.tagsInView}
              />
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
  }),
  (dispatch) => ({
    setTagsInView: (tagsInView) => dispatch(setTagsInViewAction(tagsInView)),
    setMetadataInView: (metadataInView) =>
      dispatch(setMetadataInViewAction(metadataInView)),
    dispatchSetToastAction: (toast) => dispatch(setToastAction(toast)),
  })
)(SlideView);
