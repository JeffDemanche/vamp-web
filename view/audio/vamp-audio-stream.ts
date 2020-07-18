/*
    Wrapper class for the user's audio stream, exported as 
    a module so the same instance is accessible to different places
    in the code
*/

class VampAudioStream {
  private _stream: Promise<MediaStream>;

  // TODO: would effects get attached here
  constructor() {
    this._stream = navigator.mediaDevices
      .getUserMedia({ audio: true, video: false })
      .then(stream => stream);
  }

  getAudioStream = (): Promise<MediaStream> => this._stream;
}

// eslint-disable-next-line prefer-const
export let vampAudioStream = new VampAudioStream();
