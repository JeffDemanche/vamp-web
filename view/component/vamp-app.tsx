import * as React from "react";
import { useEffect, useState } from "react";

import { ApolloProvider } from "@apollo/react-hooks";
import { client } from "../state/apollo";

import { withRouter } from "react-router";
import { BrowserRouter, Route } from "react-router-dom";

import styles = require("./vamp-app.less");
import VampHeader from "./header/header";
import { ViewWorkspace } from "./workspace/view-workspace";
import { ViewLogin } from "./login/view-login";

import { Query, QueryResult } from "react-apollo";
import { gql } from "apollo-boost";
import { ME_SERVER } from "../queries/user-queries";

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

const VampApp: React.FunctionComponent = () => {
  // ViewWorkspace should be able to be changed.
  return (
    <BrowserRouter>
      <ApolloProvider client={client}>
        <Query query={ME_SERVER} fetchPolicy="cache-and-network">
          {({ loading, error, data }: QueryResult): JSX.Element => {
            return null;
          }}
        </Query>
        <VampAppBackdrop>
          <VampHeader></VampHeader>
          <Route path="/v/:vampid" component={ViewWorkspace} />
          <Route path="/login" component={ViewLogin} />
        </VampAppBackdrop>
      </ApolloProvider>
    </BrowserRouter>
  );
};

export { client, VampApp };
