import * as React from "react";

import { gql } from "apollo-boost";
import { Query, QueryResult } from "react-apollo";

const styles = require("./header.less");
import { VampLogo } from "./logo";

import { ButtonLinkDefault } from "../element/button";
import LoggedInUserButton from "./logged-in-user-button";

const ME_QUERY = gql`
  {
    me {
      id
      username
      email
    }
  }
`;

interface Me {
  id: string;
  username: string;
  email: string;
}

const VampHeader = () => {
  const buttonLoggedOut = () => (
    <ButtonLinkDefault
      text="Log In"
      style={{ marginTop: "auto", marginBottom: "auto" }}
      href="/login"
    ></ButtonLinkDefault>
  );
  const buttonLoggedIn = (me: Me) => (
    <LoggedInUserButton
      username={me.username}
      style={{ marginTop: "auto", marginBottom: "auto" }}
    ></LoggedInUserButton>
  );

  return (
    <div className={styles["vamp-header"]}>
      <div className={styles["header-logo-panel"]}>
        <VampLogo></VampLogo>
      </div>
      <div className={styles["header-right-panel"]}>
        <Query query={ME_QUERY}>
          {({ loading, error, data }: QueryResult) => {
            if (loading) {
              return <div>Loading...</div>;
            } else {
              if (data.me == null) {
                return buttonLoggedOut();
              } else {
                return buttonLoggedIn(data.me);
              }
            }
          }}
        </Query>
      </div>
    </div>
  );
};

export default VampHeader;
