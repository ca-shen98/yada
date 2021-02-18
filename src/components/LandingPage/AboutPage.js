import React from "react";
import Grid from "@material-ui/core/Grid";

export default class AboutPage extends React.Component {
  render = () => (
    <div className={"container landing-container"}>
      <h1 className="landing-title-font">About Yada</h1>
      <div className={"paragraph"}>
        <h3 className="landing-title-font">Our Team</h3>
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
            <h5 className="landing-title-font">Akshay Pall</h5>
          </Grid>
          <Grid item xs={6} sm={3} className={"profile-container"}>
            <img
              className={"profile-pic"}
              src={require("../../images/team/carl.jpeg")}
              alt={"Carl Shen"}
            />
            <h5 className="landing-title-font">Carl Shen</h5>
          </Grid>
          <Grid item xs={6} sm={3} className={"profile-container"}>
            <img
              className={"profile-pic"}
              src={require("../../images/team/shehan.jpg")}
              alt={"Shehan Suresh"}
            />
            <h5 className="landing-title-font">Shehan Suresh</h5>
          </Grid>
          <Grid item xs={6} sm={3} className={"profile-container"}>
            <img
              className={"profile-pic"}
              src={require("../../images/team/aravind.jpg")}
              alt={"Aravind Segu"}
            />
            <h5 className="landing-title-font">Aravind Segu</h5>
          </Grid>
        </Grid>
      </div>
      <div className={"paragraph"}>
        <h3 className="landing-title-font">Our Vision</h3>
        <p className="landing-paragraph-font">
          We built YADA to make sure that you{" "}
          <b>never rewrite anything again!</b>
          <br />
          <br />
          When forming ideas, humans rarely think sequentially, going from
          abstract concept to explanation to presentation. Instead, cluster
          thinking is commonly used, which involves approaching ideas from all
          of these fronts, and more, concurrently. Unfortunately, the writing
          tools we use today do not facilitate this way of thinking and are
          limiting our potential.
          <br />
          <br />
          The objective is to build a platform that allows people (writers,
          creators, engineers, etc.) to add their ideas to a knowledge base and
          later organize those ideas into concrete views. The platform should
          eliminate the need to maintain duplicate information across different
          documents by maintaining consistency between the knowledge base and
          the views that are created from it.
          <br />
          <br />
          Yada is a platform for note-taking, document creation, and knowledge
          aggregation, where individual lines/blocks can be annotated/tagged.
          These blocks can be used to generate views that maintain consistency
          with any updates made to the source document. Supported views include
          flash cards, slideshows, and text documents, which can be used for
          various purposes such as studying, presenting, project planning, and
          more. In addition to view generation, tags provide a novel way to
          search text, which makes knowledge navigation and organization a lot
          easier.
          <br />
          <br />
          Yada competes with other note-taking apps such as Google Docs and
          Notion, but neither of them offer the paradigm of a single source of
          truth document being used to generate views. The ability to tag blocks
          within a knowledge base and use them in other documents is a novel
          idea that takes advantage of the way humans normally think and create.
          <br />
          <br />
          We believe that Yada can give users the power to replace the mess of
          written content they have with a more natural model of idea creation
          and presentation.
        </p>
      </div>
    </div>
  );
}
