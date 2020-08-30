import * as React from "react";
import * as styles from "./cab.less";
import gql from "graphql-tag";
import {
  useCurrentVampId,
  useTrueTime,
  useCurrentUserId
} from "../../../react-hooks";
import { useQuery } from "react-apollo";
import { CabMainRecording } from "../../../state/apollotypes";
import { useWorkspaceLeft } from "../../../workspace-hooks";
import { TemporalZoomContext } from "../workspace-content";
import { useContext } from "react";
import { Oscilloscope } from "../oscilloscope/oscilloscope";

const CAB_MAIN_RECORDING_QUERY = gql`
  query CabMainRecording($vampId: ID!, $userId: ID!) {
    vamp(id: $vampId) @client {
      viewState @client {
        temporalZoom @client
      }
    }
    userInVamp(vampId: $vampId, userId: $userId) @client {
      id @client
      cab @client {
        user @client {
          id @client
        }
        start @client
        duration @client
      }
    }
  }
`;

const CabMainRecording: React.FC = () => {
  const vampId = useCurrentVampId();
  const userId = useCurrentUserId();

  const {
    data: {
      vamp: { viewState },
      userInVamp: { cab }
    }
  } = useQuery<CabMainRecording>(CAB_MAIN_RECORDING_QUERY, {
    variables: { vampId, userId }
  });

  const leftFn = useWorkspaceLeft();
  const left = leftFn(cab.start);

  const trueTime = useTrueTime(200);

  const temporalZoom = useContext(TemporalZoomContext);
  const widthPx = `${100 * (trueTime - cab.start) * temporalZoom}px`;
  const widthNum = 100 * (trueTime - cab.start) * viewState.temporalZoom;

  return (
    <div
      style={{ left, width: widthPx }}
      className={styles["cab-main-recording"]}
    >
      <Oscilloscope
        dimensions={{
          width: widthNum
        }}
      ></Oscilloscope>
    </div>
  );
};

export default CabMainRecording;
