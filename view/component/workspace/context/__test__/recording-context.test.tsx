import { mount } from "enzyme";
import * as React from "react";
import {
  defaultPlaybackContext,
  PlaybackContext
} from "../recording/playback-context";
import {
  RecordingContext,
  RecordingContextData,
  RecordingProvider
} from "../recording/recording-context";
import { Scheduler } from "../../../../audio/scheduler";
import { AudioContext, registrar } from "standardized-audio-context-mock";
import Recorder from "../../../../audio/recorder";
import { useQuery } from "@apollo/client";
import { CabMode } from "../../../../state/apollotypes";

jest.mock("@apollo/client", () => ({
  ...(jest.requireActual("@apollo/client") as object),
  useQuery: jest.fn()
}));

jest.mock("../../../../audio/recorder");

const mockAudioContext: AudioContext = new AudioContext();
const mockPrime = jest.fn(() => "primed_recording_id");
const mockStopRecording = jest.fn();
const mockUnprime = jest.fn();

jest.mock("../../../../util/react-hooks");
jest.mock("../../../../audio/hooks/use-handle-new-audio-recording", () => ({
  useHandleNewAudioRecording: async (): Promise<void> => Promise.resolve()
}));
jest.mock("../../../../audio/hooks/use-vamp-audio-context", () => ({
  useVampAudioContext: (): AudioContext => mockAudioContext
}));
(Recorder as jest.Mock).mockImplementation(() => ({
  prime: mockPrime,
  unprime: mockUnprime,
  stopRecording: mockStopRecording
}));

describe("Recording Context", () => {
  let TestScheduler: Scheduler;

  beforeEach(() => {
    jest.clearAllMocks();
    TestScheduler = new Scheduler();
    jest.mock("../../../../audio/scheduler", () => ({
      ...(jest.requireActual("../../../../audio/scheduler") as object),
      SchedulerInstance: TestScheduler
    }));

    (useQuery as jest.Mock).mockClear();
    (useQuery as jest.Mock).mockImplementation(() => ({
      data: {
        vamp: {
          clips: [{ id: "clip_1_id", referenceId: "clip_1_reference_id" }]
        },
        userInVamp: {
          id: "user_in_vamp_id",
          cab: {
            mode: CabMode.INFINITE,
            start: 0,
            duration: 2
          },
          prefs: {
            latencyCompensation: 0.13
          }
        }
      }
    }));
  });

  afterEach(() => {
    registrar.reset(mockAudioContext);
  });

  it("primes recording process when PlaybackContext recording begins", () => {
    const playbackState1 = { ...defaultPlaybackContext };
    const playbackState2 = { ...defaultPlaybackContext, recording: true };

    const component = mount(
      <PlaybackContext.Provider value={playbackState1}>
        <RecordingProvider>
          <RecordingContext.Consumer>
            {(): React.ReactNode => {
              return null;
            }}
          </RecordingContext.Consumer>
        </RecordingProvider>
      </PlaybackContext.Provider>
    );

    component.setProps({ value: playbackState2 });

    expect(mockPrime).toHaveBeenCalledTimes(1);
  });

  it("calculates correct recordingProgram 1", () => {
    const loopingPlaybackContext = {
      ...defaultPlaybackContext,
      loop: true,
      loopPointA: -2,
      loopPointB: 4,
      cabMode: CabMode.STACK
    };

    const playbackState1 = loopingPlaybackContext;
    const playbackState2 = { ...loopingPlaybackContext, recording: true };

    const component = mount(
      <PlaybackContext.Provider value={playbackState1}>
        <RecordingProvider>
          <RecordingContext.Consumer>
            {(): React.ReactNode => {
              return null;
            }}
          </RecordingContext.Consumer>
        </RecordingProvider>
      </PlaybackContext.Provider>
    );

    component.setProps({ value: playbackState2 });

    expect(mockPrime).toHaveBeenCalledWith(
      undefined,
      {
        recordingStart: 0,
        cabStart: -2,
        cabDuration: 6,
        cabMode: CabMode.STACK,
        latencyCompensation: 0.13
      },
      false
    );
  });

  it("stops recorder when PlaybackContext recording becomes false", () => {
    const playbackState1 = { ...defaultPlaybackContext, recording: true };
    const playbackState2 = { ...defaultPlaybackContext, recording: false };

    const component = mount(
      <PlaybackContext.Provider value={playbackState1}>
        <RecordingProvider>
          <RecordingContext.Consumer>
            {(): React.ReactNode => {
              return null;
            }}
          </RecordingContext.Consumer>
        </RecordingProvider>
      </PlaybackContext.Provider>
    );

    component.setProps({ value: playbackState2 });

    expect(mockStopRecording).toHaveBeenCalledTimes(1);
  });

  it("sets ActiveRecording when recording begins", () => {
    (useQuery as jest.Mock).mockClear();
    (useQuery as jest.Mock).mockImplementation(() => ({
      data: {
        // @ts-ignore
        vamp: { clips: [] },
        userInVamp: {
          id: "user_in_vamp_id",
          cab: {
            mode: CabMode.INFINITE,
            start: 0,
            duration: 2
          },
          prefs: {
            latencyCompensation: 0.13
          }
        }
      }
    }));

    let data: RecordingContextData;

    const playbackState1 = { ...defaultPlaybackContext, recording: false };
    const playbackState2 = { ...defaultPlaybackContext, recording: true };

    const component = mount(
      <PlaybackContext.Provider value={playbackState1}>
        <RecordingProvider>
          <RecordingContext.Consumer>
            {(value): React.ReactNode => {
              data = value;
              return null;
            }}
          </RecordingContext.Consumer>
        </RecordingProvider>
      </PlaybackContext.Provider>
    );

    expect(data.activeRecording).toBeUndefined();

    component.setProps({ value: playbackState2 });
    expect(data.activeRecording.audioStoreKey).toEqual("primed_recording_id");
    expect(data.activeRecording.recordingStart).toEqual(0);
    expect(data.activeRecording.cabStart).toEqual(0);
    expect(data.activeRecording.cabDuration).toBeUndefined();
  });

  it("unsets ActiveRecording when a clip with it's referenceId is returned", () => {
    const mock = {
      data: {
        // @ts-ignore
        vamp: { clips: [] },
        userInVamp: {
          id: "user_in_vamp_id",
          cab: {
            mode: CabMode.INFINITE,
            start: 0,
            duration: 2
          },
          prefs: {
            latencyCompensation: 0.13
          }
        }
      }
    };
    (useQuery as jest.Mock).mockClear();
    (useQuery as jest.Mock).mockImplementationOnce(() => mock);
    (useQuery as jest.Mock).mockImplementationOnce(() => mock);
    (useQuery as jest.Mock).mockImplementationOnce(() => mock);
    (useQuery as jest.Mock).mockImplementationOnce(() => ({
      data: {
        ...mock.data,
        vamp: {
          clips: [{ id: "clip_1_id", recordingId: "primed_recording_id" }]
        }
      }
    }));

    let data: RecordingContextData;

    const playbackState1 = { ...defaultPlaybackContext, recording: false };
    const playbackState2 = { ...defaultPlaybackContext, recording: true };
    const playbackState3 = { ...defaultPlaybackContext, recording: false };

    const component = mount(
      <PlaybackContext.Provider value={playbackState1}>
        <RecordingProvider>
          <RecordingContext.Consumer>
            {(value): React.ReactNode => {
              data = value;
              return null;
            }}
          </RecordingContext.Consumer>
        </RecordingProvider>
      </PlaybackContext.Provider>
    );

    expect(data.activeRecording).toBeUndefined();

    component.setProps({ value: playbackState2 });

    expect(data.activeRecording).not.toBeUndefined();

    component.setProps({ value: playbackState3 });

    expect(data.activeRecording).toBeUndefined();
  });
});
