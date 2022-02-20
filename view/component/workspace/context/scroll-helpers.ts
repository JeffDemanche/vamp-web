import React from "react";

const PIXEL_STEP = 10;
const LINE_HEIGHT = 40;
const PAGE_HEIGHT = 800;

/**
 * This comes from
 * https://github.com/facebookarchive/fixed-data-table/blob/master/src/vendor_upstream/dom/normalizeWheel.js
 */
export const normalizeWheel = (
  event: React.WheelEvent
): { spinX: number; spinY: number; pixelX: number; pixelY: number } => {
  let sX = 0,
    sY = 0, // spinX, spinY
    pX = 0,
    pY = 0; // pixelX, pixelY

  pX = sX * PIXEL_STEP;
  pY = sY * PIXEL_STEP;

  if ("deltaY" in event) {
    pY = event.deltaY;
  }
  if ("deltaX" in event) {
    pX = event.deltaX;
  }

  if ((pX || pY) && event.deltaMode) {
    if (event.deltaMode == 1) {
      // delta in LINE units
      pX *= LINE_HEIGHT;
      pY *= LINE_HEIGHT;
    } else {
      // delta in PAGE units
      pX *= PAGE_HEIGHT;
      pY *= PAGE_HEIGHT;
    }
  }

  // Fall-back if spin cannot be determined
  if (pX && !sX) {
    sX = pX < 1 ? -1 : 1;
  }
  if (pY && !sY) {
    sY = pY < 1 ? -1 : 1;
  }

  return { spinX: sX, spinY: sY, pixelX: pX, pixelY: pY };
};

// From this SO answer
// https://stackoverflow.com/questions/53430486/detect-new-mouse-wheel-event.
export class MouseWheelAggregater {
  private maxAllowedPause: number;
  private last: number;
  private cumulativeDeltaY: number;
  private timer: number;
  private eventFunction: (deltaY: number, event: React.WheelEvent) => void;

  // Pass in the callback function and optionally, the maximum allowed pause
  constructor(
    func: (deltaY: number, event: React.WheelEvent) => void,
    maxPause?: number
  ) {
    this.maxAllowedPause = maxPause ? maxPause : 250; // millis
    this.last = Date.now();
    this.cumulativeDeltaY = 0;
    this.timer;
    this.eventFunction = func;
  }

  onWheel(e: React.WheelEvent): void {
    const elapsed = Date.now() - this.last;
    this.last = Date.now();
    if (this.cumulativeDeltaY === 0 || elapsed < this.maxAllowedPause) {
      // Either a new action, or continuing a previous action with little
      // time since the last movement
      this.cumulativeDeltaY += e.deltaY;
      if (this.timer !== undefined) clearTimeout(this.timer);
      this.timer = setTimeout(() => {
        this.fireAggregateEvent(e);
      }, this.maxAllowedPause);
    } else {
      // just in case some long-running process makes things happen out of
      // order
      this.fireAggregateEvent(e);
    }
  }

  private fireAggregateEvent(e: React.WheelEvent): void {
    // Clean up and pass the delta to the callback
    if (this.timer !== undefined) clearTimeout(this.timer);
    const newDeltaY = this.cumulativeDeltaY;
    this.cumulativeDeltaY = 0;
    this.timer = undefined;
    // Use a local variable during the call, so that class properties can
    // be reset before the call.  In case there's an error.
    this.eventFunction(newDeltaY, e);
  }
}
