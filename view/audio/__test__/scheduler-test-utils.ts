import { DeLorean } from "vehicles";

/**
 * Testing util to advance any JS timers and the mock AudioContext's
 * currentTime value by a given amount of seconds, a given amount of times.
 * The total amount of time traveled will be `seconds * times`.
 */
export const advanceTimers = async (
  audioContextDelorean: DeLorean,
  seconds: number,
  times: number
): Promise<void> => {
  for (let i = 0; i < times; i++) {
    await audioContextDelorean.travel(seconds);
    jest.advanceTimersByTime(seconds * 1000);
  }
};
