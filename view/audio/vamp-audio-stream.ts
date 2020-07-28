/*
    Wrapper class for the user's audio stream, exported as 
    a module so the same instance is accessible to different places
    in the code
*/

class VampAudioStream {
  private _stream: MediaStream;

  // TODO: would effects get attached here
  constructor() {
    navigator.mediaDevices
      .getUserMedia({ audio: true, video: false })
      .then(stream => (this._stream = stream));
  }

  getAudioStream = (): MediaStream => this._stream;
}

// eslint-disable-next-line prefer-const
export let vampAudioStream = new VampAudioStream();
