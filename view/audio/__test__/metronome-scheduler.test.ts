import { Scheduler, SchedulerInstance } from "../scheduler";
import { AudioContext, registrar } from "standardized-audio-context-mock";
import { MetronomeScheduler } from "../metronome-scheduler";
import {
  Measure,
  MeasureSection
} from "../../component/workspace/context/metronome-context";
import { DeLorean } from "vehicles";
import { advanceTimers } from "./scheduler-test-utils";

describe("MetronomeScheduler", () => {
  let TestScheduler: typeof SchedulerInstance;
  let TestMetronomeScheduler: MetronomeScheduler;
  let mockAudioContext: AudioContext;
  let mockAudioContextCurrentTime: DeLorean;

  let mockMeasureSection1: MeasureSection;
  let mockMeasureMap1: { [no: number]: Measure };
  let mockMeasureSection2: MeasureSection;
  let mockMeasureMap2: { [no: number]: Measure };

  beforeEach(() => {
    jest.resetAllMocks();
    jest.useFakeTimers();

    mockAudioContext = new AudioContext();
    mockAudioContextCurrentTime = registrar.getDeLorean(mockAudioContext);
    TestScheduler = new Scheduler();
    // @ts-ignore
    TestScheduler.giveContext(mockAudioContext);

    mockMeasureSection1 = {
      id: "616c7b7b3a4270fe04761192",
      bpm: 120,
      beatsPerBar: 4,
      startMeasure: 0,
      repetitions: 0,
      metronomeSound: "beep"
    };
    mockMeasureSection2 = {
      id: "616c7b7b3a4270fe04761192",
      bpm: 150,
      beatsPerBar: 5,
      startMeasure: 0,
      repetitions: 0,
      metronomeSound: "beep"
    };
    mockMeasureMap1 = {
      "-1": {
        num: -1,
        timeStart: -2,
        section: mockMeasureSection1
      },
      "0": {
        num: 0,
        timeStart: 0,
        section: mockMeasureSection1
      },
      "1": {
        num: 1,
        timeStart: 2,
        section: mockMeasureSection1
      },
      "2": {
        num: 2,
        timeStart: 4,
        section: mockMeasureSection1
      },
      "3": {
        num: 3,
        timeStart: 6,
        section: mockMeasureSection1
      },
      "4": {
        num: 4,
        timeStart: 8,
        section: mockMeasureSection1
      },
      "5": {
        num: 5,
        timeStart: 10,
        section: mockMeasureSection1
      },
      "6": {
        num: 6,
        timeStart: 12,
        section: mockMeasureSection1
      }
    };
    mockMeasureMap2 = {
      "-1": {
        num: -1,
        timeStart: -2,
        section: mockMeasureSection2
      },
      "0": {
        num: 0,
        timeStart: 0,
        section: mockMeasureSection2
      },
      "1": {
        num: 1,
        timeStart: 2,
        section: mockMeasureSection2
      },
      "2": {
        num: 2,
        timeStart: 6,
        section: mockMeasureSection2
      },
      "3": {
        num: 3,
        timeStart: 8,
        section: mockMeasureSection2
      }
    };

    TestMetronomeScheduler = new MetronomeScheduler(
      // @ts-ignore
      mockAudioContext,
      TestScheduler,
      () => mockMeasureMap1
    );
    TestMetronomeScheduler.updateGetMeasureMap(() => mockMeasureMap1);
  });

  afterEach(() => {
    registrar.reset(mockAudioContext);
  });

  describe("tick scheduling while looping", () => {
    it("schedules a finite amount of ticks on seek", () => {
      // Two measures
      TestScheduler.seek(0, 4);

      expect(TestMetronomeScheduler.scheduledTickIds).not.toContain(
        "m_click:-1.3"
      );
      expect(TestMetronomeScheduler.scheduledTickIds).toContain("m_click:0.0");
      expect(TestMetronomeScheduler.scheduledTickIds).toContain("m_click:1.0");
      expect(TestMetronomeScheduler.scheduledTickIds).toContain("m_click:1.3");
      expect(TestMetronomeScheduler.scheduledTickIds).not.toContain(
        "m_click:2.0"
      );

      expect(TestScheduler.events["m_click:0.0"].start).toEqual(0);
      expect(TestScheduler.events["m_click:0.1"].start).toEqual(0.5);
      expect(TestScheduler.events["m_click:1.0"].start).toEqual(2);
      expect(TestScheduler.events["m_click:1.3"].start).toEqual(3.5);
    });

    it("clears existing ticks and schedules new ones on seek", () => {
      TestScheduler.seek(0, 4);

      expect(TestMetronomeScheduler.scheduledTickIds).toContain("m_click:0.0");
      expect(TestMetronomeScheduler.scheduledTickIds).toContain("m_click:0.1");
      expect(TestMetronomeScheduler.scheduledTickIds).toContain("m_click:1.3");
      expect(TestMetronomeScheduler.scheduledTickIds).not.toContain(
        "m_click:2.0"
      );

      TestScheduler.seek(0.2, 4.2);

      expect(TestMetronomeScheduler.scheduledTickIds).not.toContain(
        "m_click:0.0"
      );
      expect(TestMetronomeScheduler.scheduledTickIds).toContain("m_click:0.1");
      expect(TestMetronomeScheduler.scheduledTickIds).toContain("m_click:2.0");
      expect(TestMetronomeScheduler.scheduledTickIds).not.toContain(
        "m_click:2.1"
      );
    });

    it("schedules correct ticks when idleTime and loopPoint are not on beats", () => {
      TestScheduler.seek(-0.64, 2.72);

      // -1.2 = -1.0 seconds
      expect(TestMetronomeScheduler.scheduledTickIds).not.toContain(
        "m_click:-1.2"
      );
      // -1.3 = -0.5 seconds
      expect(TestMetronomeScheduler.scheduledTickIds).toContain("m_click:-1.3");
      // 1.1 = 2.5 seconds
      expect(TestMetronomeScheduler.scheduledTickIds).toContain("m_click:1.1");
      // 1.2 = 3.0 seconds
      expect(TestMetronomeScheduler.scheduledTickIds).not.toContain(
        "m_click:1.2"
      );
    });

    it("schedules correct ticks for a different time signature", () => {
      TestMetronomeScheduler.updateGetMeasureMap(() => mockMeasureMap2);

      TestScheduler.seek(0, 5);

      expect(TestMetronomeScheduler.scheduledTickIds).not.toContain(
        "m_click:-1.4"
      );
      expect(TestMetronomeScheduler.scheduledTickIds).toContain("m_click:0.0");
      expect(TestMetronomeScheduler.scheduledTickIds).toContain("m_click:0.4");
      expect(TestMetronomeScheduler.scheduledTickIds).toContain("m_click:1.4");
      expect(TestMetronomeScheduler.scheduledTickIds).not.toContain(
        "m_click:2.0"
      );

      expect(TestScheduler.events["m_click:0.0"].start).toEqual(0);
      expect(TestScheduler.events["m_click:0.4"].start).toEqual(1.6);
    });
  });

  describe("tick scheduling during infinity (non-looping) mode", () => {
    beforeEach(() => {
      expect(MetronomeScheduler.TICK_BATCH_DURATION).toEqual(4);
    });

    it("schedules a single batch of clicks before scheduler play", () => {
      TestScheduler.seek(0, undefined);

      expect(TestMetronomeScheduler.scheduledTickIds).not.toContain(
        "m_click:-1.3"
      );
      expect(TestMetronomeScheduler.scheduledTickIds).toContain("m_click:0.0");
      expect(TestMetronomeScheduler.scheduledTickIds).toContain("m_click:1.3");
      expect(TestMetronomeScheduler.scheduledTickIds).not.toContain(
        "m_click:2.0"
      );
      expect(
        TestMetronomeScheduler.accessPrivateFields()._scheduledTicksTimeRange
      ).toEqual([0, MetronomeScheduler.TICK_BATCH_DURATION]);
    });

    it("schedules second batch of clicks shortly after playback begins", async () => {
      TestScheduler.seek(0, undefined);

      await TestScheduler.play();

      expect(TestMetronomeScheduler.scheduledTickIds.length).toEqual(8);

      await advanceTimers(mockAudioContextCurrentTime, 0.2, 4);

      expect(TestMetronomeScheduler.scheduledTickIds.length).toEqual(16);
      expect(TestMetronomeScheduler.scheduledTickIds.length).toEqual(
        new Set(TestMetronomeScheduler.scheduledTickIds).size
      );
      expect(TestMetronomeScheduler.scheduledTickIds).not.toContain(
        "m_click:-1.3"
      );
      expect(TestMetronomeScheduler.scheduledTickIds).toContain("m_click:0.0");
      expect(TestMetronomeScheduler.scheduledTickIds).toContain("m_click:3.3");
      expect(TestMetronomeScheduler.scheduledTickIds).not.toContain(
        "m_click:4.0"
      );
      expect(
        TestMetronomeScheduler.accessPrivateFields()._scheduledTicksTimeRange
      ).toEqual([0, MetronomeScheduler.TICK_BATCH_DURATION * 2]);
    });

    it("schedules third batch of clicks once timecode reaches second batch", async () => {
      TestScheduler.seek(0, undefined);

      await TestScheduler.play();
      await advanceTimers(mockAudioContextCurrentTime, 0.2, 19);

      expect(TestMetronomeScheduler.scheduledTickIds.length).toEqual(16);

      await advanceTimers(mockAudioContextCurrentTime, 0.2, 1);

      expect(TestMetronomeScheduler.scheduledTickIds.length).toEqual(24);
      expect(
        TestMetronomeScheduler.accessPrivateFields()._scheduledTicksTimeRange
      ).toEqual([0, MetronomeScheduler.TICK_BATCH_DURATION * 3]);
    });
  });

  describe("avoiding double-dispatch", () => {});
});
