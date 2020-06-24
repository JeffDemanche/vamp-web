import * as React from "react";
import { useQuery } from "react-apollo";
import { gql } from "apollo-boost";

import styles = require("./clip.less");

interface ClipProps {
  clip: {
    id: string;
    audio: {
      id: string;
      filename: string;
      storedLocally: boolean;
      tempFilename: string;
      duration: number;
    };
  };
}

const VIEWSTATE_QUERY = gql`
  query ViewState {
    viewState @client {
      temporalZoom
    }
  }
`;

const Clip: React.FunctionComponent<ClipProps> = ({ clip }: ClipProps) => {
  const { data } = useQuery(VIEWSTATE_QUERY);

  const width = `${100 * clip.audio.duration * data.viewState.temporalZoom}px`;
  const opacity = clip.audio.storedLocally ? 1.0 : 0.7;

  const synced = clip.audio.filename !== "" ? "" : "not synced";

  return (
    <div className={styles["clip"]} style={{ width: width, opacity: opacity }}>
      {synced}
    </div>
  );
};

export default Clip;
