import React from "react";

import { PlayStopButton } from "./play-controls/play-stop-button";
import { SettingSelect } from "../input/setting-select";
import { SettingNumeric } from "../input/setting-numeric";

import styles from "./play-panel.less";

const PlayPanel = () => {
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
      <div className={styles["play-options"]}>
        <SettingNumeric
          initValue={120}
          minValue={1}
          maxValue={499}
          text="BPM"
        ></SettingNumeric>
        <SettingNumeric
          initValue={4}
          minValue={1}
          maxValue={16}
          text="/ Bar"
        ></SettingNumeric>
        <SettingSelect
          initValue="Hi-Hat"
          options={metronomeOptions}
        ></SettingSelect>
      </div>
    </div>
  );
};

export { PlayPanel };
