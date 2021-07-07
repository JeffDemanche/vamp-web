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
  useWorkspaceTime,
  useWorkspaceWidth
} from "../../../util/workspace-hooks";
import { useCabLoops } from "../hooks/use-cab-loops";
import Playhead from "../../element/playhead";
import classNames from "classnames";

const CAB_MAIN_RECORDING_QUERY = gql`
  query CabMainRecording($vampId: ID!, $userId: ID!) {
    userInVamp(vampId: $vampId, userId: $userId) @client {
      id
      cab {
        user {
          id
        }
        start
        duration
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
  const timeFn = useWorkspaceTime();

  const left = leftFn(cab.start);

  const loops = useCabLoops();

  const trueTime = useTrueTime(100);

  const totalWidth = widthFn(cab.duration);
  const recordedWidth = widthFn(trueTime - cab.start);

  return (
    <div
      style={{
        left,
        width: loops ? `${totalWidth}px` : "inherit",
        right: loops ? undefined : "0px"
      }}
      className={classNames(
        styles["cab-main-recording-container"],
        !loops && styles["cab-main-infinite"]
      )}
    >
      <Playhead containerStart={timeFn(left)} />
      <div
        style={{ width: `${recordedWidth}px` }}
        className={styles["cab-main-recording-foreground"]}
      ></div>
    </div>
  );
};

export default CabMainRecording;
