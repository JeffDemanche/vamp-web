import React from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";

import store from "./store/index";

import { VampApp } from "./component/vamp-app.jsx";

ReactDOM.render(
  <Provider store={store}>
    <VampApp />
  </Provider>,
  document.getElementById("app")
);
