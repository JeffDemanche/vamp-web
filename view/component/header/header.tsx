import * as React from "react";

import { gql } from "apollo-boost";
import { Query, QueryResult } from "react-apollo";

const styles = require("./header.less");
import { VampLogo } from "./logo";

import { ButtonLinkDefault } from "../element/button";
import LoggedInUserButton from "./logged-in-user-button";
import { User, ME } from "../../queries/user-queries";

const VampHeader = () => {
  const buttonLoggedOut = () => (
    <ButtonLinkDefault
      text="Log In"
      style={{ marginTop: "auto", marginBottom: "auto" }}
      href="/login"
    ></ButtonLinkDefault>
  );
  const buttonLoggedIn = (me: User) => (
    <LoggedInUserButton
      style={{ marginTop: "auto", marginBottom: "auto" }}
      me={me}
    ></LoggedInUserButton>
  );

  return (
    <div className={styles["vamp-header"]}>
      <div className={styles["header-logo-panel"]}>
        <VampLogo></VampLogo>
      </div>
      <div className={styles["header-right-panel"]}>
        <Query query={ME}>
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
