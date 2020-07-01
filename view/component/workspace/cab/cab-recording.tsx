import * as React from "react";

import * as styles from "./cab.less";
import { graphql, ChildProps, useQuery } from "react-apollo";
import { gql } from "apollo-boost";
import { useTrueTime, useCurrentVampId } from "../../../react-hooks";
import { CabRecording } from "../../../state/apollotypes";

const CAB_RECORDING_QUERY = gql`
  query CabRecording($vampId: ID!) {
    vamp(id: $vampId) @client {
      start @client
      end @client
      playing @client
      playPosition @client
      playStartTime @client
      recording @client
      viewState @client {
        temporalZoom @client
      }
    }
  }
`;

const CabRecording = (): JSX.Element => {
  const vampId = useCurrentVampId();
  const {
    data: {
      vamp: {
        start,
        end,
        playing,
        playPosition,
        playStartTime,
        recording,
        viewState
      }
    }
  } = useQuery<CabRecording>(CAB_RECORDING_QUERY, { variables: { vampId } });

  // This is the same method used in timecode.tsx, see there for info. Basically
  // updates the true time and redraws the component every so often.
  const trueTime = useTrueTime(
    playing,
    playPosition,
    playStartTime,
    start,
    end,
    200
  );

  const width = `${100 * trueTime * viewState.temporalZoom}px`;

  return <div style={{ width }} className={styles["cab-recording"]}></div>;
};

export { CabRecording };
