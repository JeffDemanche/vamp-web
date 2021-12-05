import * as React from "react";

import { gql, useQuery, useMutation } from "@apollo/client";
import * as styles from "./cab.less";
import {
  useCurrentVampId,
  useCurrentUserId,
  usePrevious
} from "../../../util/react-hooks";
import { CabMainQuery, CabMode, UpdateCab } from "../../../state/apollotypes";
import {
  useWorkspaceWidth,
  useWorkspaceLeft,
  useWorkspaceDuration,
  useWorkspaceTime
} from "../../../util/workspace-hooks";
import Playhead from "../../element/playhead";
import { useState, useEffect, useContext, useCallback, useMemo } from "react";
import classNames from "classnames";
import { MultiModeButton } from "../../element/multi-mode-button/multi-mode-button";
import { InfiniteClipIcon } from "../../element/icon/infinite-clip-icon";
import { StackClipIcon } from "../../element/icon/stack-clip-icon";
import { TelescopeClipIcon } from "../../element/icon/telescope-clip-icon";
import { useCabLoops } from "../hooks/use-cab-loops";
import {
  CurrentlyDragging,
  TimelineDraggable
} from "../timeline/timeline-draggable";
import { MetronomeContext } from "../context/metronome-context";
import { PlaybackContext } from "../context/recording/playback-context";

import { GuidelineContext } from "../context/guideline-context";

export const CAB_MAIN_QUERY = gql`
  query CabMainQuery($vampId: ID!, $userId: ID!) {
    userInVamp(vampId: $vampId, userId: $userId) @client {
      user {
        id
      }
      vamp {
        id
      }
      cab {
        user {
          id
        }
        start
        duration
        mode
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
    $mode: CabMode
  ) {
    updateUserInVamp(
      update: {
        userId: $userId
        vampId: $vampId
        cabStart: $start
        cabDuration: $duration
        cabMode: $mode
      }
    ) {
      user {
        id
      }
      vamp {
        id
      }
      cab {
        start
        duration
        mode
      }
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
  const { setIsShowing, setStart, setEnd } = useContext(GuidelineContext);

  const vampId = useCurrentVampId();
  const userId = useCurrentUserId();

  const widthFn = useWorkspaceWidth();
  const leftFn = useWorkspaceLeft();

  const durationFn = useWorkspaceDuration();
  const timeFn = useWorkspaceTime();

  const [adjusting, setAdjusting] = useState(false);

  const { countOff, seek } = useContext(PlaybackContext);

  const [deltaLeft, setDeltaLeft] = useState(0);
  const [deltaWidth, setDeltaWidth] = useState(0);

  const {
    data: {
      userInVamp: {
        cab: { start, duration, mode }
      }
    },
    loading,
    error
  } = useQuery<CabMainQuery>(CAB_MAIN_QUERY, {
    variables: { vampId, userId }
  });

  if (error) console.error(error);

  const loops = useCabLoops();

  const prevStart = usePrevious(start);
  const prevDuration = usePrevious(duration);

  useEffect(() => {
    if (prevStart !== undefined && prevStart !== start) {
      seek(start);

      setDeltaLeft(0);
      setAdjusting(false);
    }
  }, [prevStart, seek, start]);

  useEffect(() => {
    if (prevDuration !== undefined && prevDuration !== duration) {
      setDeltaWidth(0);
      setAdjusting(false);
    }
  }, [duration, prevDuration]);

  const modes = useMemo(
    () => [CabMode.INFINITE, CabMode.STACK, CabMode.TELESCOPE],
    []
  );
  const modeIndex = useMemo(() => modes.indexOf(mode), [modes, mode]);

  // deltaLeft and deltaWidth are values that come from dragging, which we add
  // to left and width to get the temporary dimensions while dragging is taking
  // place.
  const left = useMemo(() => leftFn(start), [leftFn, start]);

  const { snapToBeat } = useContext(MetronomeContext);

  const width = useMemo(() => widthFn(duration), [widthFn, duration]);

  // TimelineDraggable accepts an arbitrary snap function that transforms a
  // delta into a "snapped delta". We have to some timeline transformations to
  // get that to actually snap to the beats.
  const snapFn = useCallback(
    (deltaX: number, currentlyDragging: CurrentlyDragging): number => {
      const offset = currentlyDragging === "right" ? left + width : left;
      return leftFn(snapToBeat(timeFn(offset + deltaX))) - offset;
    },
    [left, leftFn, snapToBeat, timeFn, width]
  );

  const [updateCab] = useMutation<UpdateCab>(UPDATE_CAB);

  const playhead = adjusting ? null : (
    <Playhead containerStart={timeFn(left + deltaLeft)} />
  );

  if (loading) {
    return null;
  } else {
    return (
      <TimelineDraggable
        id="cabmain"
        left={`${left + deltaLeft}px`}
        height={"125px"}
        width={loops ? `${width + deltaWidth}px` : "inherit"}
        style={loops ? undefined : { right: "0px" }}
        className={styles["cab-main-draggable"]}
        snapFn={snapFn}
        onClick={(): void => {
          countOff(true);
        }}
        onDragBegin={(): void => {
          setAdjusting(true);
          setIsShowing(true);
        }}
        onDragDelta={([x], handle): void => {
          if (handle === "move") {
            setDeltaLeft(x);
          }
          if (handle === "right") {
            setDeltaWidth(x);
          }
          if (handle === "left") {
            setDeltaLeft(x);
            setDeltaWidth(-x);
          }
          setStart(timeFn(left + deltaLeft));
          setEnd(timeFn(left + deltaLeft) + durationFn(width + deltaWidth));
        }}
        onDragEnd={(): void => {
          const duration = durationFn(width + deltaWidth);
          if (duration <= 0) {
            // Invalid case.
            setDeltaLeft(0);
            setDeltaWidth(0);
          } else {
            // Do server update.
            updateCab({
              variables: {
                userId,
                vampId,
                duration,
                start: timeFn(left + deltaLeft)
              }
            }).catch(err => {
              console.error(err);
            });
          }
          setIsShowing(false);
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
            <MultiModeButton
              selectedIndex={modeIndex}
              modes={[
                {
                  name: "Infinity",
                  icon: <InfiniteClipIcon />
                },
                { name: "Stack", icon: <StackClipIcon /> },
                { name: "Telescope", icon: <TelescopeClipIcon /> }
              ]}
              onModeChange={(mode, index): void => {
                updateCab({
                  variables: { userId, vampId, mode: modes[index] }
                });
              }}
            ></MultiModeButton>
          </div>
          <img
            className={styles["recordIcon"]}
            src={require("../../../img/vector/record.svg")}
          />
        </div>
      </TimelineDraggable>
    );
  }
};

export default CabMain;
