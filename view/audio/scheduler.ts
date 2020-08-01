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
    this.stop();
    clearTimeout(this._loopTimeout);
    this._seconds = time;
    this.play();
  };

  /**
   * Stops looping and stops all dispatched nodes from playing audio.
   */
  stop = async (): Promise<void> => {
    this._isPlaying = false;
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
  };

  time = (): number => this._seconds;

  addEvent = (event: WorkspaceEvent): void => {
    this._events[event.id] = event;
  };

  removeEvent = (id: string, stopNode = true): void => {
    if (stopNode) {
      this._dispatchedAudioNodes[id].disconnect();
      this._dispatchedAudioNodes[id].stop(0);
      delete this._dispatchedAudioNodes[id];
    }
    delete this._events[id];
  };

  removeAllClipEvents = (): void => {
    const newEvents: { [id: string]: WorkspaceEvent } = {};
    Object.keys(this._events).forEach(id => {
      if (!this._events[id].clip) {
        newEvents[id] = this._events[id];
      }
    });
    this._events = newEvents;
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

    console.log(this._seconds, this._events);
    for (const eventId in this._events) {
      this._events[eventId].hasStarted = false;
    }

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
              const timeDiff = (this._seconds % repeat) - (preTime % repeat);

              // (The event or it's repetitions begin right at the tick) OR
              // (we've passed the time where we should repeat the event).
              if (start == preTime % repeat || timeDiff < 0) {
                dispatch(this._context).then(sourceNode => {
                  if (sourceNode)
                    this._dispatchedAudioNodes[eventId] = sourceNode;
                });
              }
            } else {
              // Distance between the beginngin of this tick and when this event
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
