# Waveform Package

This is where waveforms are generated. We would like to keep this modular.

`waveform.tsx`: A class that handles generating waveform SVGs from an
`AudioBuffer` object. There is a one-to-one between drawn waveforms and
instances of this class.

`adaptive-waveform.ts`: A level of abstraction on top of a waveform. An audio
file can be linked to an `AdaptiveWaveform`, which can manage multiple
`Waveforms` with level-of-detail control.

`waveform-hooks.ts`: Hooks into the React application to actually use the
waveforms. Currently sort of breaks modularity by accessing the audio store
module.
