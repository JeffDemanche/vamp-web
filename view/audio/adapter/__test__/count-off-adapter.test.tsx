import * as React from "react";
import { CountOffAdapter } from "../count-off-adapter";
import { mount } from "enzyme";
import { SchedulerInstance } from "../../scheduler";
import { MetronomeContext } from "../../../component/workspace/context/metronome-context";
import {
  defaultPlaybackContext,
  PlaybackContext
} from "../../../component/workspace/context/recording/playback-context";

jest.mock("../../../util/react-hooks");
jest.mock("../../scheduler");

const useMeasuresReturnFour = {
  measureMap: {
    "-1": {
      num: -1,
      timeStart: -2,
      section: { bpm: 120, beatsPerBar: 4, metronomeSound: "Beep" }
    },
    "0": {
      num: 0,
      timeStart: 0,
      section: { bpm: 120, beatsPerBar: 4, metronomeSound: "Beep" }
    }
  }
};

const useMeasuresReturnThree = {
  measureMap: {
    "2": {
      num: 2,
      timeStart: 1.5,
      section: { bpm: 120, beatsPerBar: 3, metronomeSound: "Beep" }
    }
  }
};

describe("Count Off Adapter", () => {
  beforeEach(() => {
    SchedulerInstance.clearEvents();
    SchedulerInstance.giveContext(null);
  });

  it("calls scheduler countOff method when countOff becomes true in state", () => {
    const countOffSpy = jest.spyOn(SchedulerInstance, "countOff");

    const playbackVal = {
      ...defaultPlaybackContext,
      playPosition: 0,
      updateCountOff: () => {},
      countingOff: true,
      countingOffStartTime: 0
    };

    const component = mount(
      <PlaybackContext.Provider
        value={{
          ...playbackVal,
          countingOff: false,
          countingOffStartTime: -1
        }}
      >
        <MetronomeContext.Provider
          // @ts-ignore
          value={{
            getMeasureMap: (): any => useMeasuresReturnFour.measureMap
          }}
        >
          <CountOffAdapter scheduler={SchedulerInstance}></CountOffAdapter>
        </MetronomeContext.Provider>
      </PlaybackContext.Provider>
    );

    // Hacky way to make sure the second useQuery mock is used.
    component.setProps({
      value: {
        ...playbackVal,
        countingOff: true,
        countingOffStartTime: 1234
      }
    });

    expect(countOffSpy).toBeCalled();
  });

  describe("CountOff Generation", () => {
    it("generates correct countOff on first render", () => {
      const updateCountOffFn = jest.fn();

      mount(
        <PlaybackContext.Provider
          // @ts-ignore
          value={{
            playPosition: 0,
            updateCountOff: updateCountOffFn,
            countingOff: false,
            countingOffStartTime: -1
          }}
        >
          <MetronomeContext.Provider
            // @ts-ignore
            value={{
              getMeasureMap: (): any => useMeasuresReturnFour.measureMap
            }}
          >
            <CountOffAdapter scheduler={SchedulerInstance}></CountOffAdapter>
          </MetronomeContext.Provider>
        </PlaybackContext.Provider>
      );

      expect(updateCountOffFn).toHaveBeenCalledWith({
        duration: 2,
        measures: [
          { repetitions: 1, bpm: 120, beats: 4, metronomeSound: "Beep" }
        ]
      });
    });

    it("generates correct countOff when playPosition is into measure", () => {
      const updateCountOffFn = jest.fn();

      mount(
        <PlaybackContext.Provider
          // @ts-ignore
          value={{
            playPosition: 0.73,
            updateCountOff: updateCountOffFn,
            countingOff: false,
            countingOffStartTime: -1
          }}
        >
          <MetronomeContext.Provider
            // @ts-ignore
            value={{
              getMeasureMap: (): any => useMeasuresReturnFour.measureMap
            }}
          >
            <CountOffAdapter scheduler={SchedulerInstance}></CountOffAdapter>
          </MetronomeContext.Provider>
        </PlaybackContext.Provider>
      );

      expect(updateCountOffFn).toHaveBeenCalledWith({
        duration: 2.73,
        measures: [
          { repetitions: 1, bpm: 120, beats: 4, metronomeSound: "Beep" },
          { repetitions: 1, bpm: 120, beats: 2, metronomeSound: "Beep" }
        ]
      });
    });

    it("generates correct countOff when playPosition is negative", () => {
      const updateCountOffFn = jest.fn();

      mount(
        <PlaybackContext.Provider
          // @ts-ignore
          value={{
            playPosition: -0.5,
            updateCountOff: updateCountOffFn,
            countingOff: false,
            countingOffStartTime: -1
          }}
        >
          <MetronomeContext.Provider
            // @ts-ignore
            value={{
              getMeasureMap: (): any => useMeasuresReturnFour.measureMap
            }}
          >
            <CountOffAdapter scheduler={SchedulerInstance}></CountOffAdapter>
          </MetronomeContext.Provider>
        </PlaybackContext.Provider>
      );

      expect(updateCountOffFn).toHaveBeenCalledWith({
        duration: 3.5,
        measures: [
          { repetitions: 1, bpm: 120, beats: 4, metronomeSound: "Beep" },
          { repetitions: 1, bpm: 120, beats: 3, metronomeSound: "Beep" }
        ]
      });
    });

    it("generates correct countOff in three", () => {
      const updateCountOffFn = jest.fn();

      mount(
        <PlaybackContext.Provider
          // @ts-ignore
          value={{
            playPosition: 2,
            updateCountOff: updateCountOffFn,
            countingOff: false,
            countingOffStartTime: -1
          }}
        >
          <MetronomeContext.Provider
            // @ts-ignore
            value={{
              getMeasureMap: (): any => useMeasuresReturnThree.measureMap
            }}
          >
            <CountOffAdapter scheduler={SchedulerInstance}></CountOffAdapter>
          </MetronomeContext.Provider>
        </PlaybackContext.Provider>
      );

      expect(updateCountOffFn).toHaveBeenCalledWith({
        duration: 2,
        measures: [
          { repetitions: 1, bpm: 120, beats: 3, metronomeSound: "Beep" },
          { repetitions: 1, bpm: 120, beats: 1, metronomeSound: "Beep" }
        ]
      });
    });
  });
});
