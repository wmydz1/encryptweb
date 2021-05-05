import React from "react";
import renderHTML from "react-render-html";
import axios from "axios";
import SearchAppBar from "./SearchAppBar.js";
import Container from "@material-ui/core/Container";
import "./ViewInfo.css";
import configData from ".././config.json";
import Fab from "@material-ui/core/Fab";
import Grid from "@material-ui/core/Grid";
import Button from "@material-ui/core/Button";
import { FormattedMessage } from "react-intl";
import CircularProgress from "@material-ui/core/CircularProgress";

export default class ViewInfo extends React.Component {
  constructor() {
    super();
    this.state = {
      content: "",
      path: "",
      time: {},
      seconds: "",
      deleteToken: "",
      loading: true,
      disabledDelete: false,
      lang: "",
    };
    this.timer = 0;
    this.startTimer = this.startTimer.bind(this);
    this.countDown = this.countDown.bind(this);
  }

  componentDidMount() {
    const {
      match: { params },
    } = this.props;
    let topicId = params.topicId;
    this.setState({ path: topicId });

    const locale = navigator.language.split(/[-_]/)[0];
    let language = "en";
    if (locale === "zh") {
      language = locale;
    }

    const body = {
      path: topicId,
      lang: language,
    };

    axios
      .post(`${configData.API_SERVER_URL}/decryptInfo`, body)
      .then((res) => {
        const content = res.data.data;
        this.setState({ content: content });
        const code = res.data.state;
        let expireTime = res.data.expireTime;
        let deleteToken = res.data.deleteToken;
        if ("T00301" === code) {
          this.props.history.push(`/info/password/${topicId}`);
          return;
        }
        if (expireTime === null || "T00000" !== code) {
          this.props.history.push("/delete");
          return;
        }
        if ("T00000" === code && expireTime != null) {
          this.setState({
            seconds: expireTime,
            deleteToken: deleteToken,
            loading: false,
          });
          this.startTimer();
        }
      })
      .catch((error) => {
        alert("service is not available");
      });
  }

  startTimer() {
    if (this.timer === 0 && this.state.seconds > 0) {
      this.timer = setInterval(this.countDown, 1000);
    }
  }

  countDown() {
    // Remove one second, set state so a re-render happens.
    let seconds = this.state.seconds - 1;
    this.setState({
      seconds: seconds,
    });
    let path = this.state.path;
    const body = {
      path: path,
      deleteToken: this.state.deleteToken,
    };

    // Check if we're at zero.
    if (seconds === 0) {
      clearInterval(this.timer);
      setTimeout(() => {
        // window.location.reload(false);
        let that = this;
        axios
          .post(`${configData.API_SERVER_URL}/deleteInfo`, body)
          .then((res) => {
            const code = res.data.state;
          })
          .catch((error) => {
            alert("service is not available");
          });
        this.props.history.push("/delete");
      }, 2000);
    }
  }

  secondsToTime(secs) {
    return secs;
  }

  goToEncryptPage = () => {
    this.props.history.push(`/`);
  };

  deleteNow = () => {
    let path = this.state.path;
    const body = {
      path: path,
      deleteToken: this.state.deleteToken,
    };
    this.setState({
      disabledDelete: true,
    });
    axios
      .post(`${configData.API_SERVER_URL}/deleteInfo`, body)
      .then((res) => {
        const code = res.data.state;
        if ("T00000" === code) {
          this.props.history.push("/delete");
          return;
        }
      })
      .catch((error) => {
        alert("service is not available");
      });
  };
  render() {
    return (
      <div>
        <SearchAppBar />
        {this.state.loading ? (
          <div>
            <CircularProgress className="loading_icon" />
          </div>
        ) : (
          <Container fixed>
            <div className="html-preview">{renderHTML(this.state.content)}</div>
            <Grid container>
              <Button
                variant="contained"
                color="primary"
                onClick={this.deleteNow}
                disabled={this.state.disabledDelete}
              >
                <FormattedMessage id="delete_note_now" />
              </Button>
              <div className="new_note">
                <Button
                  variant="contained"
                  color="primary"
                  onClick={this.goToEncryptPage}
                >
                  <FormattedMessage id="createNewNote" />
                </Button>
              </div>
              <div className="tips_note">
                <FormattedMessage id="timer_tips" />
              </div>
            </Grid>
            <Fab
              variant="extended"
              style={{ position: "fixed", right: 20, bottom: 20, opacity: 0.4 }}
            >
              {this.state.seconds}
            </Fab>
          </Container>
        )}
      </div>
    );
  }
}
