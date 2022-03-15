import * as React from "react";
import { useEffect, useState } from "react";

import { ApolloProvider, QueryResult } from "@apollo/client";
import { Query } from "@apollo/client/react/components";
import { client } from "../state/apollo";

import { withRouter } from "react-router";
import { BrowserRouter, Route, Switch } from "react-router-dom";

import * as styles from "./vamp-app.less";
import VampHeader from "./header/header";
import { ViewWorkspace } from "./workspace/view-workspace";
import { ViewLogin } from "./login/view-login";
import { ViewNotFound } from "./not-found/view-not-found";

import { ME_SERVER } from "../state/queries/user-queries";
import { ViewHome } from "./home/view-home";
import { ContextMenuProvider } from "./element/menu/context-menu-context";

// Used for workspace (and other pages potentially)
const gradientVibes = "linear-gradient(-45deg, #56B0F2, #C471ED)";
const gradientLogin = "linear-gradient(-45deg, #ED71AD, #E1A74F)";
const gradientHome =
  "linear-gradient(-45deg, rgba(235, 87, 87, 1), rgba(242, 153, 74, 1))";

const VampAppBackdrop = withRouter(
  ({
    children,
    match,
    location,
    history
  }: {
    children: React.ReactNode | React.ReactNodeArray;
    match: any;
    location: any;
    history: any;
  }) => {
    const [background, setBackground] = useState(gradientVibes);

    useEffect(() => {
      if (location.pathname === "/login") setBackground(gradientLogin);
      else if (location.pathname === "/") setBackground(gradientHome);
      else setBackground(gradientVibes);
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
          <ContextMenuProvider>
            <VampHeader></VampHeader>
            <Switch>
              <Route path="/" exact component={ViewHome} />
              <Route path="/v/:vampid" component={ViewWorkspace} />
              <Route path="/login" component={ViewLogin} />
              <Route component={ViewNotFound} />
            </Switch>
          </ContextMenuProvider>
        </VampAppBackdrop>
      </ApolloProvider>
    </BrowserRouter>
  );
};

export { client, VampApp };
