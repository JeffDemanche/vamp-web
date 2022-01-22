/**
 * Recording-related code.
 *
 *
 * See some info about recording audio here:
 * https://developers.google.com/web/fundamentals/media/recording-audio
 */
import { vampAudioStream } from "./vamp-audio-stream";
import { audioStore } from "../audio/audio-store";
import { Scheduler } from "./scheduler";
import ObjectID from "bson-objectid";
import { RecorderProgram } from "./hooks/use-handle-new-audio-recording";

class Recorder {
  private _context: AudioContext;
  private _scheduler: Scheduler;
  private _source: MediaStreamAudioSourceNode;
  private _recording: boolean;
  private _mediaRecorder: MediaRecorder;
  private _mediaRecorderOptions: MediaRecorderOptions = {
    audioBitsPerSecond: 128000,
    mimeType: "audio/webm"
  };
  private _currentAudioStoreKey: string;
  private _currentProgram: RecorderProgram;

  private _primed: boolean;
  private _onNewRecording: (
    file: Blob,
    metaData: RecorderProgram
  ) => Promise<void>;

  constructor(context: AudioContext, scheduler: Scheduler) {
    if (!context) throw new Error("No context provided to recorder.");
    if (!scheduler) throw new Error("No scheduler provided to recorder.");

    this._recording = false;
    this._context = context;
    this._scheduler = scheduler;
    this._primed = false;
    this._currentProgram = undefined;

    const gotMedia = (stream: MediaStream): void => {
      this._source = context.createMediaStreamSource(stream);
      this._mediaRecorder = new window.MediaRecorder(
        stream,
        this._mediaRecorderOptions
      );
      this._mediaRecorder.ondataavailable = this.handleData;
    };

    vampAudioStream.getAudioStream().then(stream => gotMedia(stream));

    this._scheduler.listeners.addListener(
      "seek",
      this.onSchedulerSeek,
      "recorder_seek"
    );
    this._scheduler.listeners.addListener(
      "afterLoop",
      this.onSchedulerLoop,
      "recorder_loop"
    );
    this._scheduler.listeners.addListener(
      "play",
      this.onSchedulerPlay,
      "recorder_play"
    );
    this._scheduler.listeners.addListener(
      "pause",
      this.onSchedulerPause,
      "recorder_pause"
    );
    this._scheduler.listeners.addListener(
      "stop",
      this.onSchedulerStop,
      "recorder_stop"
    );
    this._scheduler.listeners.addListener(
      "jsClockTick",
      this.onSchedulerJSClockTick,
      "recorder_jsClockTick"
    );
  }

  private onSchedulerSeek = (): void => {};

  private onSchedulerLoop = (): void => {};

  private onSchedulerPlay = (): void => {
    if (this._primed) {
      this.startMediaRecorder();
    }
  };

  private onSchedulerPause = (): void => {
    if (this._primed) {
      this.stopMediaRecorder(500).then(blob => {
        this._primed = false;

        this._onNewRecording(blob, this._currentProgram);
      });
    }
  };

  private onSchedulerStop = (): void => {
    if (this._primed) {
      this.stopMediaRecorder(500).then(blob => {
        this._primed = false;

        this._onNewRecording(blob, this._currentProgram);
      });
    }
  };

  private onSchedulerJSClockTick = (): void => {};

  /**
   * Called when the React component that manages the recorder gets unmounted
   * (clean up).
   */
  deconstruct = (): void => {
    // TODO
  };

  prime = (
    onNewRecording: (file: Blob, program: RecorderProgram) => Promise<void>,
    programArgs: Omit<RecorderProgram, "recordingId">
  ): string => {
    this._primed = true;
    this._onNewRecording = onNewRecording;
    const recordingId = ObjectID.generate();
    this._currentAudioStoreKey = recordingId;
    this._currentProgram = {
      recordingId,
      ...programArgs
    };
    return recordingId;
  };

  unprime = (): void => {
    this._primed = false;
    this._onNewRecording = undefined;
    this._currentAudioStoreKey = undefined;
    this._currentProgram = undefined;
  };

  /**
   * Public method to stop recording.
   */
  stopRecording = (): void => {
    if (this._primed) {
      this.stopMediaRecorder(500).then(blob => {
        this._primed = false;

        this._onNewRecording(blob, this._currentProgram);
      });
    } else {
      console.error("Tried to stop unprimed recorder.");
    }
  };

  /**
   * This is called intermittently during recording, providing us with new data
   * that we can stick on to the audio store entry.
   */
  private handleData = (e: BlobEvent): void => {
    if (e.data.size > 0) {
      audioStore.appendBlob(this._context, this._currentAudioStoreKey, e.data);
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
  private startMediaRecorder = (): void => {
    if (this._recording) throw new Error("Recorder already recording.");
    if (!this._primed || !this._currentProgram) {
      throw new Error(
        "Can't start recorder when not primed or without a program."
      );
    }

    this._recording = true;

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
  private stopMediaRecorder = async (after: number): Promise<Blob> => {
    if (!this._primed || !this._currentProgram) {
      throw new Error(
        "Can't stop recorder when not primed or without a program."
      );
    }

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
