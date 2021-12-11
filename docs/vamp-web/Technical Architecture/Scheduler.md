# Scheduler module
The scheduler is a module that's used to interface between our front end and the [[Web Audio API]].

## Behavior overview
A [[Scheduler]] tracks [[Events]] and exposes functions that allow intuitive playback controls to the front end as an abstraction layer over the low-level [[Web Audio API]] functions.

## Exposed functionality
The following are accessible publicly from the `Scheduler` class:

- `seek` handles setting the `idleTime` of the Scheduler and setting loop control. It can be called whether or not the Scheduler is playing.
- `play` begins playback of all events. If the Scheduler is not paused, this will occur from the `idleTime`, which is set using `seek`. If it *is* paused, this will occur from the time the Scheduler was paused. This function can be delayed to begin playback after a precise amount of time.
- `pause` pauses the scheduler at a time which is not the `idleTime`. Playing after calling `pause` will begin playback from the paused time, but if the Scheduler is set to loop, looping will return to `idleTime`. `stop` can be called after pausing to unset the paused time, so that `idleTime` will be used.
- `stop` stops playback, stops any running events, and unsets pause. Returns the "playhead" to `idleTime`.
- `addEvent` registers an [[Events|Event]] to be played by the Scheduler. Can be called whether or not the Scheduler is playing.
- `updateEvent` updates [[Events|Event]] data such as start time and duration without removing it. Can be called whether or not the Scheduler is playing.
- `removeEvent` removes an [[Events|Event]] by ID.
- `clearEvents` should only be used for testing.
- `setCountOff` passes through a [[Count Off]] object to a subclass that handles playing a metronome before playback begins. Liabled to be [[Refactor|refactored]] to make the Scheduler more general-purpose.
- `giveContext` is called from the UI to provide the `AudioContext` to the Scheduler.
- `primeRecorder`