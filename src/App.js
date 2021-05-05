import React from "react";
import Home from "./component/EncryptInfo.js";
import ViewInfo from "./component/ViewInfo.js";
import ViewInfoPassword from "./component/ViewInfoPassword.js";
import DeleteInfo from "./component/DeleteInfo.js";
import zh_CN from "./locale/zh_CN.js";
import en_US from "./locale/en_US.js";
import { IntlProvider } from "react-intl";

import { BrowserRouter as Router, Switch, Route } from "react-router-dom";

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = { isToggleOn: true, lang: "en" };
    this.handleClick = this.handleClick.bind(this);
  }

  componentDidMount() {
    const locale = navigator.language.split(/[-_]/)[0];
    let language = "zh";
    if (locale === "en") {
      language = locale;
    }
    this.setState({
      lang: language,
    });
  }
  handleClick() {
    this.setState((state) => ({
      isToggleOn: !state.isToggleOn,
    }));
  }

  render() {
    let messages = {};
    messages["en"] = en_US;
    messages["zh"] = zh_CN;
    return (
      <Router>
        <IntlProvider
          locale={this.state.lang}
          messages={messages[this.state.lang]}
        >
          <div>
            <Switch>
              <Route
                path="/info/password/:topicId"
                component={ViewInfoPassword}
              ></Route>
              <Route path="/info/:topicId" component={ViewInfo}></Route>
              <Route path="/delete" component={DeleteInfo}></Route>
              <Route path="/" component={Home}></Route>
            </Switch>
          </div>
        </IntlProvider>
      </Router>
    );
  }
}

export default App;
