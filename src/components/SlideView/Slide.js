import React from "react";
import RichMarkdownEditor from "rich-markdown-editor";
import BootstrapCard from "react-bootstrap/Card";

class Slide extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      key: this.props.content["index"],
      doc: this.props.content["doc"],
    };
    this.createBootstrapSlide = this.createBootstrapSlide.bind(this);
  }

  createBootstrapSlide(key, json) {
    return (
      <BootstrapCard
        key={key}
        text="black"
        className="BootstrapSlide"
        onClick={this.handleClick}
      >
        {json && (
          <RichMarkdownEditor
            className="Slide"
            readOnly={true}
            key={`slide${key}`}
            defaultValue={JSON.stringify(json)}
            jsonStrValue={true}
          />
        )}
      </BootstrapCard>
    );
  }

  render = () => {
    const content = this.props.content;
    if (content !== undefined) {
      console.log(content);
      return this.createBootstrapSlide(content["index"], content["doc"]);
    } else {
      return null;
    }
  };
}

export default Slide;
