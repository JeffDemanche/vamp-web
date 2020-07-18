import * as React from "react";

import * as styles from "./cab.less";
import { useQuery } from "react-apollo";
import { gql } from "apollo-boost";
import { useTrueTime, useCurrentVampId } from "../../../react-hooks";
import { CabRecording } from "../../../state/apollotypes";

const CAB_RECORDING_QUERY = gql`
  query CabRecording($vampId: ID!) {
    vamp(id: $vampId) @client {
      viewState @client {
        temporalZoom @client
      }
    }
  }
`;

/**
 * CabNew becomes CabNewRecording when it starts recording.
 */
const CabNewRecording = (): JSX.Element => {
  const vampId = useCurrentVampId();
  const {
    data: {
      vamp: { viewState }
    }
  } = useQuery<CabRecording>(CAB_RECORDING_QUERY, { variables: { vampId } });

  // This is the same method used in timecode.tsx, see there for info. Basically
  // updates the true time and redraws the component every so often.
  const trueTime = useTrueTime(200);

  const width = `${100 * trueTime * viewState.temporalZoom}px`;

  return <div style={{ width }} className={styles["cab-recording"]}></div>;
};

export { CabNewRecording };
