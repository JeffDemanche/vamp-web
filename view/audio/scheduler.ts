import { Heap } from "typescript-collections";
import { ICompareFunction } from "typescript-collections/dist/lib/util";

interface WorkspaceEvent {
  start: number;

  dispatch: (context: AudioContext) => Promise<void>;
}

/** Used for heap to prioritize upcoming events. */
const WorkspaceEventComparison: ICompareFunction<WorkspaceEvent> = (
  a: WorkspaceEvent,
  b: WorkspaceEvent
): number => {
  if (a.start === b.start) return 0;
  else if (a.start < b.start) return -1;
  else return 1;
};

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

  private _events: Heap<WorkspaceEvent>;

  constructor(context: AudioContext) {
    this._context = context;
    this._isPlaying = false;
    this._seconds = 0;

    this._loopTimeout = 1;
    this._events = new Heap(WorkspaceEventComparison);
  }

  play(): void {
    this._isPlaying = true;
    this.loop();
  }

  stop(): void {
    this._isPlaying = false;
  }

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
          this._seconds = 0.001 * elapsedUnix + loopBeginWorkspace;

          // Do all scheduled audio tasks.
          while (
            this._events.peek() &&
            this._events.peek().start < this._seconds
          ) {
            this._events.removeRoot().dispatch(this._context);
          }

          runTimeout();
        }, this._loopTimeout);
      }
    };
    runTimeout();
  }
}

export { Scheduler };
