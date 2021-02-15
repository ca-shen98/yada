import React from "react";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Button from "@material-ui/core/Button";
import AboutPage from "./AboutPage";
import LoginPage from "./LoginPage";
import PrivacyPolicyPage from "./PrivacyPolicyPage";
import TermsAndConditionsPage from "./TermsAndConditionsPage";
import "./LandingPage.css";
import Typography from "@material-ui/core/Typography";

const ENDPOINTS = {
  ROOT: "root",
  ABOUT: "about",
  PRIVACY_POLICY: "privacy_policy",
  TERMS_AND_CONDITIONS: "terms_and_conditions",
};

export default class LandingPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      endpoint: ENDPOINTS.ROOT,
    };
  }

  handleRouting = (endpoint) => {
    return () => {
      this.setState({ endpoint: endpoint });
    };
  };

  getPage() {
    let component;
    switch (this.state.endpoint) {
      case ENDPOINTS.ROOT:
        component = <LoginPage />;
        break;
      case ENDPOINTS.ABOUT:
        component = <AboutPage />;
        break;
      case ENDPOINTS.PRIVACY_POLICY:
        component = <PrivacyPolicyPage />;
        break;
      case ENDPOINTS.TERMS_AND_CONDITIONS:
        component = <TermsAndConditionsPage />;
        break;
      default:
        component = <LoginPage />;
        break;
    }
    return component;
  }

  render = () => (
    <div
      style={{
        display: "flex",
        flexFlow: "column",
        height: "100vh",
        overflow: "hidden",
      }}
    >
      <AppBar position="static" class="custom-navbar">
        <Toolbar>
          <Button
            className={"yada-button"}
            title="YADA"
            edge="end"
            aria-label="privacy policy"
            aria-haspopup="true"
            color="secondary"
            style={{ float: "right" }}
            align={"right"}
            onClick={this.handleRouting(ENDPOINTS.ROOT)}
          >
            <img
              src={require("../../images/logo.png")}
              style={{ width: "50px" }}
              alt={"MENU"}
            />
            <Typography
              variant="h5"
              style={{
                fontFamily: "Bungee",
                color: "#F5F0E1",
                paddingLeft: "0.5em",
              }}
            >
              YADA
            </Typography>
          </Button>
          <div className={"fill-remaining"} />
          <div className={"routing-button-container"}>
            <Button
              title="About"
              aria-label="about"
              color="secondary"
              onClick={this.handleRouting(ENDPOINTS.ABOUT)}
            >
              About
            </Button>
            <Button
              title="Privacy Policy"
              aria-label="privacy policy"
              color="secondary"
              onClick={this.handleRouting(ENDPOINTS.PRIVACY_POLICY)}
            >
              Privacy
            </Button>
            <Button
              title="Privacy Policy"
              aria-label="privacy policy"
              color="secondary"
              onClick={this.handleRouting(ENDPOINTS.TERMS_AND_CONDITIONS)}
            >
              Terms and Conditions
            </Button>
          </div>
        </Toolbar>
      </AppBar>
      <div
        style={{
          backgroundColor: "#F5F0E1",
          flex: "1 1 auto",
          display: "flex",
          overflowY: "scroll",
        }}
      >
        {this.getPage()}
      </div>
    </div>
  );
}
