/**
 * Wrapper class for the user's audio stream, exported as a module so the same
 * instance is accessible to different places in the code
 */
class VampAudioStream {
  private _stream: MediaStream;

  /**
   * True if the user has granted microphone permission and the stream has
   * successfully loaded.
   */
  private _active: boolean;

  // TODO: would effects get attached here
  constructor() {
    this._stream = null;
    this._active = false;

    window.navigator.mediaDevices
      .getUserMedia({ audio: true, video: false })
      .then(stream => {
        this._stream = stream;
        this._active = true;
      });
  }

  /**
   * Returns whether permission has been granted. getAudioStream will return
   * undefined until this is true.
   */
  active = (): boolean => this._active;

  getAudioStream = async (): Promise<MediaStream> =>
    new Promise<MediaStream>((resolve, reject) => {
      if (this._stream) {
        resolve(this._stream);
      } else {
        setTimeout(async () => {
          resolve(await this.getAudioStream());
        }, 500);
      }
    });
}

// eslint-disable-next-line prefer-const
export let vampAudioStream = new VampAudioStream();
