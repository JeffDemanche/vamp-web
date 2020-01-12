import * as React from "react";
import { useEffect, useState } from "react";

import ApolloClient from "apollo-boost";
import { ApolloProvider } from "@apollo/react-hooks";

const client = new ApolloClient({
  uri: "http://localhost:4567/api"
});

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
      <div className={styles["vamp-app"]} style={{ background: background }}>
        {children}
      </div>
    );
  }
);

/**
 * All this component does is check the user's status through
 * user-api-endpoint.ts. If a user is logged in, this should update the user
 * value in the Redux store. If not, the Redux user should become null. This
 * call dispatches through Redux, so any components mapped to the store should
 * update if this changes.
 */
const UserWrapper = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};

const VampApp = () => {
  // ViewWorkspace should be able to be changed.
  return (
    <BrowserRouter>
      <ApolloProvider client={client}>
        <UserWrapper>
          <VampAppBackdrop>
            <VampHeader></VampHeader>
            <Route path="/v/:vampid" component={ViewWorkspace} />
            <Route path="/login" component={ViewLogin} />
          </VampAppBackdrop>
        </UserWrapper>
      </ApolloProvider>
    </BrowserRouter>
  );
};

export { VampApp };
