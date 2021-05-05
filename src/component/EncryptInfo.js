import SearchAppBar from "./SearchAppBar.js";
import axios from "axios";
import React from "react";
import configData from ".././config.json";
import { stateToHTML } from "draft-js-export-html";
import { CopyToClipboard } from "react-copy-to-clipboard";
import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import Button from "@material-ui/core/Button";
import { FormattedMessage } from "react-intl";
import { injectIntl } from "react-intl";
import "./EncryptInfo.css";
import Grid from "@material-ui/core/Grid";
import TextField from "@material-ui/core/TextField";
import Select from "@material-ui/core/Select";
import Snackbar from "@material-ui/core/Snackbar";
import MuiAlert from "@material-ui/lab/Alert";
import ReactQuill, { Quill } from "react-quill";
import "react-quill/dist/quill.snow.css";
import QuillResize from "quill-resize-module";
import zh_CN from ".././locale/zh_CN.js";
import en_US from ".././locale/en_US.js";
import locked_png from ".././icons/locked.png";
import xss from "xss";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import LinearProgress from "@material-ui/core/LinearProgress";
import localStorage from "local-storage";

Quill.register("modules/resize", QuillResize);

function Alert(props) {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}

class EncryptInfo extends React.Component {
  state = {
    token: "",
    currentValue: "",
    open: false,
    shareLink: "",
    value: "",
    copied: false,
    showOption: false,
    showOptionBtnText: "",
    age: 0,
    passwordContent: "",
    repeatePasswordContent: "",
    message: "",
    openMessage: false,
    email: "",
    lang: "",
    placeholder: "",
    loading: false,
    disabledSubmit: false,
    beian: false,
  };

  handleChange = (event) => {
    let options = {
      entityStyleFn: (entity) => {
        const entityType = entity.get("type").toLowerCase();
        if (entityType === "image") {
          const data = entity.getData();
          console.log(JSON.stringify(data));
          return {
            element: "img",
            attributes: {
              src: data.url,
            },
            style: {
              // Put styles here...
            },
          };
        }
      },
    };
    const content = stateToHTML(event.getCurrentContent(), options);
    this.setState({ currentValue: content });
  };

  selectShowMoreText() {
    const locale = navigator.language.split(/[-_]/)[0];
    if (locale === "zh") {
      this.setState({ showOptionBtnText: zh_CN.showMoreOption });
    } else {
      this.setState({ showOptionBtnText: en_US.showMoreOption });
    }
  }
  componentDidMount() {
    const locale = navigator.language.split(/[-_]/)[0];
    let language = "en";
    if (locale === "zh") {
      language = locale;
      this.setState({ showOptionBtnText: zh_CN.showMoreOption });
      this.setState({ beian: true });
    } else {
      this.setState({ showOptionBtnText: en_US.showMoreOption });
    }
    this.setState({
      lang: language,
    });
    axios
      .get(`${configData.API_SERVER_URL}/getToken`)
      .then((res) => {
        const token = res.data.data;
        this.setState({ token });
        localStorage.set("temp-token", token);
      })
      .catch((error) => {
        alert("service is not available");
      });
  }

  emailIsValid(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  save = (data) => {
    let htmlContent = this.state.currentValue;
    const { intl } = this.props;
    if (htmlContent === "" || htmlContent === null) {
      alert(intl.formatMessage({ id: "empty_editor_alert" }));
      return;
    }
    // xss filter
    // htmlContent = xss(this.state.currentValue);

    let token = this.state.token;
    let body = {
      content: htmlContent,
      path: token,
    };
    if (this.state.showOption) {
      let secondPasswordUserInput = this.state.passwordContent;
      let sencodPasswordUserConfirm = this.state.repeatePasswordContent;
      if (secondPasswordUserInput !== "") {
        //password_too_long
        if (secondPasswordUserInput.length > 12) {
          this.setState({
            message: intl.formatMessage({ id: "password_too_long" }),
            openMessage: true,
          });
          return;
        }
        //password unmatch
        if (secondPasswordUserInput !== sencodPasswordUserConfirm) {
          this.setState({
            message: intl.formatMessage({ id: "un_match_password" }),
            openMessage: true,
          });
          return;
        }

        body = {
          content: htmlContent,
          path: token,
          expire: this.state.age,
          secondPassword: secondPasswordUserInput,
          lang: this.state.lang,
        };
      } else {
        body = {
          content: htmlContent,
          path: token,
          expire: this.state.age,
          lang: this.state.lang,
        };
      }
    }
    //start loading
    this.setState({
      loading: true,
      disabledSubmit: true,
    });
    axios
      .post(`${configData.API_SERVER_URL}/encryptInfo`, body)
      .then((res) => {
        this.setState({
          loading: false,
          disabledSubmit: false,
        });
        const path = res.data.data;
        let shareLink = `${configData.SERVER_URL}/info/` + path;
        this.setState({ open: true, shareLink: shareLink, copied: true });
      })
      .catch((error) => {
        alert("service is not available");
      });
  };

  openDialog = () => {
    this.setState({ open: true });
  };

  showMoreOption = () => {
    let showState = this.state.showOption;
    this.setState({
      showOption: !showState,
    });
    const locale = navigator.language.split(/[-_]/)[0];
    const { intl } = this.props;
    if (showState) {
      this.setState({
        showOptionBtnText: intl.formatMessage({ id: "showMoreOption" }),
      });
    } else {
      this.setState({
        showOptionBtnText: intl.formatMessage({ id: "showLessOption" }),
      });
    }
  };
  handleSelectChange = (event) => {
    let currentAge = event.target.value;
    this.setState({
      age: currentAge,
    });
  };
  getOptionContent(showOption) {
    let optionContent = "";
    const { intl } = this.props;
    if (showOption) {
      optionContent = (
        <div className="more-option">
          <Grid container>
            <Grid item xs={12} md={12} lg={12} xl={12}>
              <p className="more-option-desc">
                <FormattedMessage id="readTimetip" />
              </p>
              <Select
                native
                value={this.state.age}
                onChange={this.handleSelectChange}
                inputProps={{
                  name: "age",
                  id: "age-native-simple",
                }}
              >
                <option aria-label="None" value="" />
                <option value={30}>
                  {intl.formatMessage({ id: "thirty_seconds" })}
                </option>
                <option value={60}>
                  {intl.formatMessage({ id: "one_minute" })}
                </option>
                <option value={180}>
                  {intl.formatMessage({ id: "three_minutes" })}
                </option>
                <option value={300}>
                  {intl.formatMessage({ id: "five_minutes" })}
                </option>
                <option value={900}>
                  {intl.formatMessage({ id: "fifteen_minutes" })}
                </option>
                <option value={1800}>
                  {intl.formatMessage({ id: "thirty_minutes" })}
                </option>
              </Select>
            </Grid>
            <Grid item xs={12} md={3} lg={3} xl={3}>
              <p className="more-option-desc">
                <FormattedMessage id="enterPasswordtips" />
              </p>
              <TextField
                id="outlined-secondary"
                variant="outlined"
                color="secondary"
                type="password"
                value={this.state.passwordContent}
                onChange={this._handlePasswordChange}
              />
            </Grid>
            <Grid item xs={12} md={3} lg={3} xl={3}>
              <p className="more-option-desc">
                {" "}
                <FormattedMessage id="repeatPasswordtips" />
              </p>
              <TextField
                id="outlined-secondary"
                variant="outlined"
                color="secondary"
                type="password"
                value={this.state.repeatePasswordContent}
                onChange={this._handlerepeatPasswordChange}
              />
            </Grid>
          </Grid>
        </div>
      );
    }
    return optionContent;
  }
  _handlePasswordChange = (e) => {
    this.setState({
      passwordContent: e.target.value,
    });
  };

  _handleEmailChange = (e) => {
    this.setState({
      email: e.target.value,
    });
  };
  _handlerepeatPasswordChange = (e) => {
    this.setState({
      repeatePasswordContent: e.target.value,
    });
  };

  handleEditorChange = (newValue) => {
    this.setState({ currentValue: newValue });
  };

  closeShareDialog = () => {
    this.selectShowMoreText();
    //clean state
    this.setState({
      currentValue: "",
      open: false,
      shareLink: "",
      value: "",
      copied: false,
      showOption: false,
      age: 0,
      passwordContent: "",
      repeatePasswordContent: "",
      message: "",
      openMessage: false,
      email: "",
      lang: "",
      placeholder: "",
      disabledSubmit: false,
    });
    //new token
    axios
      .get(`${configData.API_SERVER_URL}/getToken`)
      .then((res) => {
        const token = res.data.data;
        this.setState({ token });
        localStorage.set("temp-token", token);
      })
      .catch((error) => {
        alert("service is not available");
      });
  };

  render() {
    const { intl } = this.props;
    let optionContent = this.getOptionContent(this.state.showOption);
 
    return (
      <div>
        <SearchAppBar />
        {this.state.loading ? <LinearProgress /> : ""}
        <div style={{ color: "#333", opacity: 0.6 }}>
          <p>
            <FormattedMessage id="introduce" />
          </p>
        </div>
        <div className="cus-text-editor">
          <ReactQuill
            theme="snow"
            value={this.state.currentValue}
            onChange={this.handleEditorChange}
            bounds={".app"}
            placeholder={this.state.placeholder}
          />
        </div>
        {optionContent}
        <div className="show-more-opition">
          <Grid container>
            <Grid item xs={12} md={2} lg={2} xl={2}>
              <div className="confirm-btn">
                <Button
                  variant="contained"
                  color="primary"
                  onClick={this.save}
                  disabled={this.state.disabledSubmit}
                >
                  <FormattedMessage id="createNote" />
                </Button>
              </div>
            </Grid>
            <Grid item xs={12} md={2} lg={2} xl={2}>
              <div className="confirm-btn">
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={this.showMoreOption}
                >
                  {this.state.showOptionBtnText}
                </Button>
              </div>
            </Grid>
          </Grid>
        </div>

        <Dialog open={this.state.open}>
          <DialogTitle id="alert-dialog-title">
            {intl.formatMessage({ id: "success_encryption" })}
          </DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              <p className="encrpty_link_note">{this.state.shareLink}</p>
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <CopyToClipboard
              text={this.state.shareLink}
              onCopy={() => this.setState({ copied: true })}
            >
              <Button color="primary" className="copy_borad_btn">
                {intl.formatMessage({ id: "copyboard" })}
              </Button>
            </CopyToClipboard>
            <Button color="primary" autoFocus onClick={this.closeShareDialog}>
              {intl.formatMessage({ id: "close_dialog" })}
            </Button>
          </DialogActions>
          <p className="encrypt_note_tips">
            <img className="locked_png" src={locked_png} />
            {intl.formatMessage({ id: "encrypt_text_ok" })}
          </p>
        </Dialog>

        <Snackbar
          message={this.state.message}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
          open={this.state.openMessage}
          onClose={() => this.setState({ openMessage: false })}
          autoHideDuration={2000}
        >
          <Alert severity="error">{this.state.message}</Alert>
        </Snackbar>
        <div class="footer">
          {this.state.beian ? (
            <p>
              <a href={"#"} target="_blank">
               
              </a>
            </p>
          ) : (
            ""
          )}
        </div>
      </div>
    );
  }
}

export default injectIntl(EncryptInfo);
