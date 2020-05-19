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

  /**
   * This is called when _mediaRecorder.stop() is called, or when the audio
   * stream stops giving data (for instance if the user microphone is
   * disconnected).
   */
  private handleData = (e: BlobEvent): void => {
    if (e.data.size > 0) {
      console.log(e);
    }
  };

  /**
   * Start recording from the MediaRecorder object, which will only work if we
   * have access to the user's microphone. If that's not the case, return false.
   */
  startRecording = (): boolean => {
    if (this._mediaRecorder) {
      this._mediaRecorder.start();
      return true;
    }
    return false;
  };

  stopRecording = (): boolean => {
    if (this._mediaRecorder) {
      this._mediaRecorder.stop();
      return true;
    }
    return false;
  };
}

export default Recorder;
