import * as React from "react";
import * as styles from "./cab.less";
import { gql, useQuery } from "@apollo/client";
import {
  useCurrentVampId,
  useTrueTime,
  useCurrentUserId
} from "../../../util/react-hooks";
import { CabMainRecording } from "../../../state/apollotypes";
import {
  useWorkspaceLeft,
  useWorkspaceWidth
} from "../../../util/workspace-hooks";
import { Oscilloscope } from "../oscilloscope/oscilloscope";

const CAB_MAIN_RECORDING_QUERY = gql`
  query CabMainRecording($vampId: ID!, $userId: ID!) {
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
      userInVamp: { cab }
    }
  } = useQuery<CabMainRecording>(CAB_MAIN_RECORDING_QUERY, {
    variables: { vampId, userId }
  });

  const leftFn = useWorkspaceLeft();
  const widthFn = useWorkspaceWidth();

  const left = leftFn(cab.start);

  const trueTime = useTrueTime(200);

  const widthNum = widthFn(trueTime - cab.start);

  return (
    <div
      style={{ left, width: `${widthNum}px` }}
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
