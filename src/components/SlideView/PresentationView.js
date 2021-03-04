import React from "react";
import Carousel from "react-material-ui-carousel";
import Typography from "@material-ui/core/Typography";
import ShuffleIcon from "@material-ui/icons/Shuffle";
import Chip from "@material-ui/core/Chip";

class PresentationView extends React.Component {
  state = {
    currentNumber: 0,
    startIndex: 0,
    slides: this.props.slides,
  };

  shuffleSlides = () => {
    let shuffledSlides = this.state.slides;
    let i = shuffledSlides.length - 1;
    while (i > 0) {
      const j = Math.floor(Math.random() * i);
      const temp = shuffledSlides[i];
      shuffledSlides[i] = shuffledSlides[j];
      shuffledSlides[j] = temp;
      i--;
    }
    this.setState({ slides: shuffledSlides, startIndex: 3 });
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
        {this.state.slides.map((card, i) => (
          <div>{card}</div>
        ))}
      </Carousel>
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          flexWrap: "nowrap",
          justifyContent: "space-between",
        }}
      >
        <div />
        <Typography variant="h6" style={{ color: "#1E3D59" }}>
          {this.state.currentNumber + 1}/{this.state.slides.length}
        </Typography>
        <Chip
          label="Shuffle"
          clickable
          color="primary"
          onDelete={this.shuffleSlides}
          onClick={this.shuffleSlides}
          deleteIcon={<ShuffleIcon />}
          variant="outlined"
        />
      </div>
    </div>
  );
}

export default PresentationView;
