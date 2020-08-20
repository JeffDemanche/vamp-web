/**
 * Wrapper class for the user's audio stream, exported as a module so the same
 * instance is accessible to different places in the code, note well that stream is
 * a promise
 */
class VampAudioStream {
  private _stream: Promise<MediaStream>;

  // TODO: would effects get attached here
  constructor() {
    this.setupMedia();
  }

  setupMedia = (): void => {
    this._stream = navigator.mediaDevices.getUserMedia({
      audio: {
        sampleRate: 48000
      },
      video: false
    });
  };

  getAudioStream = (): Promise<MediaStream> => this._stream;
}

// eslint-disable-next-line prefer-const
export let vampAudioStream = new VampAudioStream();
