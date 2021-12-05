import { Scheduler, SchedulerEvent, SchedulerInstance } from "../scheduler";
import { AudioContext, registrar } from "standardized-audio-context-mock";
import { DeLorean } from "vehicles";
import { advanceTimers } from "./scheduler-test-utils";

let mockAudioContext: AudioContext;
let mockAudioContextCurrentTime: DeLorean;
let mockClipEvent1Dispatch: SchedulerEvent["dispatch"];
let mockClipEvent1: SchedulerEvent;

describe("Scheduler", () => {
  let TestScheduler: typeof SchedulerInstance;

  beforeEach(() => {
    jest.resetAllMocks();
    jest.useFakeTimers();

    mockAudioContext = new AudioContext();
    mockAudioContextCurrentTime = registrar.getDeLorean(mockAudioContext);

    mockClipEvent1Dispatch = jest.fn().mockImplementation(
      (): Promise<void | AudioScheduledSourceNode> => {
        // @ts-ignore
        return mockAudioContext.createBufferSource();
      }
    );
    mockClipEvent1 = {
      id: "616c81b325c10971914655a0",
      start: 2,
      duration: 3,
      type: "Audio",
      dispatch: mockClipEvent1Dispatch
    };

    TestScheduler = new Scheduler();
    // @ts-ignore
    TestScheduler.giveContext(mockAudioContext);
  });

  afterEach(() => {
    registrar.reset(mockAudioContext);
  });

  describe("playback", () => {
    it("seeking when not playing sets idleTime", () => {
      TestScheduler.seek(13.2, undefined);

      expect(TestScheduler.accessPrivateFields()._isPlaying).toEqual(false);
      expect(TestScheduler.accessPrivateFields()._idleTime).toEqual(13.2);
    });

    it("resets idleTime and audio context-based timers after stopping", async () => {
      TestScheduler.seek(0, 2);

      await TestScheduler.play();
      // Play for three seconds
      await advanceTimers(mockAudioContextCurrentTime, 0.5, 6);
      TestScheduler.stop();

      expect(TestScheduler.accessPrivateFields()._idleTime).toEqual(0);
      expect(
        TestScheduler.accessPrivateFields()._audioContextPlayStart
      ).toEqual(0);
      expect(
        TestScheduler.accessPrivateFields()._audioContextLoopStart
      ).toEqual(0);
    });

    it("returns to idleTime while looping after pausing, waiting, and playing", async () => {
      TestScheduler.addEvent(mockClipEvent1);
      TestScheduler.seek(0, 3);

      await TestScheduler.play();

      // Play for two seconds
      await advanceTimers(mockAudioContextCurrentTime, 1, 2);

      expect(TestScheduler.paused).toEqual(false);
      expect(TestScheduler.accessPrivateFields()._loopDispatchOffset).toEqual(
        3
      );

      TestScheduler.pause();

      expect(TestScheduler.paused).toEqual(true);
      expect(TestScheduler.accessPrivateFields()._idleTime).toEqual(0);
      expect(TestScheduler.accessPrivateFields()._pausedTime).toEqual(2);

      // Wait an arbitrary amount of time while paused.
      await advanceTimers(mockAudioContextCurrentTime, 0.2, 2);

      await TestScheduler.play();

      // We should loop after 1 second due to pause position.
      expect(TestScheduler.accessPrivateFields()._loopDispatchOffset).toEqual(
        1
      );
      expect(
        TestScheduler.accessPrivateFields()._firstLoopDispatchOffset
      ).toEqual(1);

      await advanceTimers(mockAudioContextCurrentTime, 0.5, 2);

      expect(TestScheduler.accessPrivateFields()._loopDispatchOffset).toEqual(
        3
      );
      expect(
        TestScheduler.accessPrivateFields()._firstLoopDispatchOffset
      ).toEqual(1);

      expect(mockClipEvent1Dispatch).toHaveBeenNthCalledWith(3, {
        context: mockAudioContext,
        startTime: 2.4,
        offset: 0,
        duration: 1,
        when: 0
      });
      expect(mockClipEvent1Dispatch).toHaveBeenNthCalledWith(4, {
        context: mockAudioContext,
        startTime: 3.4,
        offset: 0,
        duration: 1,
        when: 2
      });
    });

    it("calling seek with loopPoint while not playing properly sets loopPoint and loopDispatchOffset", () => {
      TestScheduler.seek(-3.5, 2);

      expect(TestScheduler.accessPrivateFields()._loopPoint).toEqual(2);
      expect(TestScheduler.accessPrivateFields()._loopDispatchOffset).toEqual(
        5.5
      );
    });

    it("calling seek with loopPoint while playing to point after timecode seeks to timecode", async () => {
      TestScheduler.seek(0, undefined);

      await TestScheduler.play();
      await advanceTimers(mockAudioContextCurrentTime, 1, 4);

      TestScheduler.seek(5, 8);

      expect(TestScheduler.accessPrivateFields()._idleTime).toEqual(5);
    });

    it("seeking pauses (doesn't reset to idle time) when the current time after seek is between loop points", async () => {
      TestScheduler.seek(0, 4);
      await TestScheduler.play();
      await advanceTimers(mockAudioContextCurrentTime, 1, 3);

      expect(TestScheduler.timecode).toEqual(3);

      await TestScheduler.seek(2, 6);
      await advanceTimers(mockAudioContextCurrentTime, 0.1, 1);

      expect(
        TestScheduler.accessPrivateFields()._firstLoopDispatchOffset
      ).toEqual(3);
      expect(TestScheduler.timecode).toBeCloseTo(3.1);

      await advanceTimers(mockAudioContextCurrentTime, 0.2, 1);
      expect(TestScheduler.timecode).toBeCloseTo(3.3);
    });

    it("can pause multiple times when not looping", async () => {
      TestScheduler.seek(-2, undefined);
      await TestScheduler.play();
      // Play for 1 second and then pause.
      await advanceTimers(mockAudioContextCurrentTime, 0.5, 2);
      TestScheduler.pause();

      expect(TestScheduler.paused).toEqual(true);
      expect(TestScheduler.timecode).toEqual(-1);

      // Play for 2 more seconds and then pause.
      await TestScheduler.play();
      await advanceTimers(mockAudioContextCurrentTime, 0.5, 4);

      expect(TestScheduler.paused).toEqual(false);
      expect(TestScheduler.timecode).toEqual(1);

      TestScheduler.pause();

      expect(TestScheduler.paused).toEqual(true);
      expect(TestScheduler.timecode).toEqual(1);
    });

    it("can pause multiple times when looping", async () => {
      TestScheduler.seek(0, 4);
      await TestScheduler.play();
      await advanceTimers(mockAudioContextCurrentTime, 1, 3);

      TestScheduler.pause();

      expect(TestScheduler.paused).toEqual(true);
      expect(TestScheduler.accessPrivateFields()._pausedTime).toEqual(3);
      expect(TestScheduler.timecode).toEqual(3);

      await TestScheduler.play();
      await advanceTimers(mockAudioContextCurrentTime, 1, 3);

      expect(TestScheduler.timecode).toEqual(2);

      TestScheduler.pause();

      expect(TestScheduler.accessPrivateFields()._pausedTime).toEqual(2);
      expect(TestScheduler.timecode).toEqual(2);

      await TestScheduler.play();
      await advanceTimers(mockAudioContextCurrentTime, 1, 3);

      TestScheduler.pause();

      expect(TestScheduler.timecode).toEqual(1);

      await TestScheduler.play();
      await advanceTimers(mockAudioContextCurrentTime, 1, 3);

      TestScheduler.pause();

      // Bit of an edge case to land on the loop point exactly.
      expect(TestScheduler.timecode).toEqual(0);

      await TestScheduler.play();
      await advanceTimers(mockAudioContextCurrentTime, 1, 2);
      TestScheduler.stop();

      expect(TestScheduler.timecode).toEqual(0);
      expect(TestScheduler.paused).toEqual(false);
      expect(TestScheduler.accessPrivateFields()._pausedTime).toBeUndefined();
      expect(
        TestScheduler.accessPrivateFields()._firstLoopDispatchOffset
      ).toEqual(0);
    });

    it("continues to dispatch events on loop correctly after pausing and playing", async () => {
      TestScheduler.seek(2, 4);
      TestScheduler.addEvent(mockClipEvent1);

      await TestScheduler.play();
      await advanceTimers(mockAudioContextCurrentTime, 0.2, 5);
      TestScheduler.pause();

      expect(
        TestScheduler.accessPrivateFields()._audioContextPlayStart
      ).toEqual(0);
      expect(
        TestScheduler.accessPrivateFields()._audioContextLoopStart
      ).toEqual(0);
      expect(TestScheduler.timecode).toEqual(3);
      // First dispatch on play. There's a second dispatch from the clock tick.
      expect(mockClipEvent1Dispatch).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({
          startTime: 0,
          when: 0,
          offset: 0,
          duration: 2
        })
      );

      // Play after being paused. Reset the mock for clarity.
      (mockClipEvent1Dispatch as jest.Mock).mockClear();
      await TestScheduler.play();
      expect(mockClipEvent1Dispatch).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({
          startTime: 1,
          when: 0,
          offset: 1,
          duration: 1
        })
      );

      await advanceTimers(mockAudioContextCurrentTime, 0.2, 1);
      expect(TestScheduler.timecode).toEqual(3.2);
      expect(mockClipEvent1Dispatch).toHaveBeenNthCalledWith(
        2,
        expect.objectContaining({
          startTime: 2,
          when: 0,
          offset: 0,
          duration: 2
        })
      );

      await advanceTimers(mockAudioContextCurrentTime, 0.2, 4);
      expect(mockClipEvent1Dispatch).toHaveBeenCalledTimes(2);
      expect(TestScheduler.timecode).toEqual(2);

      await advanceTimers(mockAudioContextCurrentTime, 0.2, 1);
      expect(TestScheduler.timecode).toEqual(2.2);
      expect(mockClipEvent1Dispatch).toHaveBeenNthCalledWith(
        3,
        expect.objectContaining({
          startTime: 4,
          when: 0,
          offset: 0,
          duration: 2
        })
      );

      // await advanceTimers(mockAudioContextCurrentTime, 0.2, 5);
      // expect(TestScheduler.timecode).toEqual(2);
      // await advanceTimers(mockAudioContextCurrentTime, 0.2, 1);
      // expect(TestScheduler.timecode).toEqual(2.2);
      // expect(mockClipEvent1Dispatch).toHaveBeenNthCalledWith(
      //   3,
      //   expect.objectContaining({
      //     startTime: 4,
      //     when: 0,
      //     offset: 0,
      //     duration: 2
      //   })
      // );
    });
  });

  describe("pre-looping system", () => {
    it("after play but before first loop, events are dispatched for two full loops", async () => {
      TestScheduler.seek(0, 8);
      TestScheduler.addEvent(mockClipEvent1);

      await TestScheduler.play();

      await advanceTimers(mockAudioContextCurrentTime, 0.2, 1);

      expect(mockClipEvent1Dispatch).toHaveBeenCalledTimes(2);
      expect(mockClipEvent1Dispatch).toHaveBeenNthCalledWith(1, {
        context: expect.any(AudioContext),
        startTime: 0,
        when: 2,
        offset: 0,
        duration: 3
      });
      expect(mockClipEvent1Dispatch).toHaveBeenNthCalledWith(2, {
        context: expect.any(AudioContext),
        startTime: 8,
        when: 2,
        offset: 0,
        duration: 3
      });
    });

    it("given enough time to loop once, events are dispatched for a third loop", async () => {
      TestScheduler.seek(2, 4);
      TestScheduler.addEvent(mockClipEvent1);

      await TestScheduler.play();

      await advanceTimers(mockAudioContextCurrentTime, 0.2, 11);

      expect(mockClipEvent1Dispatch).toHaveBeenCalledTimes(3);
      expect(mockClipEvent1Dispatch).toHaveBeenNthCalledWith(1, {
        context: expect.any(AudioContext),
        startTime: 0,
        when: 0,
        offset: 0,
        duration: 2
      });
      expect(mockClipEvent1Dispatch).toHaveBeenNthCalledWith(2, {
        context: expect.any(AudioContext),
        startTime: 2,
        when: 0,
        offset: 0,
        duration: 2
      });
      expect(mockClipEvent1Dispatch).toHaveBeenNthCalledWith(3, {
        context: expect.any(AudioContext),
        startTime: 4,
        when: 0,
        offset: 0,
        duration: 2
      });
    });

    it("timecode doesn't repeat when looping is disabled", async () => {
      TestScheduler.seek(0, undefined);
      TestScheduler.addEvent(mockClipEvent1);

      await TestScheduler.play();

      await advanceTimers(mockAudioContextCurrentTime, 0.5, 16);

      expect(TestScheduler.timecode).toEqual(8);
    });
  });

  describe("events system", () => {
    it("adding event when not playing apends to events list", () => {
      TestScheduler.addEvent(mockClipEvent1);

      expect(
        TestScheduler.accessPrivateFields()._events[mockClipEvent1.id]
      ).toEqual(mockClipEvent1);
    });

    it("adding event while playing begins playing it at correct time", async () => {
      TestScheduler.seek(-1, undefined);
      await TestScheduler.play();
      TestScheduler.addEvent(mockClipEvent1);

      expect(mockClipEvent1Dispatch).toHaveBeenCalledWith({
        context: mockAudioContext,
        startTime: 0,
        offset: 0,
        duration: 3,
        when: 3
      });
    });

    it("playing after adding event dispatches it and adds to nodes list", async () => {
      TestScheduler.addEvent(mockClipEvent1);
      TestScheduler.seek(0, undefined);
      await TestScheduler.play();

      expect(mockClipEvent1Dispatch).toHaveBeenCalledWith({
        context: mockAudioContext,
        startTime: 0,
        duration: 3,
        offset: 0,
        when: 2
      });
      expect(
        TestScheduler.accessPrivateFields()._dispatchedAudioNodes[
          mockClipEvent1.id
        ]
      ).not.toBeUndefined();
    });

    it("stopping after playing removes dispatched nodes", async () => {
      TestScheduler.addEvent(mockClipEvent1);
      await TestScheduler.play();
      TestScheduler.stop();

      expect(
        TestScheduler.accessPrivateFields()._dispatchedAudioNodes[
          mockClipEvent1.id
        ]
      ).toBeUndefined();
    });

    it("dispatched event duration and offset respect starting play during event", async () => {
      // Starts at 2 with duration 3
      TestScheduler.addEvent(mockClipEvent1);
      TestScheduler.seek(3, undefined);

      await TestScheduler.play();

      expect(mockClipEvent1Dispatch).toHaveBeenCalledWith({
        context: mockAudioContext,
        startTime: 0,
        duration: 2,
        offset: 1,
        when: 0
      });
    });

    it("dispatched event duration is shortened by looping before event ends", async () => {
      TestScheduler.addEvent(mockClipEvent1);
      TestScheduler.seek(-1, 4);
      await TestScheduler.play();

      await advanceTimers(mockAudioContextCurrentTime, 0.2, 1);

      expect(mockClipEvent1Dispatch).toHaveBeenNthCalledWith(1, {
        context: mockAudioContext,
        startTime: 0,
        duration: 2,
        offset: 0,
        when: 3
      });
      expect(mockClipEvent1Dispatch).toHaveBeenNthCalledWith(2, {
        context: mockAudioContext,
        startTime: 5,
        duration: 2,
        offset: 0,
        when: 3
      });
    });

    it("dispatched event duration is shortened by starting playback after event start", async () => {
      TestScheduler.addEvent(mockClipEvent1);
      TestScheduler.seek(4, 6);
      await TestScheduler.play();

      await advanceTimers(mockAudioContextCurrentTime, 0.2, 1);

      expect(mockClipEvent1Dispatch).toHaveBeenNthCalledWith(1, {
        context: mockAudioContext,
        startTime: 0,
        duration: 1,
        offset: 2,
        when: 0
      });
      expect(mockClipEvent1Dispatch).toHaveBeenNthCalledWith(2, {
        context: mockAudioContext,
        startTime: 2,
        duration: 1,
        offset: 2,
        when: 0
      });
    });

    it("dispatched event duration is shortened by both starting playback during event and looping during event", async () => {
      // Starts at 2 with duration 3
      TestScheduler.addEvent(mockClipEvent1);
      TestScheduler.seek(3, 4);
      await TestScheduler.play();

      await advanceTimers(mockAudioContextCurrentTime, 0.2, 1);

      expect(mockClipEvent1Dispatch).toHaveBeenNthCalledWith(1, {
        context: mockAudioContext,
        startTime: 0,
        duration: 1,
        offset: 1,
        when: 0
      });
      expect(mockClipEvent1Dispatch).toHaveBeenNthCalledWith(2, {
        context: mockAudioContext,
        startTime: 1,
        duration: 1,
        offset: 1,
        when: 0
      });
    });
  });

  describe("listeners", () => {
    it("fires seek and possibly pause/stop/play listeners on seek", async () => {
      const seekListener = jest.fn(() => {});
      const playListener = jest.fn(() => {});
      const pauseListener = jest.fn(() => {});
      const stopListener = jest.fn(() => {});

      TestScheduler.listeners.addListener("seek", seekListener);
      TestScheduler.listeners.addListener("play", playListener);
      TestScheduler.listeners.addListener("pause", pauseListener);
      TestScheduler.listeners.addListener("stop", stopListener);

      // Seek while not playing
      await TestScheduler.seek(-0.5, undefined);

      expect(seekListener).toHaveBeenNthCalledWith(1, -0.5);

      await TestScheduler.play();
      await advanceTimers(mockAudioContextCurrentTime, 0.1, 6);

      // Seek while playing, seek function calls pause.
      await TestScheduler.seek(0, undefined);

      expect(TestScheduler.playing).toEqual(true);
      expect(seekListener).toHaveBeenNthCalledWith(2, 0);
      // @ts-ignore
      expect(pauseListener.mock.calls[0][0]).toBeCloseTo(0.1);
      // @ts-ignore
      expect(playListener.mock.calls[1][0]).toBeCloseTo(0.1);
      expect(stopListener).toHaveBeenCalledTimes(0);

      // Seek while playing, seek function calls stop.
      await TestScheduler.seek(0.5, undefined);
      expect(seekListener).toHaveBeenNthCalledWith(3, 0.5);
      // @ts-ignore
      expect(stopListener.mock.calls[0][0]).toBeCloseTo(0.1);
      expect(playListener).toHaveBeenNthCalledWith(3, 0.5);
      expect(pauseListener).toHaveBeenCalledTimes(1);
    });

    it("fires play listeners on every play", async () => {
      TestScheduler.seek(-0.5, undefined);

      const playListener1 = jest.fn(() => {});
      const playListener2 = jest.fn(() => {});
      TestScheduler.listeners.addListener("play", playListener1);
      TestScheduler.listeners.addListener("play", playListener2);

      await TestScheduler.play();

      expect(playListener1).toHaveBeenNthCalledWith(1, -0.5);
      expect(playListener2).toHaveBeenNthCalledWith(1, -0.5);

      await advanceTimers(mockAudioContextCurrentTime, 0.2, 1);
      TestScheduler.stop();
      await TestScheduler.play();

      expect(playListener1).toHaveBeenNthCalledWith(2, -0.5);
      expect(playListener2).toHaveBeenNthCalledWith(2, -0.5);
    });

    it("fires stop listeners on every stop", async () => {
      // Loops at 1.
      TestScheduler.seek(0.5, 1);

      const stopListener1 = jest.fn(() => {});
      const stopListener2 = jest.fn(() => {});
      TestScheduler.listeners.addListener("stop", stopListener1);
      TestScheduler.listeners.addListener("stop", stopListener2);

      await TestScheduler.play();

      expect(stopListener1).toHaveBeenCalledTimes(0);

      await advanceTimers(mockAudioContextCurrentTime, 0.1, 5);

      TestScheduler.stop();

      expect(stopListener1).toHaveBeenNthCalledWith(1, 0.5);
      expect(stopListener2).toHaveBeenNthCalledWith(1, 0.5);

      await TestScheduler.play();
      await advanceTimers(mockAudioContextCurrentTime, 0.2, 5);
      TestScheduler.stop();

      expect(stopListener1).toHaveBeenNthCalledWith(2, 0.5);
      expect(stopListener2).toHaveBeenNthCalledWith(2, 0.5);
    });

    it("fires pause listeners on every pause", async () => {
      TestScheduler.seek(0.5, undefined);

      const pauseListener1 = jest.fn(() => {});
      const pauseListener2 = jest.fn(() => {});
      TestScheduler.listeners.addListener("pause", pauseListener1);
      TestScheduler.listeners.addListener("pause", pauseListener2);

      await TestScheduler.play();
      await advanceTimers(mockAudioContextCurrentTime, 0.1, 3);
      TestScheduler.pause();

      expect(pauseListener1).toHaveBeenNthCalledWith(1, 0.8);
      expect(pauseListener2).toHaveBeenNthCalledWith(1, 0.8);

      await TestScheduler.play();
      await advanceTimers(mockAudioContextCurrentTime, 0.1, 3);
      TestScheduler.pause();

      expect(pauseListener1).toHaveBeenNthCalledWith(2, 1.1);
      expect(pauseListener2).toHaveBeenNthCalledWith(2, 1.1);
    });

    it("fires jsClockTick listener when clock ticks", async () => {
      const jsClockTickListener = jest.fn();

      TestScheduler.listeners.addListener("jsClockTick", jsClockTickListener);

      TestScheduler.seek(0, 2);
      await TestScheduler.play();

      await advanceTimers(mockAudioContextCurrentTime, 0.2, 1);
      expect(jsClockTickListener).toHaveBeenLastCalledWith(0.2);
      await advanceTimers(mockAudioContextCurrentTime, 0.2, 1);
      expect(jsClockTickListener).toHaveBeenLastCalledWith(0.4);

      await advanceTimers(mockAudioContextCurrentTime, 0.2, 8);
      expect(jsClockTickListener).toHaveBeenLastCalledWith(0);

      TestScheduler.stop();
      await advanceTimers(mockAudioContextCurrentTime, 0.2, 2);
      expect(jsClockTickListener).toHaveBeenLastCalledWith(0);
    });
  });
});
