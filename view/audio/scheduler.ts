import { processMetronome, VampFormData } from "../util/metronome-hooks";

class SchedulerEvent {
  readonly id: string;

  public start: number;

  public type: "Clip";

  /**
   * Called by scheduler when this event starts playing. All events that use Web
   * Audio API nodes should return the node, or else they won't stop playing.
   *
   * @param context An AudioContext, in case it's not present in the dispatching
   * module.
   * @param startTime The value of context.currentTime when play was started. If
   * we get this directly from `context` we risk having variance in when things
   * are dispatched.
   * @param offset Number of seconds into the event to start playing at.
   */
  public dispatch: (
    context: AudioContext,
    startTime: number,
    offset?: number
  ) => Promise<void | AudioScheduledSourceNode>;
}

interface LoadedTick {
  time: number;
  nextTickCode: string;
  level: number;
}

class MetronomeScheduler {
  private _measureBatchDuration = 10;

  private _context: AudioContext;
  private _isPlaying: boolean[];
  private _latestPlaying: number;

  private _vampFormData: VampFormData;

  private _activeTickNode: AudioScheduledSourceNode;

  public enabled: boolean;

  private _firstLoadedTickCode: string;
  private _lastLoadedTickCode: string;

  /** `code` for the second tick of the measure 4 would be "4.1" */
  public loadedTicks: {
    [code: string]: LoadedTick;
  };

  constructor(context: AudioContext) {
    this._context = context;
    this.loadedTicks = {};
    this.enabled = true;
    this._isPlaying = [];
    this.clear();
  }

  private firstLoadedTick = (): LoadedTick =>
    this.loadedTicks[this._firstLoadedTickCode];

  private lastLoadedTick = (): LoadedTick =>
    this.loadedTicks[this._lastLoadedTickCode];

  private tick = (
    type: "Beep",
    level: number,
    nodeStartTime: number,
    onEnded: () => void
  ): void => {
    switch (type) {
      case "Beep": {
        const osc = this._context.createOscillator();
        osc.type = "sine";
        osc.frequency.setValueAtTime(level === 0 ? 880 : 440, nodeStartTime);
        osc.connect(this._context.destination);
        osc.onended = onEnded;
        osc.start(nodeStartTime);
        osc.stop(nodeStartTime + 0.05);
        this._activeTickNode = osc;
      }
    }
  };

  /**
   * 1 if code1 comes after code2, 0 if they're equal, -1 if code1 comes before
   * code2.
   */
  private compareCodes = (code1: string, code2: string): number => {
    const code1Nums = code1.split(".");
    const code2Nums = code2.split(".");

    const measure1 = parseInt(code1Nums[0]);
    const measure2 = parseInt(code2Nums[0]);

    if (measure1 > measure2) return 1;
    else if (measure1 < measure2) return -1;
    else {
      const tick1 = parseInt(code1Nums[1]);
      const tick2 = parseInt(code2Nums[1]);

      if (tick1 > tick2) return 1;
      else if (tick1 < tick2) return -1;
      else return 0;
    }
  };

  /**
   * "Paginate" a batch of measures.
   */
  private loadMeasures = (start: number, end: number): void => {
    start = Math.floor(start);
    if (!this._vampFormData) throw new Error("No form data in metronome.");

    // Ensures we load measures between the current range and where we're
    // seeking to.
    if (this.lastLoadedTick() && start > this.lastLoadedTick().time) {
      start = this.lastLoadedTick().time;
    }
    if (this.firstLoadedTick() && end < this.firstLoadedTick().time) {
      end = this.firstLoadedTick().time;
    }

    const { measureMap } = processMetronome({
      vampFormData: this._vampFormData,
      start,
      end
    });

    const keys = Object.keys(measureMap).map(Number);
    keys.forEach(key => {
      const measure = measureMap[key];
      const measureBeatDuration = 1.0 / (measure.section.bpm / 60);
      for (let tick = 0; tick < measure.section.beatsPerBar; tick++) {
        const code = `${measure.num}.${tick}`;
        const nextCode =
          tick === measure.section.beatsPerBar - 1
            ? `${measure.num + 1}.${0}`
            : `${measure.num}.${tick + 1}`;
        this.loadedTicks[code] = {
          level: tick === 0 ? 0 : 1,
          time: measure.timeStart + measureBeatDuration * tick,
          nextTickCode: nextCode
        };

        if (
          !this._firstLoadedTickCode ||
          this.compareCodes(this._firstLoadedTickCode, code) === 1
        ) {
          this._firstLoadedTickCode = code;
        }
        if (
          !this._lastLoadedTickCode ||
          this.compareCodes(this._lastLoadedTickCode, code) === -1
        ) {
          this._lastLoadedTickCode = code;
        }
      }
    });
  };

  public seek = (time: number): void => {
    this.loadMeasures(time, time + this._measureBatchDuration);
  };

  /**
   * Provides new form data from the server for the metronome to use.
   */
  public updateFormData = (
    vampFormData: VampFormData,
    seekTo: number
  ): void => {
    this.clear();
    this._vampFormData = vampFormData;
    this.seek(seekTo);
  };

  public clear = (): void => {
    this.loadedTicks = {};
    this._firstLoadedTickCode = undefined;
    this._lastLoadedTickCode = undefined;
  };

  public dispatch = (ctxStart: number, idleTime: number): void => {
    this._isPlaying.push(true);
    this._latestPlaying = this._isPlaying.length - 1;
    const playingIndex = this._latestPlaying;

    let tickCode = this._firstLoadedTickCode;

    // Skips over ticks before starting tick.
    while (this.loadedTicks && this.loadedTicks[tickCode].time < idleTime) {
      tickCode = this.loadedTicks[tickCode].nextTickCode;
    }

    const playNextTick = (): void => {
      if (!this._isPlaying[playingIndex]) {
        return;
      }

      const nextTick = this.loadedTicks[tickCode];
      if (!nextTick) throw new Error("Next tick wasn't loaded.");

      if (
        this.lastLoadedTick().time - nextTick.time <
        this._measureBatchDuration
      ) {
        this.loadMeasures(
          this.lastLoadedTick().time,
          this.lastLoadedTick().time + this._measureBatchDuration
        );
      }

      this.tick(
        "Beep",
        nextTick.level,
        ctxStart + nextTick.time - idleTime,
        () => {
          playNextTick();
        }
      );

      tickCode = nextTick.nextTickCode;
    };
    playNextTick();
  };

  public stop = (): void => {
    this._isPlaying[this._latestPlaying] = false;
    this._activeTickNode?.disconnect();
    this._activeTickNode?.stop(0);
  };
}

class Scheduler {
  private _context: AudioContext;

  private _events: { [id: string]: SchedulerEvent };

  /**
   * An object that handles dispatching metronome events.
   */
  private _metronomeScheduler: MetronomeScheduler;

  /**
   * If an event's dispatch function returns an AudioScheduledSourceNode, that
   * node is added to this list, and is removed when play is stopped. So this is
   * more or less a list of all currently-playing source nodes. It gives us the
   * ability to stop the nodes from playing on command.
   */
  private _dispatchedAudioNodes: { [id: string]: AudioScheduledSourceNode };

  /** The time code in seconds if paused or before play began. */
  private _idleTime: number;

  private _isPlaying: boolean;

  /**
   * The AudioContext runs an internal timer that it handles dispatch relative
   * to. This stores that value when play begins so all events are perfectly
   * synced.
   */
  private _audioContextPlayStart: number;

  constructor() {
    this._events = {};
    this._dispatchedAudioNodes = {};
    this._idleTime = 0;
    this._isPlaying = false;
    this._audioContextPlayStart = 0;
  }

  giveContext = (context: AudioContext): void => {
    this._context = context;
    this._metronomeScheduler = new MetronomeScheduler(context);
  };

  play = async (): Promise<void> => {
    this._isPlaying = true;
    this._context.suspend();
    this._audioContextPlayStart = this._context.currentTime;

    const eventIds = Object.keys(this._events);
    for (let i = 0; i < eventIds.length; i++) {
      const eventId = eventIds[i];
      const event = this._events[eventId];
      const node = await event.dispatch(
        this._context,
        this._audioContextPlayStart,
        this._idleTime - event.start
      );
      if (node) this._dispatchedAudioNodes[eventId] = node;
    }

    this._metronomeScheduler.dispatch(
      this._audioContextPlayStart,
      this._idleTime
    );
    this._context.resume();
  };

  seek = (time: number): void => {
    const playing = this._isPlaying;
    if (playing) this.stop();
    this._metronomeScheduler.seek(time);
    this._idleTime = time;
    if (playing) this.play();
  };

  stop = (): void => {
    this._isPlaying = false;
    this.cancelDispatch();
    this._metronomeScheduler.stop();
  };

  /**
   * Stops all started audio nodes.
   */
  private cancelDispatch = (): void => {
    Object.keys(this._dispatchedAudioNodes).forEach(nodeKey => {
      this._dispatchedAudioNodes[nodeKey]?.disconnect();
      this._dispatchedAudioNodes[nodeKey]?.stop(0);
      delete this._dispatchedAudioNodes[nodeKey];
    });
  };

  addEvent = (event: SchedulerEvent): void => {
    if (this._events[event.id]) this.removeEvent(event.id);
    this._events[event.id] = event;
  };

  updateEvent = (eventId: string, { start }: { start: number }): void => {
    this._events[eventId].start = start;
    if (this._dispatchedAudioNodes[eventId]) {
      this._dispatchedAudioNodes[eventId]?.disconnect();
      this._dispatchedAudioNodes[eventId]?.stop(0);
    }
  };

  removeEvent = (id: string, stopNode = true): void => {
    if (stopNode && this._dispatchedAudioNodes[id]) {
      this._dispatchedAudioNodes[id]?.disconnect();
      this._dispatchedAudioNodes[id]?.stop(0);
      delete this._dispatchedAudioNodes[id];
    }
    delete this._events[id];
  };

  updateMetronome = (vampFormData: VampFormData, seekTo: number): void => {
    this._metronomeScheduler.updateFormData(vampFormData, seekTo);
  };
}

const SchedulerInstance = new Scheduler();

export { SchedulerEvent, SchedulerInstance };
