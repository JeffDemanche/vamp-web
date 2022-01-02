import { AudioContext, registrar } from "standardized-audio-context-mock";
import Recorder from "../recorder";
import { Scheduler, SchedulerInstance } from "../scheduler";
import { DeLorean } from "vehicles";
import { advanceTimers } from "./scheduler-test-utils";
import { RecorderProgram } from "../hooks/use-handle-new-audio-recording";
import { CabMode } from "../../state/apollotypes";

jest.mock("../vamp-audio-stream", () => ({
  vampAudioStream: {
    getAudioStream: (): Promise<MediaStream> => Promise.resolve(null)
  }
}));

let mockAudioContext: AudioContext;
let mockAudioContextCurrentTime: DeLorean;

const mockMediaRecorder = {
  start: jest.fn(),
  ondataavailable: jest.fn(),
  onerror: jest.fn(),
  state: "",
  stop: jest.fn()
};

describe("Recorder", () => {
  let TestRecorder: Recorder;
  let TestScheduler: typeof SchedulerInstance;

  const mockRecordingProgramInfinite: RecorderProgram = {
    recordingId: "61ccdac6f37993dfacc6d6c8",
    recordingStart: -0.5,
    latencyCompensation: 0.13,
    cabMode: CabMode.INFINITE,
    cabStart: 0
  };

  beforeEach(() => {
    jest.resetAllMocks();
    jest.useFakeTimers();

    mockAudioContext = new AudioContext();
    mockAudioContextCurrentTime = registrar.getDeLorean(mockAudioContext);

    Object.defineProperty(window, "MediaRecorder", {
      writable: true,
      value: jest.fn().mockImplementation(() => mockMediaRecorder)
    });
    Object.defineProperty(MediaRecorder, "isTypeSupported", {
      writable: true,
      value: () => true
    });

    TestScheduler = new Scheduler();
    // @ts-ignore
    TestScheduler.giveContext(mockAudioContext);
    // @ts-ignore
    TestRecorder = new Recorder(mockAudioContext, TestScheduler);
  });

  afterEach(() => {
    registrar.reset(mockAudioContext);
  });

  it("starts and stops recording, and returns data when primed and scheduler plays and stops", async () => {
    expect(TestRecorder.isRecording()).toEqual(false);

    TestRecorder.prime(async () => {}, mockRecordingProgramInfinite);
    await TestScheduler.play();

    expect(TestRecorder.isRecording()).toEqual(true);
    expect(mockMediaRecorder.start).toHaveBeenCalledWith(500);

    await advanceTimers(mockAudioContextCurrentTime, 1, 1);
    TestScheduler.stop();

    // We do a short timeout after stopping before the recording actually ends.
    await advanceTimers(mockAudioContextCurrentTime, 1, 0.5);

    expect(TestRecorder.isRecording()).toEqual(false);
    expect(mockMediaRecorder.stop).toHaveBeenCalledTimes(1);
  });
});
