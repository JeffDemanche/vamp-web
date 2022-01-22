import * as _ from "underscore";
import { CountOff } from "../component/workspace/context/recording/playback-context";

class SchedulerEvent {
  readonly id: string;

  /** Non-AudioContext time that this event should start playing at. */
  public start: number;

  /**
   * If specified, the event will stop playing this many seconds after start.
   */
  public duration?: number;

  /**
   * Start the event at this many seconds into it. For instance, this event
   * might be an AudioBufferSource node where we don't want the node to start at
   * the beginning of the audio.
   */
  public offset?: number;

  public type: "Audio";

  /**
   * **The main function of scheduler is to take the zero-based fields on an
   * event (start, duration, offset) and transform them into the AudioContext
   * time coordinates that are returned to the event as the args to this
   * `dispatch` function.**
   *
   * This is called by `Scheduler` with information about when to dispatch a Web
   * Audio API node. Note that it is not necessarily called at the moment when
   * events start playing. All events that use Web Audio API nodes should return
   * the node, as this is how the scheduler stops all audio when it is stopped
   * or paused.
   *
   * @param context An AudioContext, in case it's not present in the dispatching
   * module.
   * @param startTime The value of context.currentTime to base this dispatch off
   * of. For instance, if this is `2` and `when` is `0.5`, the event should be
   * fired at AC-time `2.5`.
   * @param when Number of seconds between `startTime` and when the event should
   * start playing.
   * @param offset Number of seconds into the event to begin playback at.
   * @param duration How many seconds after starting to play to stop playing.
   */
  public dispatch: (args: {
    context: AudioContext;
    startTime: number;
    when?: number;
    offset?: number;
    duration?: number;
  }) => Promise<void | AudioScheduledSourceNode>;
}

const metronomeTick = (
  context: AudioContext,
  type: "Beep",
  level: number,
  nodeStartTime: number,
  onEnded?: (this: AudioScheduledSourceNode, ev: Event) => void
): AudioScheduledSourceNode => {
  switch (type) {
    case "Beep": {
      const osc = context.createOscillator();
      osc.type = "sine";
      osc.frequency.setValueAtTime(level === 0 ? 880 : 440, nodeStartTime);
      osc.connect(context.destination);
      osc.onended = onEnded;
      osc.start(nodeStartTime);
      osc.stop(nodeStartTime + 0.05);
      return osc;
    }
  }
};

/**
 * This is a separate class from `MetromeScheduler`, since that class has a lot
 * of extra functionality for playing infinitely, seeking, etc. This class can
 * play/stop a pre-specified list of form sections.
 */
class CountOffMetronomeScheduler {
  private _context: AudioContext;

  private _countOff: CountOff;

  private _ticks: { sound: string; level: number; time: number }[];

  private _activeTickNodes: AudioScheduledSourceNode[];

  constructor() {
    this._ticks = [];
    this._activeTickNodes = [];
  }

  giveContext = (context: AudioContext): void => {
    this._context = context;
  };

  /**
   * We supply an array of sections here that we convert into an array of ticks
   * with specified times. In most cases we'll only have a single "section"
   * here, but it'll be nice to support complex countoffs.
   */
  public setCountOff = (countOff: CountOff): void => {
    this._countOff = countOff;

    let measureStartTimeAcc = 0;

    this._ticks = [];

    countOff.measures.forEach(measure => {
      for (let r = 0; r < measure.repetitions; r++) {
        for (let n = 0; n < measure.beats; n++) {
          const beatTimeInMeasure = (60.0 / measure.bpm) * n;
          this._ticks.push({
            sound: measure.metronomeSound,
            level: n === 0 ? 0 : 1,
            time: measureStartTimeAcc + beatTimeInMeasure
          });
        }
        // Increment by measure duration
        measureStartTimeAcc += (60.0 / measure.bpm) * measure.beats;
      }
    });
  };

  public dispatch = (ctxStart: number, idleTime: number): void => {
    if (!this._countOff)
      throw new Error(
        "Tried to dispatch count off scheduler without countOff data"
      );

    this._ticks.forEach(tick => {
      this._activeTickNodes.push(
        metronomeTick(
          this._context,
          "Beep",
          tick.level,
          ctxStart + tick.time - idleTime
        )
      );
    });
  };

  public stop = (): void => {
    this._activeTickNodes.forEach(node => {
      node.disconnect();
      node.stop(0);
    });
  };

  public getCountOff = (): CountOff => this._countOff;

  accessPrivateFields(): {} {
    return {};
  }
}

type SchedulerListenerType =
  | "seek"
  | "play"
  | "pause"
  | "stop"
  | "jsClockTick"
  | "afterLoop";

class SchedulerListeners {
  private _listeners: {
    id: string;
    type: SchedulerListenerType;
    callback: (time: number) => void;
  }[];

  constructor() {
    this._listeners = [];
  }

  fire = (type: SchedulerListenerType, time: number): void => {
    this._listeners.forEach(listener => {
      if (listener.type === type) {
        listener.callback(time);
      }
    });
  };

  addListener = (
    type: SchedulerListenerType,
    callback: (time: number) => void,
    id?: string
  ): string => {
    if (id && this._listeners.filter(l => l.id === id)) {
      this.removeListener(id);
    }

    this._listeners.push({ id, type, callback });
    return id;
  };

  removeListener = (id: string): void => {
    this._listeners = this._listeners.filter(listener => listener.id !== id);
  };
}

/**
 * The scheduler tracks `SchedulerEvents`, which are any kind of dispatchable
 * audio, and handles playing those events through the Web Audio API. This
 * should *follow* updates made in the Apollo state (for instance, when
 * `playing` goes from false to true, we want `play` in this class to get
 * called).
 */
export class Scheduler {
  private _context: AudioContext;

  /** Dictionary of events that should be played. */
  private _events: { [id: string]: SchedulerEvent };

  private _listeners: SchedulerListeners;

  /**
   * At this point in seconds, we will loop back to `_idleTime`.
   */
  private _loopPoint?: number;

  /**
   * The number of seconds between the beginning and end of a loop period, i.e.
   * events in one loop will start this many seconds after events in the loop
   * before it.
   */
  private _loopDispatchOffset: number;

  /**
   * If `play` is called after the (looping) scheduler is paused, this will get
   * set to the number of seconds between the paused time and the end of the
   * loop.
   */
  private _firstLoopDispatchOffset: number;

  /**
   * Holds the value returned by `setTimeout` for the JS timer.
   */
  private _jsClockTimeout: number;

  /**
   * A simpler object that handles dispatching the pre-play countoff.
   */
  private _countOffMetronomeScheduler: CountOffMetronomeScheduler;

  /**
   * If an event's dispatch function returns an AudioScheduledSourceNode, that
   * node is added to this list, and is removed when play is stopped. So this is
   * more or less a list of all currently-playing source nodes. It gives us the
   * ability to stop the nodes from playing on command.
   */
  private _dispatchedAudioNodes: { [id: string]: AudioScheduledSourceNode[] };

  /**
   * The time that the scheduler will return to when stopped, and will play
   * from when played after being stopped.
   */
  private _idleTime: number;

  /**
   * On `pause`, this is set to the Vamp time at which the scheduler is paused.
   * It remains defined until `stop` is called, so that it can be referenced
   * during playback.
   */
  private _pausedTime: number;

  /** Is the scheduler currently playing. */
  private _isPlaying: boolean;

  /**
   * This stores the AudioContext.currentTime at the instant when the scheduler
   * was most recently played. This gives us the ability to compare with the
   * AudioContext.currentTime at the point when events are actually dispatched
   * and account for unwanted offset.
   */
  private _audioContextPlayStart: number;

  /**
   * Similar to `_audioContextPlayStart`, but is updated when every loop is
   * scheduled to keep track of the `AudioContext.currentTime` that marks that
   * loop's precise start time.
   */
  private _audioContextLoopStart: number;

  constructor() {
    this._events = {};
    this._listeners = new SchedulerListeners();
    this._dispatchedAudioNodes = {};
    this._idleTime = 0;
    this._isPlaying = false;
    this._audioContextPlayStart = 0;
    this._audioContextLoopStart = 0;
    this._loopDispatchOffset = 0;
    this._firstLoopDispatchOffset = 0;
    this._countOffMetronomeScheduler = new CountOffMetronomeScheduler();
  }

  /**
   * Since this class gets initialized in this module, we can't pass through
   * constructor args. Instead, this gets called from React state in
   * WorkspaceAudio as soon as this class instance gets loaded.
   */
  giveContext = (context: AudioContext): void => {
    this._context = context;
    this._countOffMetronomeScheduler.giveContext(context);
  };

  /**
   * Dispatches the event in the `_events` map for the given ID, then adds the
   * resulting node to `_dispatchedAudioNodes` if it exists.
   *
   * @param audioContextBasis Should be omitted if the event is being played
   * on-the-fly (as in, dispatched while the scheduler is playing). In this
   * case, the basis for timing dispatched nodes will default to
   * `context.currentTime`. If provided, this value is the time in AC-space when
   * audio context nodes should be played relative to. If this call happens when
   * play first begins, this should be `this._audioContextPlayStart` or
   * `this._audioContextLoopStart`.
   *
   * @param after Optionally, adds this many seconds offset to the event
   * dispatch.
   */
  private playEvent = async ({
    eventId,
    audioContextBasis
  }: {
    eventId: string;
    audioContextBasis?: number;
  }): Promise<void> => {
    const event = this._events[eventId];
    if (!event) throw new Error("Tried to play event that wasn't registered.");

    const dispatchedWhilePlaying = audioContextBasis === undefined;
    audioContextBasis = audioContextBasis ?? this._context.currentTime;

    let playheadVampTime;
    if (dispatchedWhilePlaying) playheadVampTime = this.timecode;
    // This case only runs if we're dispatching events for the first time after
    // playing from a paused state.
    else if (
      this._pausedTime !== undefined &&
      this._firstLoopDispatchOffset === this._loopDispatchOffset
    )
      playheadVampTime = this._pausedTime;
    else playheadVampTime = this._idleTime;

    // This will be negative if the event plays some time in the future,
    // positive if it should be started somewhere in the middle.
    const eventTimeFromPlayhead = playheadVampTime - event.start;

    // When events are created (such as an audio content), they can specify an
    // offset value, which ends up getting fed back into the dispatch function'
    // offset argument, but account for other sources of offset like starting
    // playing after content start.
    const specifiedEventOffset = event.offset ?? 0;

    // (Non-negative) Time into event to start playing.
    const offset = specifiedEventOffset + Math.max(0, eventTimeFromPlayhead);

    // (Non-negative) Time *until* event should start playing.
    const when = Math.max(0, -eventTimeFromPlayhead);

    // event.duration doesn't account for where playback starts. This will clamp
    // the *duration* of the dispatched event based on if the playback starts
    // after the event ended (*0*), before the event begins (*event.duration*),
    // or somewhere during the event (*the remaining event duration*).
    const durationAfterPlayhead = event.duration
      ? Math.min(
          Math.max(event.duration - (playheadVampTime - event.start), 0),
          event.duration
        )
      : undefined;

    // event.duration also doesn't account for the scheduler loop point.
    let durationAfterPlayheadAndBeforeLoop = durationAfterPlayhead;
    if (this.loops && durationAfterPlayhead) {
      durationAfterPlayheadAndBeforeLoop = Math.min(
        durationAfterPlayhead,
        this.loopPoint - playheadVampTime - when
      );
    }

    if (durationAfterPlayheadAndBeforeLoop > 0) {
      const node = await event.dispatch({
        context: this._context,
        startTime: audioContextBasis,
        when,
        offset,
        duration: durationAfterPlayheadAndBeforeLoop
      });
      if (node) this.pushAudioNodeForEvent(eventId, node);

      // Slightly idiosyncratic... jsClockTick dispatches all looping events in
      // batches, so it doesn't handle events played on-the-fly, after the next
      // loop batch has been scheduled. The result is that an event added or
      // updated while playing will miss the next loop unless we dispatch it
      // twice, which we do here.
      if (dispatchedWhilePlaying && this.loops) {
        this.playEvent({
          eventId,
          audioContextBasis:
            this._audioContextLoopStart + this._loopDispatchOffset
        });
      }
    }
  };

  /**
   * Plays all scheduled events, starting at `_idleTime`.
   *
   * @param delay Specify to precisely delay playback by this many seconds.
   */
  play = async (delay?: number): Promise<void> => {
    delay = delay ?? 0;

    const startingFrom = this.paused ? this._pausedTime : this._idleTime;

    if (this._loopPoint !== undefined && this._loopPoint <= startingFrom)
      throw new Error("Loop point must be greater than play start time.");

    this._isPlaying = true;

    await this._context.suspend();

    this.setLoopDispatchOffset(startingFrom, true);

    this._audioContextPlayStart = this._context.currentTime + delay;
    this._audioContextLoopStart = this._audioContextPlayStart;

    this.jsClockTick();

    await this.dispatchAllEvents(this._audioContextPlayStart);

    this._listeners.fire("play", startingFrom);

    await this._context.resume();
  };

  /**
   * Fires all events' `dispatch` calls, with scheduled start times of `atTime`.
   */
  private dispatchAllEvents = async (
    audioContextBasis: number
  ): Promise<void> => {
    const eventIds = Object.keys(this._events);
    for (let i = 0; i < eventIds.length; i++) {
      const eventId = eventIds[i];
      await this.playEvent({
        audioContextBasis,
        eventId
      });
    }
  };

  /**
   * All audio events are dispatched with precise timing using the Web Audio API
   * timing mechanism. However, the API doesn't provide a way to time code
   * execution using that mechanism. So *when* to call the code that dispatches
   * events needs to take place using JS timers.
   *
   * This looping function in particular routinely checks whether we need to
   * re-dispatch all events when the scheduler is set to loop.
   *
   * @see https://www.html5rocks.com/en/tutorials/audio/scheduling/
   */
  private jsClockTick = (): void => {
    let nextLoopDispatched = false;
    // This is in the future.
    let nextLoopStart =
      this._audioContextLoopStart + this._firstLoopDispatchOffset;
    let isThisTheFirstLoop = true;

    const clockTickRecur = (): void => {
      // We try to dispatch the next loop of an event as soon as the previous loop
      // begins as possible.
      if (this._isPlaying) {
        this._jsClockTimeout = setTimeout(() => {
          if (this.loops) {
            // This case dispatches events in the future.
            if (!nextLoopDispatched) {
              nextLoopStart =
                this._audioContextLoopStart + this._loopDispatchOffset;

              // Make sure we set the proper loop offset *before* dispatching to
              // account for loop after a pause.
              this.setLoopDispatchOffset(this._idleTime, false);
              this.dispatchAllEvents(nextLoopStart);
              nextLoopDispatched = true;
            }

            // This case is when we pass the next "loop point." Events for this
            // point will have already been dispatched. When we reach the point
            // we will need to signal that we're ready to dispatch events for
            // the *subsequent* loop.
            if (this._context.currentTime >= nextLoopStart) {
              // Increment the field keeping track of when the current loop
              // started.
              this._audioContextLoopStart += isThisTheFirstLoop
                ? this._firstLoopDispatchOffset
                : this._loopDispatchOffset;
              nextLoopDispatched = false;
              isThisTheFirstLoop = false;

              this._listeners.fire("afterLoop", this.timecode);
            }
          }

          this._listeners.fire("jsClockTick", this.timecode);
          clockTickRecur();
        }, 200);
      }
    };
    clockTickRecur();
  };

  private setLoopDispatchOffset = (from: number, firstLoop: boolean): void => {
    if (this._loopPoint !== undefined) {
      if (this._loopPoint - from <= 0) {
        throw new Error("Can't set loop dispatch offset to be non-positive");
      }
      this._loopDispatchOffset = this._loopPoint - from;
      if (firstLoop) this._firstLoopDispatchOffset = this._loopDispatchOffset;
    }
  };

  /**
   * Begins the countoff sequence. As long as setCountOff gets called properly
   * by the state adapter, this should play the countOff for its precise
   * duration, and then begin actual playback automatically, without the need to
   * call play() from the adapter.
   */
  countOff = (): void => {
    // This is a pre-timed sequence. We know exactly how long the count off
    // lasts, so we dispatch the count off and then the schedulder after that
    // duration
    this._countOffMetronomeScheduler.dispatch(this._context.currentTime, 0);
    this.play(this._countOffMetronomeScheduler.getCountOff().duration);
  };

  /**
   * Seeks the scheduler. This can happen whether the scheduler is playing or
   * not. This will stop all events, seek the metronome scheduler, set the new
   * idle time, and then play.
   */
  seek = async (time: number, loopPoint: number | undefined): Promise<void> => {
    this._loopPoint = loopPoint;

    if (loopPoint !== undefined && loopPoint <= time)
      throw new Error("Cannot seek with loop point before time");

    const playing = this._isPlaying;
    if (playing) {
      const currentTime = this.timecode;
      if (
        currentTime >= time &&
        (loopPoint === undefined || currentTime < loopPoint)
      ) {
        this.pause();
      } else {
        this.stop();
      }
    }
    this._idleTime = time;
    this.setLoopDispatchOffset(this._idleTime, !playing);

    this._listeners.fire("seek", time);
    if (playing) await this.play();
  };

  pause = (): void => {
    this._pausedTime = this.timecode;
    this._isPlaying = false;
    clearTimeout(this._jsClockTimeout);
    this.cancelDispatch();
    this._audioContextPlayStart = this._audioContextLoopStart = 0;

    this._listeners.fire("pause", this._pausedTime);
  };

  /**
   * Stops all events from playing.
   */
  stop = (): void => {
    const timecode = this.timecode;
    this._isPlaying = false;

    this._pausedTime = undefined;
    clearTimeout(this._jsClockTimeout);
    this.cancelDispatch();
    this._audioContextLoopStart = this._audioContextPlayStart = 0;
    this._firstLoopDispatchOffset = this._loopDispatchOffset = 0;

    this._listeners.fire("stop", timecode);
  };

  /**
   * Stops all started audio nodes.
   */
  private cancelDispatch = (): void => {
    Object.keys(this._dispatchedAudioNodes).forEach(nodeKey => {
      this.cancelEventDispatch(nodeKey);
    });
  };

  private cancelEventDispatch = (eventId: string): void => {
    if (this._dispatchedAudioNodes[eventId]) {
      this._dispatchedAudioNodes[eventId].forEach(node => {
        node.disconnect();
        node.stop(0);
      });
      delete this._dispatchedAudioNodes[eventId];
    }
  };

  /**
   * For an event, pushes a dispatched audio node to the map containing them.
   */
  private pushAudioNodeForEvent = (
    eventId: string,
    node: AudioScheduledSourceNode
  ): void => {
    if (this._dispatchedAudioNodes[eventId]) {
      this._dispatchedAudioNodes[eventId].push(node);
    } else {
      this._dispatchedAudioNodes[eventId] = [node];
    }
  };

  /**
   * Adds an event to the scheduler. If the scheduler is already playing, plays
   * that event.
   */
  addEvent = (event: SchedulerEvent): void => {
    if (this._events[event.id]) this.removeEvent(event.id);
    this._events[event.id] = event;
    if (this._isPlaying) {
      this.playEvent({
        eventId: event.id
      });
    }
  };

  /**
   * Updates properties on a scheduled event. To do this we stop that event's
   * audio node and then restart it after updating the event.
   */
  updateEvent = (
    eventId: string,
    {
      start,
      duration,
      offset
    }: { start?: number; duration?: number; offset?: number }
  ): void => {
    if (_.isEmpty({ start, duration })) return;

    start !== undefined && (this._events[eventId].start = start);
    duration !== undefined && (this._events[eventId].duration = duration);
    offset !== undefined && (this._events[eventId].offset = offset);

    this.cancelEventDispatch(eventId);

    if (this._isPlaying) {
      this.playEvent({
        eventId
      });
    }
  };

  /**
   * Stops and removes an event.
   */
  removeEvent = (id: string, stopNode = true): void => {
    if (stopNode) {
      this.cancelEventDispatch(id);
    }
    delete this._events[id];
  };

  /**
   * Useful for testing.
   */
  clearEvents = (): void => {
    this._events = {};
  };

  /**
   * Updates the stored countOff configuration used to count off.
   */
  setCountOff = (countOff: CountOff): void => {
    this._countOffMetronomeScheduler.setCountOff(countOff);
  };

  get listeners(): SchedulerListeners {
    return this._listeners;
  }

  get events(): { [id: string]: SchedulerEvent } {
    return this._events;
  }

  get playing(): boolean {
    return this._isPlaying;
  }

  get paused(): boolean {
    return !this.playing && this._pausedTime !== undefined;
  }

  get loops(): boolean {
    return this._loopPoint !== undefined;
  }

  get loopPoint(): number | undefined {
    return this._loopPoint;
  }

  get idleTime(): number {
    return this._idleTime;
  }

  get timecode(): number {
    if (this.playing) {
      const playStartTime = this._pausedTime ?? this._idleTime;
      const totalTimeElapsed =
        this._context.currentTime - this._audioContextPlayStart;

      // Equivalent to "we're getting the timecode before the scheduler has
      // reached its first loop point."
      if (!this.loops || totalTimeElapsed < this._firstLoopDispatchOffset) {
        return playStartTime + totalTimeElapsed;
      }
      // After a loop has occured, we do modulus arithmetic to figure out the
      // timecode relative to the idle time.
      else {
        return (
          this._idleTime +
          ((totalTimeElapsed - this._firstLoopDispatchOffset) %
            this._loopDispatchOffset)
        );
      }
    } else if (this.paused) {
      return this._pausedTime;
    } else {
      return this._idleTime;
    }
  }

  /**
   * Should only be used for testing purposes.
   */
  accessPrivateFields(): {
    _isPlaying: Scheduler["_isPlaying"];
    _events: Scheduler["_events"];
    _context: Scheduler["_context"];
    _idleTime: Scheduler["_idleTime"];
    _loopPoint: Scheduler["_loopPoint"];
    _loopDispatchOffset: Scheduler["_loopDispatchOffset"];
    _firstLoopDispatchOffset: Scheduler["_firstLoopDispatchOffset"];
    _dispatchedAudioNodes: Scheduler["_dispatchedAudioNodes"];
    _countOffMetronomeScheduler: Scheduler["_countOffMetronomeScheduler"];
    _audioContextPlayStart: Scheduler["_audioContextPlayStart"];
    _audioContextLoopStart: Scheduler["_audioContextLoopStart"];
    _pausedTime: Scheduler["_pausedTime"];
  } {
    return {
      _isPlaying: this._isPlaying,
      _events: this._events,
      _context: this._context,
      _idleTime: this._idleTime,
      _loopPoint: this._loopPoint,
      _loopDispatchOffset: this._loopDispatchOffset,
      _firstLoopDispatchOffset: this._firstLoopDispatchOffset,
      _dispatchedAudioNodes: this._dispatchedAudioNodes,
      _countOffMetronomeScheduler: this._countOffMetronomeScheduler,
      _audioContextPlayStart: this._audioContextPlayStart,
      _audioContextLoopStart: this._audioContextLoopStart,
      _pausedTime: this._pausedTime
    };
  }
}

const SchedulerInstance = new Scheduler();

export { SchedulerEvent, SchedulerInstance };
