import * as React from "react";

import { gql } from "apollo-boost";
import { graphql } from "react-apollo";
import { useQuery } from "@apollo/react-hooks";

const styles = require("./header.less");
import { VampLogo } from "./logo";

import { ButtonLinkDefault } from "../input/button";

const meQuery = gql`
  {
    me {
      username
    }
  }
`;

interface MeUser {
  username: string;
}

interface MeData {
  me: MeUser
}

interface MeVars {
}

const VampHeader = () => {
  // RE APOLLO RE GRAPHQL
  // https://www.apollographql.com/docs/react/development-testing/static-typing/
  // This is the functional way to do GraphQL queries with TS. Note the 
  // interfaces above.
  const {loading, data} = useQuery<MeData, MeVars>(meQuery, {variables: {}});

  const button =
    loading || data.me == null ? (
      <ButtonLinkDefault
        text="Log In"
        style={{ marginTop: "auto", marginBottom: "auto" }}
        href="/login"
      ></ButtonLinkDefault>
    ) : (
      <ButtonLinkDefault
        text={data.me.username}
        style={{ marginTop: "auto", marginBottom: "auto" }}
        href="/login"
      ></ButtonLinkDefault>
    );

  return (
    <div className={styles["vamp-header"]}>
      <div className={styles["header-logo-panel"]}>
        <VampLogo></VampLogo>
      </div>
      <div className={styles["header-right-panel"]}>{button}</div>
    </div>
  );
};

export default graphql(meQuery)(VampHeader);
