/**
 * Recording-related code.
 *
 *
 * See some info about recording audio here:
 * https://developers.google.com/web/fundamentals/media/recording-audio
 */
import { vampAudioStream } from "./vamp-audio-stream";
import { audioStore } from "../audio/audio-store";

class Recorder {
  private _source: MediaStreamAudioSourceNode;
  private _recording: boolean;
  private _mediaRecorder: MediaRecorder;
  private _mediaRecorderOptions: MediaRecorderOptions = {
    audioBitsPerSecond: 128000,
    mimeType: "audio/webm"
  };
  private _currentReferenceId: string;

  constructor(context: AudioContext) {
    const gotMedia = (stream: MediaStream): void => {
      this._source = context.createMediaStreamSource(stream);
      this._mediaRecorder = new MediaRecorder(
        stream,
        this._mediaRecorderOptions
      );
      this._mediaRecorder.ondataavailable = this.handleData;
    };

    vampAudioStream.getAudioStream().then(stream => gotMedia(stream));
  }

  /**
   * This is called when _mediaRecorder.stop() is called, or when the audio
   * stream stops giving data (for instance if the user microphone is
   * disconnected).
   */
  private handleData = (e: BlobEvent): void => {
    if (e.data.size > 0) {
      audioStore.appendBlob(this._currentReferenceId, e.data);
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
  startRecording = (referenceId: string): void => {
    this._recording = true;
    this._currentReferenceId = referenceId;
    this.mediaRecorderInitialized && this._mediaRecorder.start();

    const bufferTimeout = (): void => {
      setTimeout(() => {
        if (this._recording) {
          this._mediaRecorder.requestData();
          bufferTimeout();
        }
      }, 100);
    };
    bufferTimeout();
  };

  /**
   * Stop recording from the MediaRecorder object. The calling function should
   * check mediaRecorderInitialized() beforehand.
   *
   * @returns A promise of Blob data. You can access it using a .then() callback
   * or in an async function as `const blob = await stopRecording();`
   */
  stopRecording = async (): Promise<Blob> => {
    this.mediaRecorderInitialized && this._mediaRecorder.stop();
    this._recording = false;
    const refId = this._currentReferenceId;
    this._currentReferenceId = undefined;
    return new Promise(resolve => {
      const interval = setInterval(() => {
        clearInterval(interval);

        resolve(audioStore.getStoredAudio(refId).data);
      }, 10);
    });
  };
}

export default Recorder;
