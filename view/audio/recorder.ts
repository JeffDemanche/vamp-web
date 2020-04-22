/**
 * Recording-related code.
 *
 *
 * See some info about recording audio here:
 * https://developers.google.com/web/fundamentals/media/recording-audio
 */

class Recorder {
  private _source: MediaStreamAudioSourceNode;
  private _mediaRecorder: MediaRecorder;
  private _mediaRecorderOptions: MediaRecorderOptions = {
    audioBitsPerSecond: 128000
  };

  constructor(context: AudioContext) {
    const gotMedia = (stream: MediaStream): void => {
      this._source = context.createMediaStreamSource(stream);
      this._mediaRecorder = new MediaRecorder(
        stream,
        this._mediaRecorderOptions
      );
      this._mediaRecorder.ondataavailable = this.handleData;
    };

    navigator.mediaDevices
      .getUserMedia({
        audio: true,
        video: false /* For now?? */
      })
      .then(gotMedia);
  }

  private handleData = (e: BlobEvent): void => {
    if (e.data.size > 0) {
      console.log(e);
    }
  };

  startRecording = (): void => {
    this._mediaRecorder.start();
  };

  stopRecording = (): void => {
    this._mediaRecorder.stop();
  };
}

export default Recorder;
