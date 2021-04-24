class VampAudioStream {
  getAudioStream(): Promise<MediaStream> {
    return new Promise(() => {});
  }
}

// eslint-disable-next-line prefer-const
export let vampAudioStream = new VampAudioStream();
