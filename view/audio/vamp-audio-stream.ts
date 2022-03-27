/**
 * Wrapper class for the user's audio stream, exported as a module so the same
 * instance is accessible to different places in the code, note well that stream is
 * a promise
 */
class VampAudioStream {
  private _stream: Promise<MediaStream>;

  constructor() {
    Promise.all([this.setUpMedia()]);
  }

  private setUpMedia = (): Promise<boolean> => {
    this._stream = window.navigator.mediaDevices.getUserMedia({
      audio: {
        sampleRate: 48000
      },
      video: false
    });
    return Promise.resolve(true);
  };

  sendAlert = (): void => {
    alert("Couldn't get user media :(");
  };

  getAudioStream = (): Promise<MediaStream> => this._stream;
}

// eslint-disable-next-line prefer-const
export let vampAudioStream = new VampAudioStream();
