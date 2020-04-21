import { Heap } from "typescript-collections";
import { ICompareFunction } from "typescript-collections/dist/lib/util";

interface WorkspaceEvent {
  id: string;
  start: number;
  dispatch: (context: AudioContext, scheduler: Scheduler) => Promise<void>;
  repeat?: number;
}

/**
 * Handles timing, accumulates events that need to take place at some point in
 * the workspace timeline.
 */
class Scheduler {
  private _context: AudioContext;
  private _isPlaying: boolean;
  private _seconds: number;

  /**
   * The number of milliseconds passed to the setTimeout function which
   * regulates looping.
   */
  private _loopTimeout: number;

  private _events: { [id: string]: WorkspaceEvent };

  constructor(context: AudioContext) {
    this._context = context;
    this._isPlaying = false;
    this._seconds = 0;

    this._loopTimeout = 1;
    this._events = {};
  }

  play = async (): Promise<void> => {
    this._isPlaying = true;
    this.loop();
  };

  stop = async (): Promise<void> => {
    this._isPlaying = false;
  };

  private postStop = (): void => {
    this._seconds = 0;
  };

  time = (): number => this._seconds;

  addEvent = (event: WorkspaceEvent): void => {
    this._events[event.id] = event;
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

    const runTimeout = (): void => {
      if (this._isPlaying) {
        setTimeout(() => {
          const elapsedUnix = Date.now() - loopBeginUnix;
          const preTime = this._seconds;
          this._seconds = 0.001 * elapsedUnix + loopBeginWorkspace;

          // Do all scheduled audio tasks.

          for (const eventId in this._events) {
            const repeat = this._events[eventId].repeat;
            const start = this._events[eventId].start;
            const dispatch = this._events[eventId].dispatch;

            if (repeat) {
              // Play repeating events if this is negative.
              const timeDiff = (this._seconds % repeat) - (preTime % repeat);
              if (start == preTime || timeDiff < 0) {
                dispatch(this._context, this);
              }
            } else {
              if (start > preTime && start <= this._seconds) {
                dispatch(this._context, this);
              }
            }
          }

          runTimeout();
        }, this._loopTimeout);
      } else {
        this.postStop();
      }
    };
    runTimeout();
  }
}

export { WorkspaceEvent, Scheduler };
