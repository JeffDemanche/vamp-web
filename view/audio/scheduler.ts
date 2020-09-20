interface WorkspaceEvent {
  id: string;
  start: number;

  /**
   * Called by scheduler when this event starts playing. All events that use Web
   * Audio API nodes should return the node, or else they won't stop playing.
   *
   * @param context An AudioContext, in case it's not present in the dispatching
   * module.
   * @param offset Number of seconds into the event to start playing at.
   */
  dispatch: (
    context: AudioContext,
    offset?: number
  ) => Promise<void | AudioScheduledSourceNode>;

  /**
   * Repeat the event every this many seconds.
   */
  repeat?: number;

  /**
   * True if this is a clip audio event, false or undefined if not.
   */
  clip?: boolean;

  // TODO do this instead of hasStarted
  playImmediately?: boolean;

  /**
   * A flag field used by the loop() function to help with dispatching events
   * when play begins in the middle of such events.
   */
  hasStarted?: boolean;
}

/**
 * Handles audio timing, accumulates events that need to take place at some
 * point in the workspace timeline.
 *
 * Important to note that this is NOT a component, meaning fields within here
 * need to be manually updated with the state (usually this updating occurs in
 * WorkspaceAudio).
 */
class Scheduler {
  private _context: AudioContext;
  private _isPlaying: boolean;
  private _seconds: number;

  /**
   * A value that needs to be updated from WorkspaceAudio, the place where the
   * playhead should be in an idle state (i.e. might be the position of the
   * cab). Basically, when we press stop, where does the Vamp seek to?
   */
  private _idleTime: number;

  /**
   * If an event's dispatch function returns an AudioScheduledSourceNode, that
   * node is added to this list, and is removed when play is stopped. So this is
   * more or less a list of all currently-playing source nodes. It gives us the
   * ability to stop the nodes from playing on command.
   */
  private _dispatchedAudioNodes: { [id: string]: AudioScheduledSourceNode };

  private _loopTimeout: NodeJS.Timeout;

  /**
   * The number of milliseconds passed to the setTimeout function which
   * regulates looping.
   */
  private _loopDuration: number;

  private _events: { [id: string]: WorkspaceEvent };

  constructor(context: AudioContext) {
    this._context = context;
    this._isPlaying = false;
    this._seconds = 0;

    this._loopTimeout = null;
    this._loopDuration = 1;
    this._events = {};

    this._dispatchedAudioNodes = {};
  }

  /**
   * Plays audio beginning at the scheduler _seconds field.
   */
  play = async (): Promise<void> => {
    this._isPlaying = true;
    this.loop();
  };

  setTime = (time: number): void => {
    this._seconds = time;
  };

  /**
   * Sets the time in seconds that the scheduler will return to after being
   * stopped.
   */
  setIdleTime = (idleTime: number): void => {
    this._idleTime = idleTime;
  };

  /**
   * Seek the scheduler to a time in seconds while playing.
   */
  seek = async (time: number): Promise<void> => {
    await this.stop();
    await this.cancelDispatch();
    clearTimeout(this._loopTimeout);
    this._seconds = time;
    this.play();
  };

  /**
   * Stops looping and stops all dispatched nodes from playing audio.
   */
  stop = async (): Promise<void> => {
    this._isPlaying = false;
  };

  /**
   * Stops all started audio nodes.
   */
  private cancelDispatch = async (): Promise<void> => {
    Object.keys(this._dispatchedAudioNodes).forEach(nodeKey => {
      this._dispatchedAudioNodes[nodeKey].disconnect();
      this._dispatchedAudioNodes[nodeKey].stop(0);
    });
    this._dispatchedAudioNodes = {};
  };

  /**
   * Called from loop(). Resets the scheduler _seconds field to the idle time.
   */
  private postStop = (): void => {
    this._seconds = this._idleTime;
    this.cancelDispatch();
  };

  time = (): number => this._seconds;

  addEvent = (event: WorkspaceEvent): void => {
    if (this._events[event.id]) this.removeEvent(event.id);
    this._events[event.id] = event;
  };

  removeEvent = (id: string, stopNode = true): void => {
    if (stopNode && this._dispatchedAudioNodes[id]) {
      this._dispatchedAudioNodes[id].disconnect();
      this._dispatchedAudioNodes[id].stop(0);
      delete this._dispatchedAudioNodes[id];
    }
    delete this._events[id];
  };

  removeAllClipEvents = (): void => {
    Object.keys(this._events).forEach(id => {
      if (this._events[id].clip) {
        this.removeEvent(id);
      }
    });
  };

  /**
   * This is a shot in the dark for now. Runs an asynchronous timer with a given
   * granularity and dispatches audio events from there. Some things that
   * immediately pop out to take note of:
   *
   * - The actual amount of time between loops will be greater than the timeout
   *   millisecond delay, because the loop takes some time to run.
   * - This will introduce a small amount of error into when audio events are
   *   actually dispatched. That error is bounded by how long the loop takes,
   *   and can be reduced by adjusting the granularity.
   */
  private async loop(): Promise<void> {
    const loopBeginWorkspace: number = this._seconds;
    const loopBeginUnix: number = Date.now();

    for (const eventId in this._events) {
      this._events[eventId].hasStarted = false;
    }

    let firstTick = true;

    const runTimeout = (): void => {
      if (this._isPlaying) {
        this._loopTimeout = global.setTimeout(async () => {
          const elapsedUnix = Date.now() - loopBeginUnix;
          // Time marker at beginning of tick.
          const preTime = this._seconds;
          this._seconds = 0.001 * elapsedUnix + loopBeginWorkspace;

          // Do all scheduled audio tasks.
          for (const eventId in this._events) {
            const repeat = this._events[eventId].repeat;
            const start = this._events[eventId].start;
            const dispatch = this._events[eventId].dispatch;
            const hasStarted = this._events[eventId].hasStarted;

            // Might just be the metronome that requires this functionality.
            if (repeat) {
              // Play repeating events if this is negative.
              let timeDiff =
                ((this._seconds + start) % repeat) -
                ((preTime + start) % repeat);

              // Modulo breaks down on the loop tick when we pass the 0-second
              // mark. This fixes that case.
              if (this._seconds > 0 && preTime < 0) {
                timeDiff =
                  ((this._seconds + start) % repeat) -
                  ((preTime + start + repeat) % repeat);
              }

              // True if this tick began exactly on a repeating event repeat.
              const startingOnEvent = (preTime + start) % repeat == 0;

              // Generally, we'll dispatch the event if it starts between the
              // tick preTime and the current time (i.e. when timeDiff < 0).
              // However if there's an event that's dispatched on the first tick
              // we need to handle that as a separate case.
              if (timeDiff < 0 || (firstTick && startingOnEvent)) {
                dispatch(this._context).then(sourceNode => {
                  if (sourceNode)
                    this._dispatchedAudioNodes[eventId] = sourceNode;
                });
              }
            } else {
              // Distance between the beginning of this tick and when this event
              // is scheduled. If negative then the event begins some time after
              // this tick. If positive, the clip is either already playing or
              // was just added, in which case we should play it with the
              // correct offset.
              const beforeStart = preTime - start;

              // True if the clip starts after the previous tick, or if it
              // starts before but was just added.
              const preStart = beforeStart <= 0 || !hasStarted;

              if (preStart && start < this._seconds) {
                const sourceNode = await dispatch(this._context, beforeStart);
                if (sourceNode)
                  this._dispatchedAudioNodes[eventId] = sourceNode;
                this._events[eventId].hasStarted = true;
              }
            }
          }

          firstTick = false;

          runTimeout();
        }, this._loopDuration);
      } else {
        this.postStop();
      }
    };
    runTimeout();
  }
}

export { WorkspaceEvent, Scheduler };
