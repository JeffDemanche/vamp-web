import * as React from "react";

import { Clip } from "./clip/clip";
import { PlayPanel } from "./play-panel/play-panel";
import { Query, QueryResult } from "react-apollo";
import { VAMP } from "../../queries/vamp-queries";
import { RouteComponentProps } from "react-router";

const styles = require("./view-workspace.less");

interface MatchParams {
  vampid: string;
}

interface ViewWorkspaceProps extends RouteComponentProps<MatchParams> {}

const ViewWorkspace = (props: ViewWorkspaceProps) => {
  return (
    <Query query={VAMP} variables={{ id: props.match.params.vampid }}>
      {({ loading, error, data }: QueryResult) => {
        if (loading) {
          // TODO Loading screen?
          return <div>Loading...</div>;
        } else {
          console.log(data);
          if (!data || data.vamp == null) {
            return <div>Vamp not found :(</div>;
          } else {
            return (
              <div className={styles["workspace"]}>
                <div className={styles["play-and-tracks"]}>
                  <div className={styles["play-panel"]}>
                    <PlayPanel></PlayPanel>
                  </div>
                  <div className={styles["clips-panel"]}>
                    <Clip></Clip>
                  </div>
                </div>
              </div>
            );
          }
        }
      }}
    </Query>
  );
};

export { ViewWorkspace };
