import * as React from "react";

import { Clip } from "./clip/clip";
import { PlayPanel } from "./play-panel/play-panel";
import { Query, QueryResult } from "react-apollo";
import { VAMP } from "../../queries/vamp-queries";
import { RouteComponentProps } from "react-router";

import styles = require("./view-workspace.less");

interface MatchParams {
  vampid: string;
}

type ViewWorkspaceProps = RouteComponentProps<MatchParams>;

const ViewWorkspace: React.FunctionComponent<ViewWorkspaceProps> = props => {
  return (
    <Query query={VAMP} variables={{ id: props.match.params.vampid }}>
      {({ loading, error, data }: QueryResult): JSX.Element => {
        if (loading) {
          // TODO Loading screen?
          return <div>Loading...</div>;
        } else {
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
