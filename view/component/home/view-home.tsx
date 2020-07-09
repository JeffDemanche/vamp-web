import * as React from "react";
import { Query, QueryResult } from "react-apollo";
import { User, ME_CLIENT } from "../../state/queries/user-queries";
import { MeClient } from "../../state/apollotypes";

import * as styles from "./view-home.less";
import { ViewLoading } from "../loading/view-loading";

import { NewVamp } from "../wrapper/new-vamp";
import { ButtonLinkDefault } from "../element/button";
import { ViewNotFound } from "../not-found/view-not-found";

export const ViewHome: React.FunctionComponent = () => {
  const welcomeView = (): JSX.Element => {
    return (
      <div className={styles["home-logged-out"]}>
        <div>
          <h2>Sign in, start creating</h2>
        </div>

        <div>
          <img src={require("../../img/vector/logo.svg")}></img>
        </div>

        <div>
          <div className={styles["buttons"]}>
            <ButtonLinkDefault
              text={"Log In"}
              href="/login"
              style={{
                paddingTop: 10,
                paddingBottom: 10,
                paddingLeft: 60,
                paddingRight: 60,
                marginLeft: "auto",
                marginRight: "auto",
                fontWeight: 100
              }}
            ></ButtonLinkDefault>
          </div>
        </div>
      </div>
    );
  };

  const loggedInView = (me: User): JSX.Element => {
    return (
      <div className={styles["home-logged-in"]}>
        <div className={styles["profile"]}>
          {/* temporary profile picture */}
          <img src={require("../../img/vector/profile-placeholder.svg")}></img>
        </div>

        <div>
          <img src={require("../../img/vector/logo.svg")}></img>
        </div>

        <div>
          <div className={styles["buttons"]}>
            <NewVamp creatorId={me.id}>
              <ButtonLinkDefault
                text={"Solo"}
                href="#"
                style={{
                  paddingTop: 10,
                  paddingBottom: 10,
                  paddingLeft: 60,
                  paddingRight: 60,
                  marginLeft: "auto",
                  marginRight: "auto",
                  fontWeight: 100
                }}
              ></ButtonLinkDefault>
            </NewVamp>
          </div>

          {/* right now this doesn't do anything*/}
          <div className={styles["buttons"]}>
            <ButtonLinkDefault
              text={"Collab"}
              href="#"
              style={{
                paddingTop: 10,
                paddingBottom: 10,
                paddingLeft: 50,
                paddingRight: 50,
                marginLeft: "auto",
                marginRight: "auto",
                fontWeight: 100
              }}
            ></ButtonLinkDefault>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Query query={ME_CLIENT}>
      {({ loading, error, data }: QueryResult<MeClient>): JSX.Element => {
        if (loading) {
          return <ViewLoading></ViewLoading>;
        } else if (error) {
          return <ViewNotFound></ViewNotFound>;
        } else {
          if (data.me == null) {
            return welcomeView();
          } else {
            return loggedInView(data.me);
          }
        }
      }}
    </Query>
  );
};
