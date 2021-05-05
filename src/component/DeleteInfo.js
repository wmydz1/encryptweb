import React from "react";
import SearchAppBar from "./SearchAppBar.js";
import Container from "@material-ui/core/Container";
import "./DeleteInfo.css";
import logo404 from "./08_404.gif";
import Box from "@material-ui/core/Box";
import Button from "@material-ui/core/Button";
import { FormattedMessage } from "react-intl";
import { injectIntl } from "react-intl";

class DeleteInfo extends React.Component {
  componentDidMount() {}

  goToEncryptPage = () => {
    this.props.history.push(`/`);
  };
  render() {
    const { intl } = this.props;

    return (
      <div>
        <SearchAppBar />

        <Container>
          <Box justifyContent="center" style={{ textAlign: "center" }}>
            <h3>{intl.formatMessage({ id: "deleteInfo" })}</h3>
            <img src={logo404} />
            <div className="new_note">
              <Button variant="contained" color="primary" onClick={this.goToEncryptPage}>
                <FormattedMessage id="createNewNote" />
              </Button>
            </div>
          </Box>
        </Container>
      </div>
    );
  }
}

export default injectIntl(DeleteInfo);
