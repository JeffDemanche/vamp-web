import * as React from "react";

import { Query, QueryResult } from "react-apollo";

import styles = require("./header.less");
import { VampLogo } from "./logo";

import { ButtonLinkDefault } from "../element/button";
import LoggedInUserButton from "./logged-in-user-button";
import { User, ME } from "../../queries/user-queries";

const VampHeader: React.FunctionComponent = () => {
  const buttonLoggedOut = (): JSX.Element => (
    <ButtonLinkDefault
      text="Log In"
      style={{ marginTop: "auto", marginBottom: "auto" }}
      href="/login"
    ></ButtonLinkDefault>
  );
  const buttonLoggedIn = (me: User): JSX.Element => (
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
          {({ loading, error, data }: QueryResult): JSX.Element => {
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
