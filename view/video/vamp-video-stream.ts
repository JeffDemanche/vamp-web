/*
    Wrapper class for the user's video stream, exported as 
    a module so the same instance is accessible to different places
    in the code
*/

class VampVideoStream {
  private _stream: MediaStream;

  private _videoConstraints = {
    height: window.innerHeight / 8,
    width: window.innerWidth / 8
  };

  constructor() {
    window.navigator.mediaDevices
      .getUserMedia({
        video: this._videoConstraints,
        audio: false
      })
      .then(stream => (this._stream = stream));
  }

  getVideoStream = (): MediaStream => this._stream;
}

// eslint-disable-next-line prefer-const
export let vampVideoStream = new VampVideoStream();
