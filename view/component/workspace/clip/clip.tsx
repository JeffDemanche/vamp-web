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

  return (
    <div
      className={styles["clip"]}
      style={{ width: width, opacity: opacity }}
    ></div>
  );
};

export default Clip;
