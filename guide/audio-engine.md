# Vamp Audio Engine

The Vamp Audio Engine is all the code related to *playing audio*. Things like
the play button, timecode, or anything visual are out of scope.

## Codepath

`view/audio/*`

## Overall philosophy

The state of a Vamp is held in the Apollo cache. This includes (probably) all
the things we care about for controlling the playing of audio: whether we're
playing, the list of clips, the metronome data, etc. All that data is in the
cache. So in order to control audio playback, we need to listen for changes to
this cache data. The easiest way to do this in Apollo is through *React
components*. If we make a query to Apollo in a React component and then the data
in that query changes, the component will re-render, and we reflect whatever
changed in functionality.

Normally, changes to the cache like this change how components are drawn on the
DOM. In terms of audio though, we don't need to draw anything, we just need to
use the state changes to inform what audio is playing. This is where
`vamp-audio.tsx` comes in. It's a really big React component that doesn't render
anything, but listens for changes and serves as an interface between the Apollo
state and non-React modules that actually do the playing.

Examples of React components that serve as "interfaces" to the Apollo state:

- `vamp-audio.tsx` is the big daddy.
- `clip-player.tsx` listens for changes to clips in state and creates audio events in the scheduler.
- `metronome.tsx` manages the metronome audio event.
- `looper.tsx` determines when we should seek/loop.

## Non-component modules

Some files aren't React components and actually handle audio playback. 

- `audio-store.ts` handles storing and retrieving blobs of audio for playback.
- `scheduler.ts` stores "audio events" and handles dispatching those events at the correct time after playback has begun.
- `recorder.ts` records media and puts it in the audio store.