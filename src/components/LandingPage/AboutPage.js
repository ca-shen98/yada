import React from "react";
import Grid from "@material-ui/core/Grid";

export default class AboutPage extends React.Component {
  render = () => (
    <div className={"container landing-container"}>
      <h1>About Yada</h1>
      <div className={"paragraph"}>
        <h3>Our Team</h3>
        <p>
          We are a team of 4 Software Engineering students from the University
          of Waterloo.
        </p>
        <Grid container spacing={3}>
          <Grid item xs={6} sm={3} className={"profile-container"}>
            <img
              className={"profile-pic"}
              src={require("../../images/team/akshay.png")}
              alt={"Akshay Pall"}
            />
            <h5>Akshay Pall</h5>
          </Grid>
          <Grid item xs={6} sm={3} className={"profile-container"}>
            <img
              className={"profile-pic"}
              src={require("../../images/team/carl.jpeg")}
              alt={"Carl Shen"}
            />
            <h5>Carl Shen</h5>
          </Grid>
          <Grid item xs={6} sm={3} className={"profile-container"}>
            <img
              className={"profile-pic"}
              src={require("../../images/team/shehan.jpg")}
              alt={"Shehan Suresh"}
            />
            <h5>Shehan Suresh</h5>
          </Grid>
          <Grid item xs={6} sm={3} className={"profile-container"}>
            <img
              className={"profile-pic"}
              src={require("../../images/team/aravind.jpg")}
              alt={"Aravind Segu"}
            />
            <h5>Aravind Segu</h5>
          </Grid>
        </Grid>
      </div>
      <div className={"paragraph"}>
        <h3>Our Vision</h3>
        <p>
          We built YADA to make sure that you{" "}
          <b>never rewrite anything again!</b>
        </p>
      </div>
    </div>
  );
}
