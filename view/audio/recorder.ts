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
    audioBitsPerSecond: 128000,
    mimeType: "audio/webm"
  };
  private _latestRecordedData: Blob;

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
      console.log("Got recorded blob.");
      this._latestRecordedData = e.data;
    }
  };

  /**
   * Checks to see if the media recorder is properly initialized. Reasons this
   * might not be true include the user not granting microphone permission, etc.
   */
  mediaRecorderInitialized = (): boolean =>
    this._mediaRecorder ? true : false;

  /**
   * Start recording from the MediaRecorder object. The calling function should
   * check mediaRecorderInitialized() beforehand.
   */
  startRecording = (): void => {
    this.mediaRecorderInitialized && this._mediaRecorder.start();
  };

  /**
   * Stop recording from the MediaRecorder object. The calling function should
   * check mediaRecorderInitialized() beforehand.
   *
   * @returns A promise of Blob data. You can access it using a .then() callback
   * or in an async function as `const blob = await stopRecording();`
   */
  stopRecording = async (): Promise<Blob> => {
    this._latestRecordedData = null;
    this.mediaRecorderInitialized && this._mediaRecorder.stop();
    return new Promise(resolve => {
      const interval = setInterval(() => {
        if (this._latestRecordedData == null) return;
        clearInterval(interval);

        resolve(this._latestRecordedData);
      }, 10);
    });
  };

  /**
   * After stopRecording() is called, the mediaRecorder fires a BlobEvent. This
   * function returns the last blob data to be recieved.
   */
  getLatestRecordedData = (): Blob => this._latestRecordedData;
}

export default Recorder;
