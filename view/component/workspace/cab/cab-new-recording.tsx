import * as React from "react";

import * as styles from "./cab.less";
import { useQuery } from "react-apollo";
import { gql } from "apollo-boost";
import { useTrueTime, useCurrentVampId } from "../../../react-hooks";
import { Oscilloscope } from "../oscilloscope/oscilloscope";
import { CabNewRecording } from "../../../state/apollotypes";

const CAB_NEW_RECORDING_QUERY = gql`
  query CabNewRecording($vampId: ID!) {
    vamp(id: $vampId) @client {
      viewState @client {
        temporalZoom @client
      }
    }
  }
`;

/*
 * CabNew becomes CabNewRecording when it starts recording.
 */
const CabNewRecording = (): JSX.Element => {
  const vampId = useCurrentVampId();
  const {
    data: {
      vamp: { viewState }
    }
  } = useQuery<CabNewRecording>(CAB_NEW_RECORDING_QUERY, {
    variables: { vampId }
  });

  // This is the same method used in timecode.tsx, see there for info. Basically
  // updates the true time and redraws the component every so often.
  const trueTime = useTrueTime(200);

  const width = 100 * trueTime * viewState.temporalZoom;

  return (
    <div
      style={{ width: `${width}px` }}
      className={styles["cab-new-recording"]}
    >
      <Oscilloscope
        dimensions={{
          width: width
        }}
      ></Oscilloscope>
    </div>
  );
};

export { CabNewRecording };
