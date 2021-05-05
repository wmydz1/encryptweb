import React from "react";
import renderHTML from "react-render-html";
import axios from "axios";
import SearchAppBar from "./SearchAppBar.js";
import Container from "@material-ui/core/Container";
import "./ViewInfoPassword.css";
import configData from ".././config.json";
import Fab from "@material-ui/core/Fab";
import TextField from "@material-ui/core/TextField";
import { injectIntl } from "react-intl";
import Button from "@material-ui/core/Button";
import Grid from "@material-ui/core/Grid";
import Snackbar from "@material-ui/core/Snackbar";
import MuiAlert from "@material-ui/lab/Alert";
import { FormattedMessage } from "react-intl";
import CircularProgress from "@material-ui/core/CircularProgress";

function Alert(props) {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}

class ViewInfoPassword extends React.Component {
  constructor() {
    super();
    this.state = {
      content: "",
      path: "",
      time: {},
      seconds: "",
      textFieldValue: "",
      showContent: false,
      message: "",
      open: false,
      deleteToken: "",
      loading: false,
      disabledDelete: false,
      disabledConfirmPwd: false,
      lang: "",
    };
    this.timer = 0;
    this.startTimer = this.startTimer.bind(this);
    this.countDown = this.countDown.bind(this);
  }

  componentDidMount() {
    const locale = navigator.language.split(/[-_]/)[0];
    let language = "en";
    if (locale === "zh") {
      language = locale;
    }
    this.setState({
      lang: language,
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

  confirmPassword = () => {
    let passwordInput = this.state.textFieldValue;
    const { intl } = this.props;
    if (passwordInput === null || passwordInput === "") {
      this.setState({
        textFieldValue: "",
        message: intl.formatMessage({ id: "password_empty" }),
        open: true,
      });
      return;
    }
    if (passwordInput.length > 12) {
      this.setState({
        textFieldValue: "",
        message: intl.formatMessage({ id: "password_too_long" }),
        open: true,
      });
      return;
    }
    const {
      match: { params },
    } = this.props;
    let topicId = params.topicId;
    this.setState({ path: topicId });
    const body = {
      path: topicId,
      secondPassword: passwordInput,
      lang: this.state.lang,
    };
    this.setState({ loading: true, disabledConfirmPwd: true });
    axios
      .post(`${configData.API_SERVER_URL}/decryptInfoWithPassword`, body)
      .then((res) => {
        const code = res.data.state;
        let expireTime = res.data.expireTime;
        let deleteToken = res.data.deleteToken;
        this.setState({
          loading: false,
          disabledConfirmPwd: false,
        });
        if (code === "T00407") {
          this.setState({
            textFieldValue: "",
            message: intl.formatMessage({ id: "password_error" }),
            open: true,
          });
          return;
        }
        if ("T00406" === code) {
          alert("error page");
          return;
        }
        if ("T00404" === code) {
          this.props.history.push("/delete");
          return;
        }
        if ("T00000" === code && expireTime !== null && deleteToken !== null) {
          const content = res.data.data;
          this.setState({ showContent: true });
          this.setState({ content: content });
          this.setState({ seconds: expireTime, deleteToken: deleteToken });
          this.startTimer();
        }
      })
      .catch((error) => {
        alert("service is not available");
        this.setState({ loading: false, disabledConfirmPwd: true });
      });
    //show decrypt content
  };

  _handleTextFieldChange = (e) => {
    this.setState({
      textFieldValue: e.target.value,
    });
  };

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

  getContent(showContent) {
    let content;
    if (showContent) {
      content = this.state.loading ? (
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
              disabled={this.state.disabledDelete}
              onClick={this.deleteNow}
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
        </Container>
      );
    } else {
      content = this.state.loading ? (
        <div>
          <CircularProgress className="loading_icon" />
        </div>
      ) : (
        <Container fixed>
          <form>
            <Grid item xs={12} lg={3}>
              <div className="form-item">
                <label className="form-item-label">
                  <FormattedMessage id="enter_extra_password_tips" />
                </label>
              </div>
              <div className="form-item">
                <TextField
                  id="outlined-secondary"
                  variant="outlined"
                  color="secondary"
                  type="password"
                  value={this.state.textFieldValue}
                  onChange={this._handleTextFieldChange}
                />
              </div>
              <div className="form-item">
                <Button
                  onClick={this.confirmPassword}
                  variant="contained"
                  color="primary"
                  disabled={this.state.disabledConfirmPwd}
                >
                  <FormattedMessage id="confirm_btn_text" />
                </Button>
              </div>
            </Grid>
          </form>
          <Snackbar
            message={this.state.message}
            anchorOrigin={{ vertical: "center", horizontal: "center" }}
            open={this.state.open}
            onClose={() => this.setState({ open: false })}
            autoHideDuration={1000}
          >
            <Alert severity="error">{this.state.message}</Alert>
          </Snackbar>
        </Container>
      );
    }
    return content;
  }

  render() {
    let content = this.getContent(this.state.showContent);
    return (
      <div>
        <SearchAppBar />
        {content}
        <Fab
          variant="extended"
          style={{ position: "fixed", right: 20, bottom: 20, opacity: 0.4 }}
        >
          {this.state.seconds}
        </Fab>
      </div>
    );
  }
}
export default injectIntl(ViewInfoPassword);
