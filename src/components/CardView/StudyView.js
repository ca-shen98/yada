import React from "react";
import Carousel from "react-material-ui-carousel";
import Typography from "@material-ui/core/Typography";
import ShuffleIcon from "@material-ui/icons/Shuffle";
import Chip from "@material-ui/core/Chip";

class StudyView extends React.Component {
  state = {
    currentNumber: 0,
    startIndex: 0,
    cards: this.props.cards,
  };

  componentDidUpdate = (prevProps) => {
    if (this.props.cards !== prevProps.cards) {
      this.setState({
        cards: this.props.cards,
      });
    }
  };

  shuffleCards = () => {
    let shuffledCards = this.state.cards;
    let i = shuffledCards.length - 1;
    while (i > 0) {
      const j = Math.floor(Math.random() * i);
      const temp = shuffledCards[i];
      shuffledCards[i] = shuffledCards[j];
      shuffledCards[j] = temp;
      i--;
    }
    this.setState({ cards: shuffledCards, startIndex: 3 });
  };

  render = () => {
    return (
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
                (this.state.currentNumber + 1) % this.state.cards.length,
            });
          }}
          prev={() => {
            this.setState({
              currentNumber:
                (this.state.currentNumber - 1) % this.state.cards.length,
            });
          }}
        >
          {this.state.cards.map((card, i) => (
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
            {this.state.currentNumber + 1}/{this.state.cards.length}
          </Typography>
          <Chip
            label="Shuffle"
            clickable
            color="primary"
            onDelete={this.shuffleCards}
            onClick={this.shuffleCards}
            deleteIcon={<ShuffleIcon />}
            variant="outlined"
          />
        </div>
      </div>
    );
  };
}

export default StudyView;
