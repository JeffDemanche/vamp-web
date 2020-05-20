import * as React from "react";

import { PlayStopButton } from "./play-stop-button";

import { BPMSetting } from "./bpm-setting";
import { BeatsPerBarSetting } from "./beats-per-bar-setting";
import { MetronomeSetting } from "./metronome-setting";

import styles = require("./play-panel.less");
import { Timecode } from "./timecode";

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

  return (
    <div className={styles["play-panel"]}>
      <PlayStopButton></PlayStopButton>
      <Timecode></Timecode>
      <div className={styles["play-options"]}>
        <BPMSetting></BPMSetting>
        <BeatsPerBarSetting></BeatsPerBarSetting>
        <MetronomeSetting></MetronomeSetting>
      </div>
    </div>
  );
};

export { PlayPanel };
