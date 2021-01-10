class VampAudioContext {
  getAudioContext = (): AudioContext => null;
}

// eslint-disable-next-line prefer-const
export let vampAudioContext = new VampAudioContext();
