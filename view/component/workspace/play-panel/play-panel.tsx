import * as React from "react";

import { PlayStopButton } from "./play-stop-button";

import { BPMSetting } from "./bpm-setting";
import { BeatsPerBarSetting } from "./beats-per-bar-setting";
import { MetronomeSetting } from "./metronome-setting";

import * as styles from "./play-panel.less";
import Timecode from "./timecode";
import { useHover } from "../../../util/react-hooks";
import { useEffect, useState } from "react";
import { TitleSetting } from "./title-setting";

const PlayPanel: React.FunctionComponent = () => {
  const metronomeOptions = [
    {
      index: 1,
      value: "Hi-Hat"
    },
    {
      index: 2,
      value: "Beep"
    }
  ];

  const [width, setWidth] = useState(-1);

  const [hoverRef, isHovered] = useHover();

  useEffect(() => {
    if (isHovered) {
      setWidth(hoverRef.current ? hoverRef.current.offsetWidth : -1);
    } else {
      setWidth(-1);
    }
  }, [isHovered]);

  const style = width == -1 ? {} : { width };

  return (
    <div>
      <TitleSetting></TitleSetting>
      <div className={styles["play-panel"]} ref={hoverRef} style={style}>
        <PlayStopButton></PlayStopButton>
        <Timecode></Timecode>
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
