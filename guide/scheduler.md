# Scheduler

## Codepath

`view/audio/static-scheduler.ts`

## Implementation

## Static scheduler

I'm calling it "static" as opposed to the first attempt at writing the
scheduler, which was to have a loop function that immediately dispatched audio
events (clips, metronome, etc.) when they were scheduled to start.

The idea of the static scheduler is that audio events are scheduled through the
Web Audio API with offsets. So when we press play, all of the events in the
scheduler are dispatched immediately, but are provided offset values to
determine when they actually start playing.

## Metronome scheduler
