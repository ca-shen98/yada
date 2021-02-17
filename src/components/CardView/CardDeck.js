import "bootstrap/dist/css/bootstrap.min.css";
import "./CardDeck.css";
import React from "react";
import { connect } from "react-redux";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Card from "./Card";
import StudyView from "./StudyView";
import TagEditor from "../ViewComponents/TagEditor";
import { setTagsInViewAction } from "../../reducers/SetTagsInView";
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

class CardDeck extends React.Component {
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
          FILE_TYPE.CARD_VIEW,
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

  constructCard = (index) => {
    const cardContent = { index: index };
    cardContent["front"] = this.constructDoc(this.props.tagsInView[index]);
    if (index + 1 < this.props.tagsInView.length) {
      cardContent["back"] = this.constructDoc(this.props.tagsInView[index + 1]);
    } else {
      cardContent["back"] = null;
    }
    return <Card content={cardContent} />;
  };
  componentDidMount = () => {
    document.addEventListener("keydown", this.keydownHandler);
    console.log("Cards Mounted");
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
          <h5>Loading Card Deck ...</h5>
        </Container>
      );
    } else {
      const cards = [];
      if (this.state.displaySwitch) {
        for (let i = 0; i < this.props.tagsInView.length; i += 2) {
          cards.push(this.constructCard(i));
        }
      } else {
        for (let i = 0; i < this.props.tagsInView.length; i += 4) {
          cards.push(
            <Row key={`row_${i % 4}`} className="justify-content-md-center">
              <Col lg="12" xl="6">
                {this.constructCard(i)}
              </Col>
              <Col lg="12" xl="6">
                {i + 2 < this.props.tagsInView.length &&
                  this.constructCard(i + 2)}
              </Col>
            </Row>
          );
        }
      }
      return (
        <Container>
          <FormControlLabel
            control={
              <Switch
                checked={this.state.displaySwitch}
                onChange={() => {
                  this.setState({ displaySwitch: !this.state.displaySwitch });
                }}
                name="checkedB"
                color="primary"
                className="displayModeSwitch"
              />
            }
            label="Display Mode"
          />
          {this.state.displaySwitch ? (
            <StudyView cards={cards} />
          ) : (
            <div>
              <TagEditor
                viewType={FILE_TYPE.CARD_VIEW}
                allTagsData={this.state.allTagsData}
                tagsInView={this.props.tagsInView}
              />
              <div className="viewContent">{cards}</div>
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
    currentOpenFileId: state.currentOpenFileId,
    saveDirtyFlag: state.saveDirtyFlag,
  }),
  (dispatch) => ({
    setTagsInView: (tagsInView) => dispatch(setTagsInViewAction(tagsInView)),
    dispatchSetToastAction: (toast) => dispatch(setToastAction(toast)),
  })
)(CardDeck);
