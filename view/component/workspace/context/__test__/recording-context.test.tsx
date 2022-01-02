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
const mockPrime = jest.fn();
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

    (useQuery as jest.Mock).mockImplementation(() => ({
      data: {
        userInVamp: {
          id: "61ccdddbfe806e4693315dee",
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
    let data: RecordingContextData;

    const playbackState1 = { ...defaultPlaybackContext };
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

    component.setProps({ value: playbackState2 });

    expect(mockPrime).toHaveBeenCalledTimes(1);
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
});
