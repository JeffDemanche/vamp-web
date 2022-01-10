# Adapters

This directory has a bunch of React files called adapters. These components are
included in the `WorkspaceAudio` wrapper component. Their purpose is to listen
for changes to state in the Apollo cache on in React contexts and perform state
logic and/or update non-React modules to reflect those changes. Every adapter
should return `null`.

`ContentAudioSchedulerAdapter` - interfaces to `Scheduler`, adding scheduler
events when audio content in clips is mutated.

`CountOffAdapter` - interfaces to `Scheduler`, setting count off information.

`EmptyVampAdapter` - interfaces back to Apollo state, setting certain fields
when the Vamp becomes "empty."

`PlayStopAdapter` - interfaces to `Scheduler`, playing or stopping based on the
state of `PlaybackContext`.

`SeekAdapter` - interfaces to `Scheduler`, seeking based on the state of
`PlaybackContext`.
