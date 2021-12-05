import { MetronomeContextData } from "../component/workspace/context/metronome-context";
import { Scheduler } from "./scheduler";

/**
 * This class hooks into `Scheduler`'s listener system to interactively schedule
 * metronome tick events according to a form model which can be updated.
 */
export class MetronomeScheduler2 {
  private _context: AudioContext;

  private _scheduler: Scheduler;

  private _getMeasureMap: MetronomeContextData["getMeasureMap"];

  private _scheduledTicks: string[];

  private _scheduledTicksTimeRange: number[];

  private _nextBatchLoaded = false;

  private _nextBatchStart = 0;

  public static readonly TICK_BATCH_DURATION = 4;

  public static readonly BEEP_TICK_DURATION = 0.05;

  public static readonly CLOCK_INTERVAL = 200;

  constructor(
    audioContext: AudioContext,
    scheduler: Scheduler,
    initialGetMeasureMap: MetronomeContextData["getMeasureMap"]
  ) {
    if (!audioContext)
      throw new Error(
        "Audio context passed to metronome scheduler wasn't defined."
      );
    if (!scheduler)
      throw new Error(
        "Scheduler passed to metronome scheduler wasn't defined."
      );

    this._context = audioContext;
    this._scheduler = scheduler;
    this._getMeasureMap = initialGetMeasureMap;
    this._scheduledTicks = [];
    this._scheduledTicksTimeRange = [0, 0];

    this._scheduler.listeners.addListener(
      "seek",
      this.onSchedulerSeek,
      "metronome_seek"
    );
    this._scheduler.listeners.addListener(
      "play",
      this.onSchedulerPlay,
      "metronome_play"
    );
    this._scheduler.listeners.addListener(
      "stop",
      this.onSchedulerStop,
      "metronome_stop"
    );
    this._scheduler.listeners.addListener(
      "jsClockTick",
      this.onSchedulerJSClockTick,
      "metronome_jsClockTick"
    );
  }

  private onSchedulerPlay = (): void => {};

  private onSchedulerSeek = (time: number): void => {
    this.clear();
    if (this._scheduler.loops) {
      this.scheduleTicks(time, this._scheduler.loopPoint);
    } else {
      this.scheduleTicks(time, time + MetronomeScheduler2.TICK_BATCH_DURATION);
    }
  };

  private onSchedulerStop = (): void => {};

  private onSchedulerJSClockTick = (time: number): void => {
    // We can schedule all the ticks for a loop right away.
    if (this._scheduler.loops) return;

    const scheduleNextBatch =
      time >=
      this._scheduledTicksTimeRange[1] -
        MetronomeScheduler2.TICK_BATCH_DURATION;

    if (scheduleNextBatch) {
      this.scheduleTicks(
        this._scheduledTicksTimeRange[1],
        this._scheduledTicksTimeRange[1] +
          MetronomeScheduler2.TICK_BATCH_DURATION
      );
    }
  };

  updateGetMeasureMap = (
    getMeasureMap: MetronomeContextData["getMeasureMap"]
  ): void => {
    this.clear();
    this._getMeasureMap = getMeasureMap;
    if (this._scheduler.loops) {
      this.scheduleTicks(this._scheduler.idleTime, this._scheduler.loopPoint);
    } else {
      this.scheduleTicks(
        this._scheduler.idleTime,
        this._scheduler.idleTime + MetronomeScheduler2.TICK_BATCH_DURATION
      );
    }
  };

  private clear = (): void => {
    this._scheduledTicks.forEach(tick => {
      this._scheduler.removeEvent(tick);
    });
    this._scheduledTicks = [];
    this._scheduledTicksTimeRange = [0, 0];
  };

  private scheduleBeepTick = ({
    tickCode,
    tickLevel,
    tickTime
  }: {
    tickCode: string;
    tickLevel: number;
    tickTime: number;
  }): void => {
    const tickId = `m_click:${tickCode}`;

    if (!this._scheduledTicks.includes(tickId)) {
      this._scheduledTicks.push(tickId);

      this._scheduler.addEvent({
        id: tickId,
        start: tickTime,
        duration: MetronomeScheduler2.BEEP_TICK_DURATION,
        type: "Audio",
        dispatch: async ({
          context,
          startTime,
          when,
          offset,
          duration
        }): Promise<AudioScheduledSourceNode> => {
          const actualStartTime = startTime + when;
          const actualDuration = Math.max(0, duration - offset);

          if (actualDuration === 0) return null;

          const osc = context.createOscillator();
          osc.type = "sine";
          osc.frequency.setValueAtTime(
            tickLevel === 0 ? 880 : 440,
            actualStartTime
          );
          osc.connect(context.destination);
          osc.start(actualStartTime);
          osc.stop(actualStartTime + actualDuration);
          return osc;
        }
      });
    }
  };

  scheduleTicks = (start: number, end: number): void => {
    const measureMap = this._getMeasureMap({ start, end });
    const measureNos = Object.keys(measureMap).map(Number);
    measureNos.forEach(measureNo => {
      const measure = measureMap[measureNo];
      const measureBeatDuration = 1.0 / (measure.section.bpm / 60);

      for (let tick = 0; tick < measure.section.beatsPerBar; tick++) {
        const tickTime = measure.timeStart + measureBeatDuration * tick;

        if (
          tickTime < end &&
          tickTime + MetronomeScheduler2.BEEP_TICK_DURATION >= start
        ) {
          const code = `${measure.num}.${tick}`;
          this.scheduleBeepTick({
            tickCode: code,
            tickLevel: tick === 0 ? 0 : 1,
            tickTime
          });
        }
      }
    });
    this._scheduledTicksTimeRange[0] = Math.min(
      this._scheduledTicksTimeRange[0],
      start
    );
    this._scheduledTicksTimeRange[1] = Math.max(
      this._scheduledTicksTimeRange[1],
      end
    );
  };

  get scheduledTickIds(): string[] {
    return this._scheduledTicks;
  }

  accessPrivateFields = (): {
    _scheduledTicksTimeRange: MetronomeScheduler2["_scheduledTicksTimeRange"];
  } => ({ _scheduledTicksTimeRange: this._scheduledTicksTimeRange });
}
