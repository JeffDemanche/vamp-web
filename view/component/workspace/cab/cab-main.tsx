import * as React from "react";

import { gql, useQuery, useMutation } from "@apollo/client";
import * as styles from "./cab.less";
import {
  useCurrentVampId,
  useCurrentUserId,
  usePrevious
} from "../../../util/react-hooks";
import { CabMainQuery, UpdateCab } from "../../../state/apollotypes";
import {
  useWorkspaceWidth,
  useWorkspaceLeft,
  useWorkspaceDuration,
  useWorkspaceTime
} from "../../../util/workspace-hooks";
import MovableComponent from "../../element/movable-component";
import Playhead from "../../element/playhead";
import { useState, useEffect } from "react";
import { useRecord, useSeek, useStop } from "../../../state/vamp-state-hooks";
import { VampToggleButton } from "../../element/toggle-button";
import classNames = require("classnames");

export const CAB_MAIN_QUERY = gql`
  query CabMainQuery($vampId: ID!, $userId: ID!) {
    userInVamp(vampId: $vampId, userId: $userId) @client {
      id @client
      cab @client {
        user @client {
          id @client
        }
        start @client
        duration @client
        loops @client
      }
    }
  }
`;

const UPDATE_CAB = gql`
  mutation UpdateCab(
    $userId: ID!
    $vampId: ID!
    $start: Float
    $duration: Float
    $loops: Boolean
  ) {
    updateUserInVamp(
      update: {
        userId: $userId
        vampId: $vampId
        cabStart: $start
        cabDuration: $duration
        cabLoops: $loops
      }
    ) {
      id
    }
  }
`;

/**
 * The cab that gets displayed in a Vamp with clips when not recording. Can be
 * moved, has a duration, controls for looping, etc.
 *
 * The cab will also mutate to the server.
 */
const CabMain: React.FC = () => {
  const vampId = useCurrentVampId();
  const userId = useCurrentUserId();

  const widthFn = useWorkspaceWidth();
  const positionFn = useWorkspaceLeft();

  const durationFn = useWorkspaceDuration();
  const timeFn = useWorkspaceTime();

  const [adjusting, setAdjusting] = useState(false);

  const [updateCab] = useMutation<UpdateCab>(UPDATE_CAB);

  const stop = useStop();
  const record = useRecord();
  const seek = useSeek();

  const { data, loading, error } = useQuery<CabMainQuery>(CAB_MAIN_QUERY, {
    variables: { vampId, userId }
  });

  if (error) console.error(error);

  const {
    userInVamp: {
      cab: { start, duration, loops }
    }
  } = data || {
    userInVamp: { id: "", cab: { start: 0, duration: 0, loops: false } }
  };

  const prevStart = usePrevious(start);

  useEffect(() => {
    if (prevStart !== undefined) {
      seek(start);
    }
  }, [start]);

  /**
   * updateCab does not update the local cache, so we're doing it manually here.
   * There's probably a better way of doing this.
   */
  const updateCabWithClient = ({
    userId,
    vampId,
    duration,
    start,
    loops
  }: {
    userId: string;
    vampId: string;
    duration?: number;
    start?: number;
    loops?: boolean;
  }): void => {
    updateCab({
      variables: { userId, vampId, duration, start, loops }
    });
  };

  const playhead = adjusting ? null : <Playhead containerStart={start} />;

  if (loading || !data) {
    return null;
  } else {
    return (
      <MovableComponent
        initialWidth={loops ? widthFn(duration) : undefined}
        height={"125px"}
        initialLeft={positionFn(start)}
        style={loops ? undefined : { right: "0px" }}
        onWidthChanged={(newWidth): void => {
          updateCabWithClient({
            userId,
            vampId,
            duration: durationFn(newWidth),
            start
          });
        }}
        onLeftChanged={(newLeft): void => {
          const start = timeFn(newLeft);
          updateCabWithClient({ userId, vampId, duration, start });
        }}
        onAdjust={(active): void => {
          setAdjusting(active);
        }}
        onClick={(): void => {
          record();
        }}
      >
        <div
          className={classNames(
            styles["cab-main"],
            !loops && styles["cab-main-infinite"]
          )}
        >
          {playhead}
          <div className={styles["track-bounds-controls"]}>
            <VampToggleButton
              on={loops}
              style={{ width: "40px", height: "35px" }}
              onToggle={(e, on): void => {
                e.stopPropagation();
                updateCabWithClient({ userId, vampId, loops: on });
              }}
            >
              <i className={classNames("ri-skip-back-line", "ri-lg")}></i>
            </VampToggleButton>
          </div>
          <img
            className={styles["recordIcon"]}
            src={require("../../../img/vector/record.svg")}
          />
        </div>
      </MovableComponent>
    );
  }
};

export default CabMain;
