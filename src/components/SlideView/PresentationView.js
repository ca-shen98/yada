import React from "react";
import Carousel from "react-material-ui-carousel";

class PresentationView extends React.Component {
  state = {
    currentNumber: 0,
    startIndex: 0,
    slides: this.props.slides,
  };

  render = () => (
    <div>
      <Carousel
        navButtonsAlwaysVisible={true}
        indicators={false}
        animation="slide"
        autoPlay={false}
        interval={10000}
        index={this.state.startIndex}
        next={() => {
          this.setState({
            currentNumber:
              (this.state.currentNumber + 1) % this.state.slides.length,
          });
        }}
        prev={() => {
          this.setState({
            currentNumber:
              (this.state.currentNumber - 1) % this.state.slides.length,
          });
        }}
      >
        {this.state.slides.map((slide, _) => (
          <div>{slide}</div>
        ))}
      </Carousel>
    </div>
  );
}

export default PresentationView;
