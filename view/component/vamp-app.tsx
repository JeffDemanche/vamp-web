import * as React from "react";
import { useEffect, useState } from "react";

import ApolloClient from "apollo-boost";
import { ApolloProvider } from "@apollo/react-hooks";

const client = new ApolloClient({
  uri: "http://localhost:4567/api"
})

const { withRouter } = require("react-router");
const { BrowserRouter, Route } = require("react-router-dom");

const styles = require("./vamp-app.less");
import VampHeader from "./header/header";
import { ViewWorkspace } from "./workspace/view-workspace";
import { ViewLogin } from "./login/view-login";

// Used for workspace (and other pages potentially)
const gradientVibes = "linear-gradient(-45deg, #56B0F2, #C471ED)";
const gradientLogin = "linear-gradient(-45deg, #ED71AD, #E1A74F)";

const VampAppBackdrop = withRouter(
  ({
    children,
    match,
    location,
    history
  }: {
    children: React.ReactNodeArray;
    match: any;
    location: any;
    history: any;
  }) => {
    const [background, setBackground] = useState(gradientVibes);
    
    useEffect(() => {
      if (location.pathname === "/login") setBackground(gradientLogin);
    }, [location.pathname]);

    return (
      <div
        className={styles["vamp-app"]}
        style={{ background: background }}
      >
        {children}
      </div>
    );
  }
);

const VampApp = () => {
  // ViewWorkspace should be able to be changed.
  return (
    <BrowserRouter>
      <ApolloProvider client={client}>
        <VampAppBackdrop>
          <VampHeader></VampHeader>
          <Route path="/v/:vampid" component={ViewWorkspace} />
          <Route path="/login" component={ViewLogin} />
        </VampAppBackdrop>
      </ApolloProvider>
    </BrowserRouter>
  );
};

export { VampApp };
