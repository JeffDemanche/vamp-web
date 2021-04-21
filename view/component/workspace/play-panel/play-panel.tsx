import * as React from "react";

import { PlayStopButton } from "./play-stop-button";

import { BPMSetting } from "./bpm-setting";
import { BeatsPerBarSetting } from "./beats-per-bar-setting";
import { MetronomeSetting } from "./metronome-setting";

import * as styles from "./play-panel.less";
import Timecode from "./timecode";
import { useCurrentVampId, useHover } from "../../../util/react-hooks";
import { useEffect, useState } from "react";
import { TitleSetting } from "./title-setting";
import gql from "graphql-tag";
import { useQuery } from "@apollo/client";
import { TimecodeCountoff } from "./timecode-countoff";
import { PlayPanelQuery } from "../../../state/apollotypes";

const PLAY_PANEL_QUERY = gql`
  query PlayPanelQuery($vampId: ID!) {
    vamp(id: $vampId) @client {
      countingOff
    }
  }
`;

const PlayPanel: React.FunctionComponent = () => {
  const vampId = useCurrentVampId();

  const {
    data: {
      vamp: { countingOff }
    }
  } = useQuery<PlayPanelQuery>(PLAY_PANEL_QUERY, { variables: { vampId } });

  const [width, setWidth] = useState(-1);

  const [hoverRef, isHovered] = useHover();

  useEffect(() => {
    if (isHovered) {
      setWidth(hoverRef.current ? hoverRef.current.offsetWidth : -1);
    } else {
      setWidth(-1);
    }
  }, [hoverRef, isHovered]);

  const style = width == -1 ? {} : { width };

  return (
    <div>
      <TitleSetting></TitleSetting>
      <div className={styles["play-panel"]} ref={hoverRef} style={style}>
        <PlayStopButton></PlayStopButton>
        {countingOff ? (
          <TimecodeCountoff></TimecodeCountoff>
        ) : (
          <Timecode></Timecode>
        )}
        <div className={styles["play-options"]}>
          <BPMSetting></BPMSetting>
          <BeatsPerBarSetting></BeatsPerBarSetting>
          <MetronomeSetting></MetronomeSetting>
        </div>
      </div>
    </div>
  );
};

export { PlayPanel };
