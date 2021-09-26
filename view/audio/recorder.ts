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
  private _context: AudioContext;
  private _source: MediaStreamAudioSourceNode;
  private _recording: boolean;
  private _mediaRecorder: MediaRecorder;
  private _mediaRecorderOptions: MediaRecorderOptions = {
    audioBitsPerSecond: 128000,
    mimeType: "audio/webm"
  };
  private _currentAudioStoreKey: string;

  constructor(context: AudioContext) {
    this._context = context;
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
      audioStore.appendBlob(this._currentAudioStoreKey, e.data);
    }
  };

  isRecording = (): boolean => this._recording;

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
  startRecording = (audioStoreKey: string): void => {
    if (this._recording) throw new Error("Recorder already recording.");
    // This'll happen if we start recording before the last recording finished
    // appending to the audio store.
    else if (this._currentAudioStoreKey)
      throw new Error("Last recording wasn't completed.");

    this._recording = true;
    this._currentAudioStoreKey = audioStoreKey;

    this.mediaRecorderInitialized && this._mediaRecorder.start(500);
  };

  /**
   * Stop recording from the MediaRecorder object. The calling function should
   * check mediaRecorderInitialized() beforehand.
   *
   * @param after Waits this many milliseconds after the function is called to
   * actually stop recording. This is useful for recording buffer space after a
   * recording.
   *
   * @returns A promise of Blob data. You can access it using a .then() callback
   * or in an async function as `const blob = await stopRecording();`
   */
  stopRecording = async (after: number): Promise<Blob> => {
    await new Promise(resolve => {
      setTimeout(() => {
        resolve(true);
      }, after);
    });

    this.mediaRecorderInitialized && this._mediaRecorder.stop();
    this._recording = false;
    const storeKey = this._currentAudioStoreKey;
    return new Promise(resolve => {
      const interval = setInterval(() => {
        clearInterval(interval);

        resolve(audioStore.getStoredAudio(storeKey).data);
        this._currentAudioStoreKey = undefined;
      }, 10);
    });
  };
}

export default Recorder;
