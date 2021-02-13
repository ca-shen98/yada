import React from "react";
import Typography from "@material-ui/core/Typography";
import Grid from "@material-ui/core/Grid";
import ReactTypingEffect from "react-typing-effect";

export default class MobilePage extends React.Component {
  render = () => (
    <div
      style={{
        display: "flex",
        flexFlow: "column",
        height: "100vh",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          backgroundColor: "#F5F0E1",
          flex: "1 1 auto",
          display: "flex",
        }}
      >
        <Grid container alignItems="center">
          <Grid container alignItems="center">
            <Grid item xs={1} />
            <Grid item xs={10}>
              <Typography
                variant="h1"
                align="center"
                className={"title"}
                style={{ fontFamily: "Bungee", color: "#1E3D59" }}
              >
                YADA
                <ReactTypingEffect
                  text=""
                  style={{ fontFamily: "Signika" }}
                  speed={10000}
                />
              </Typography>
              <Typography
                variant="h4"
                align="center"
                className={"title"}
                style={{ fontFamily: "Signika", color: "#1E3D59" }}
              >
                Yet Another Docs App
              </Typography>
            </Grid>
            <Grid item xs={1} />
          </Grid>

          <Grid container alignItems="center">
            <Grid item xs={1} />
            <Grid item xs={10}>
              <Typography
                variant="h5"
                align="center"
                style={{ fontFamily: "Signika", color: "#1E3D59" }}
              >
                Oops! <br />
                Seems like we cannot display content for this screen width.{" "}
                <br />
                YADA works best on desktops!
              </Typography>
            </Grid>
            <Grid item xs={1} />
          </Grid>

          <Grid container alignItems="center">
            <Grid item xs={2} />
            <Grid item xs={8} alignItems="center">
              <img
                src={require("../images/graphic.png")}
                style={{ width: "100%" }}
                alt={"Document Graphic"}
              />
            </Grid>
            <Grid item xs={2} />
          </Grid>
        </Grid>
      </div>
    </div>
  );
}
