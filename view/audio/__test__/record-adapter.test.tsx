import * as React from "react";
import { SchedulerInstance } from "../scheduler";
import { useMutation, useQuery } from "@apollo/client";
import { RecordAdapter } from "../adapter/record-adapter";
import {
  useBeginClientClip,
  useEndClientClip
} from "../../util/client-clip-state-hooks";
import { useIsEmpty } from "../../component/workspace/hooks/use-is-empty";
import { mount } from "enzyme";
import {
  defaultPlaybackContext,
  PlaybackContext,
  PlaybackContextData
} from "../../component/workspace/context/recording/playback-context";
import { MetronomeContext } from "../../component/workspace/context/metronome-context";

jest.mock("../../util/react-hooks");
jest.mock("../../util/vamp-state-hooks");
jest.mock("../recorder");
jest.mock("../../util/client-clip-state-hooks");
jest.mock("../../component/workspace/hooks/use-is-empty", () => ({
  useIsEmpty: jest.fn()
}));
jest.mock("../../component/workspace/hooks/use-cab-loops");
jest.mock("@apollo/client", () => ({
  ...jest.requireActual("@apollo/client"),
  useQuery: jest.fn(),
  useMutation: jest.fn(() => [(): void => {}])
}));

describe("Record Adapter", () => {
  beforeEach(() => {
    SchedulerInstance.clearEvents();
    SchedulerInstance.giveContext(null);
    (useMutation as jest.Mock).mockClear();
    (useQuery as jest.Mock).mockClear();
  });

  it("primes scheduler recorder when recording begins", () => {
    (useIsEmpty as jest.Mock).mockImplementation(() => true);

    const primeRecorderSpy = jest.spyOn(SchedulerInstance, "primeRecorder");
    (useQuery as jest.Mock).mockImplementation(() => ({
      data: {
        userInVamp: {
          cab: { start: 0, duration: 4 },
          prefs: { latencyCompensation: 0 }
        }
      }
    }));

    const playbackVal: PlaybackContextData = {
      ...defaultPlaybackContext,
      recording: false,
      playPosition: 0,
      updateCountOff: () => {},
      countOffData: {
        measures: [],
        duration: 2
      },
      countingOff: true,
      countingOffStartTime: 0
    };

    const component = mount(
      <PlaybackContext.Provider value={playbackVal}>
        <MetronomeContext.Provider
          // @ts-ignore
          value={{
            truncateEndOfRecording: () => 0
          }}
        >
          <RecordAdapter
            scheduler={SchedulerInstance}
            context={null}
          ></RecordAdapter>
        </MetronomeContext.Provider>
      </PlaybackContext.Provider>
    );

    component.setProps({ value: { ...playbackVal, recording: true } });

    expect(primeRecorderSpy).toHaveBeenCalled();
  });

  it("begins client clip when recording begins", () => {
    (useIsEmpty as jest.Mock).mockImplementation(() => true);

    const useBeginClientClipFn = jest.fn();
    (useBeginClientClip as jest.Mock).mockImplementation(
      () => useBeginClientClipFn
    );

    const playbackVal: PlaybackContextData = {
      ...defaultPlaybackContext,
      recording: false,
      playPosition: 0,
      updateCountOff: () => {},
      countOffData: {
        measures: [],
        duration: 2
      },
      countingOff: true,
      countingOffStartTime: 0
    };

    (useQuery as jest.Mock).mockImplementation(() => ({
      data: {
        userInVamp: {
          cab: { start: 0, duration: 4 },
          prefs: { latencyCompensation: 0 }
        }
      }
    }));

    const component = mount(
      <PlaybackContext.Provider value={playbackVal}>
        <MetronomeContext.Provider
          // @ts-ignore
          value={{
            truncateEndOfRecording: () => 0
          }}
        >
          <RecordAdapter
            scheduler={SchedulerInstance}
            context={null}
          ></RecordAdapter>
        </MetronomeContext.Provider>
      </PlaybackContext.Provider>
    );

    component.setProps({ value: { ...playbackVal, recording: true } });

    expect(useBeginClientClipFn).toBeCalledWith(0, expect.anything(), 0);
  });

  it("ends client clip when recording ends", () => {
    (useIsEmpty as jest.Mock).mockImplementation(() => true);

    const useEndClientClipFn = jest.fn();
    (useEndClientClip as jest.Mock).mockImplementation(
      () => useEndClientClipFn
    );

    const playbackVal: PlaybackContextData = {
      ...defaultPlaybackContext,
      recording: false,
      playPosition: 0,
      updateCountOff: () => {},
      countOffData: {
        measures: [],
        duration: 2
      },
      countingOff: true,
      countingOffStartTime: 0
    };

    (useQuery as jest.Mock).mockImplementation(() => ({
      data: {
        userInVamp: {
          cab: { start: 0, duration: 4 },
          prefs: { latencyCompensation: 0 }
        }
      }
    }));

    const component = mount(
      <PlaybackContext.Provider value={playbackVal}>
        <MetronomeContext.Provider
          // @ts-ignore
          value={{
            truncateEndOfRecording: () => 0
          }}
        >
          <RecordAdapter
            scheduler={SchedulerInstance}
            context={null}
          ></RecordAdapter>
        </MetronomeContext.Provider>
      </PlaybackContext.Provider>
    );

    component.setProps({ value: { ...playbackVal, recording: true } });
    component.setProps({ value: { ...playbackVal, recording: false } });

    expect(useEndClientClipFn).toBeCalledWith(expect.anything());
  });
});
