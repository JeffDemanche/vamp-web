import { mount } from "enzyme";
import * as React from "react";
import { RecordingContext } from "../../component/workspace/context/recording/recording-context";
import { ActiveRecordingScheduleAdapter } from "../adapter/active-recording-schedule-adapter";
import { Scheduler, SchedulerInstance } from "../scheduler";
import { advanceTimers } from "./scheduler-test-utils";
import {
  AudioContext,
  registrar,
  AudioBuffer
} from "standardized-audio-context-mock";
import { DeLorean } from "vehicles";
import { act } from "react-dom/test-utils";

jest.mock("../hooks/use-handle-new-audio-recording", () => ({
  useHandleNewAudioRecording: jest.fn()
}));
jest.mock("../audio-store", () => ({
  audioStore: {
    getStoredAudio: () => ({
      data: {
        arrayBuffer: () => new AudioBuffer({ sampleRate: 44100, length: 0 })
      }
    })
  }
}));

let mockAudioContext: AudioContext;
let mockAudioContextCurrentTime: DeLorean;

describe("ActiveRecordingScheduleAdapter", () => {
  let TestScheduler: typeof SchedulerInstance;

  beforeEach(() => {
    jest.resetAllMocks();
    jest.useFakeTimers();

    mockAudioContext = new AudioContext();
    mockAudioContextCurrentTime = registrar.getDeLorean(mockAudioContext);

    TestScheduler = new Scheduler();
    // @ts-ignore
    TestScheduler.giveContext(mockAudioContext);
  });

  afterEach(() => {
    registrar.reset(mockAudioContext);
  });

  it("removes an active event when the active recording becomes undefined", async () => {
    TestScheduler.seek(0, 1);
    await TestScheduler.play();

    const component = mount(
      <RecordingContext.Provider
        value={{
          activeRecording: {
            audioStoreKey: "audio_store_key",
            cabStart: 0,
            recordingStart: -2
          }
        }}
      >
        <ActiveRecordingScheduleAdapter
          scheduler={TestScheduler}
        ></ActiveRecordingScheduleAdapter>
      </RecordingContext.Provider>
    );

    await act(async () => {
      await advanceTimers(mockAudioContextCurrentTime, 1, 1);
    });

    expect(Object.keys(TestScheduler.events).length).toEqual(1);

    component.setProps({
      value: {}
    });

    expect(Object.keys(TestScheduler.events).length).toEqual(0);
  });

  it("schedules an active event when recording starts for infinite program", () => {
    const component = mount(
      <RecordingContext.Provider value={{}}>
        <ActiveRecordingScheduleAdapter
          scheduler={TestScheduler}
        ></ActiveRecordingScheduleAdapter>
      </RecordingContext.Provider>
    );

    expect(Object.keys(TestScheduler.events).length).toEqual(0);

    component.setProps({
      value: {
        activeRecording: {
          audioStoreKey: "audio_store_key",
          cabStart: 0,
          recordingStart: -2
        }
      }
    });

    expect(Object.keys(TestScheduler.events).length).toEqual(1);
    expect(TestScheduler.events["active_audio_store_key_0"].id).toEqual(
      "active_audio_store_key_0"
    );
    expect(TestScheduler.events["active_audio_store_key_0"].start).toEqual(0);
    expect(
      TestScheduler.events["active_audio_store_key_0"].duration
    ).toBeUndefined();
    expect(TestScheduler.events["active_audio_store_key_0"].offset).toEqual(2);
  });

  it("schedules active events after each loop for looping program", async () => {
    TestScheduler.seek(0, 4);
    await TestScheduler.play();

    mount(
      <RecordingContext.Provider
        value={{
          activeRecording: {
            audioStoreKey: "audio_store_key",
            cabStart: 2,
            cabDuration: 4,
            recordingStart: 0
          }
        }}
      >
        <ActiveRecordingScheduleAdapter
          scheduler={TestScheduler}
        ></ActiveRecordingScheduleAdapter>
      </RecordingContext.Provider>
    );

    expect(Object.keys(TestScheduler.events).length).toEqual(0);

    await advanceTimers(mockAudioContextCurrentTime, 0.2, 19);

    expect(Object.keys(TestScheduler.events).length).toEqual(0);

    await act(async () => {
      await advanceTimers(mockAudioContextCurrentTime, 0.2, 1);
    });

    expect(Object.keys(TestScheduler.events).length).toEqual(1);
    expect(TestScheduler.events["active_audio_store_key_0"].start).toEqual(2);
    expect(TestScheduler.events["active_audio_store_key_0"].duration).toEqual(
      4
    );
    expect(TestScheduler.events["active_audio_store_key_0"].offset).toEqual(2);

    await act(async () => {
      await advanceTimers(mockAudioContextCurrentTime, 0.2, 20);
    });

    expect(Object.keys(TestScheduler.events).length).toEqual(2);
    expect(TestScheduler.events["active_audio_store_key_1"].start).toEqual(2);
    expect(TestScheduler.events["active_audio_store_key_1"].duration).toEqual(
      4
    );
    expect(TestScheduler.events["active_audio_store_key_1"].offset).toEqual(6);
  });
});
