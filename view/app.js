import * as React from "react";
import * as ReactDOM from "react-dom";
import { Provider } from "react-redux";

import store from "./redux/store/index";

import "bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

import { VampApp } from "./component/vamp-app";

ReactDOM.render(
  <Provider store={store}>
    <VampApp />
  </Provider>,
  document.getElementById("app")
);
