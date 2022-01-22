import { ApolloClient } from "@apollo/client";
import { AdaptiveWaveform } from "./waveform/adaptive-waveform";

export class StoredAudio {
  private _context: AudioContext;

  private _id: string;

  private _data?: Blob;
  private _dataLoading: boolean;
  private _dataError?: string;

  private _arrayBuffer?: ArrayBuffer;
  private _arrayBufferLoading: boolean;

  private _audioBuffer?: AudioBuffer;
  private _audioBufferLoading: boolean;

  private _adaptiveWaveForm?: AdaptiveWaveform;
  private _adaptiveWaveFormLoading: boolean;

  /**
   * @param initialData A Promise of blob audio data. This allows us to create a
   * `StoredAudio` before we necessarily have the data. While this is waiting to
   * resolve we set `dataLoading` to true.
   */
  constructor(context: AudioContext, id: string, initialData: Promise<Blob>) {
    this._context = context;
    this._id = id;

    this._dataLoading = true;
    this._audioBufferLoading = true;
    this._arrayBufferLoading = true;
    this._adaptiveWaveFormLoading = true;

    initialData
      .then(data => {
        this._data = data;
        this._dataLoading = false;

        this.decode();
      })
      .catch(err => {
        this._dataLoading = false;
        this._dataError = err;

        this._arrayBufferLoading = false;
        this._audioBufferLoading = false;
        this._adaptiveWaveFormLoading = false;
      });
  }

  /**
   * Audio data decoding involves a series of promises. We want to be able to do
   * things with the audio while the data is loading, so this sets loading
   * states until each promise resolves.
   */
  private decode = (): void => {
    if (!this.data)
      throw new Error("Can't decode audio until data is present.");

    this._audioBufferLoading = true;
    this._arrayBufferLoading = true;

    this.data.arrayBuffer().then(arrayBuffer => {
      this._arrayBuffer = arrayBuffer;
      this._arrayBufferLoading = false;

      this._context.decodeAudioData(arrayBuffer).then(audioBuffer => {
        this._audioBuffer = audioBuffer;
        this._audioBufferLoading = false;

        this._adaptiveWaveForm = new AdaptiveWaveform(audioBuffer);
        this._adaptiveWaveForm.generateWaveform(0.005);
      });
    });
  };

  /**
   * Appends data to the stored audio.
   */
  appendData = (newData: Blob): Blob => {
    const existingBlob = this.data;
    this._data = new Blob([existingBlob, newData], {
      type: existingBlob.type
    });
    return this._data;
  };

  get data(): Blob {
    return this._data;
  }

  get dataLoading(): boolean {
    return this._dataLoading;
  }

  get audioBuffer(): AudioBuffer {
    return this._audioBuffer;
  }

  get audioBufferLoading(): boolean {
    return this._audioBufferLoading;
  }

  awaitAudioBuffer = async (): Promise<AudioBuffer> => {
    if (this.audioBuffer) return this.audioBuffer;

    return new Promise(resolve => {
      const i = setInterval(() => {
        if (this.audioBuffer) {
          resolve(this.audioBuffer);
          clearInterval(i);
        }
      }, 5);
    });
  };

  get adaptiveWaveForm(): AdaptiveWaveform {
    return this._adaptiveWaveForm;
  }

  get adaptiveWaveFormLoading(): boolean {
    return this._adaptiveWaveFormLoading;
  }

  awaitAdaptiveWaveform = async (): Promise<AdaptiveWaveform> => {
    if (this.adaptiveWaveForm) return this.adaptiveWaveForm;

    return new Promise(resolve => {
      const i = setInterval(() => {
        if (this.adaptiveWaveForm) {
          resolve(this.adaptiveWaveForm);
          clearInterval(i);
        }
      }, 5);
    });
  };
}

/**
 * Downloaded audio needs to be stored in memory somewhere. There doesn't seem
 * to be much support for doing that in Apollo or Redux, so we're doing it in
 * this class, which is essentially a dictionary for audio data.
 */
export class AudioStore {
  private _store: { [audioId: string]: StoredAudio };

  constructor() {
    this._store = {};
  }

  getStoredAudio = (audioId: string): StoredAudio => {
    return this._store[audioId];
  };

  awaitStoredAudio = async (audioId: string): Promise<StoredAudio> => {
    if (this._store[audioId]) return this._store[audioId];

    return new Promise(resolve => {
      const i = setInterval(() => {
        if (this._store[audioId]) {
          resolve(this._store[audioId]);
          clearInterval(i);
        }
      }, 5);
    });
  };

  /**
   * Appends a chunk of audio data onto a store entry by key. If the key doesn't
   * exist, a new entry is created with only the provided blob data.
   */
  appendBlob = (context: AudioContext, storeKey: string, blob: Blob): Blob => {
    if (this._store[storeKey]) {
      this._store[storeKey].appendData(blob);
    } else {
      this._store[storeKey] = new StoredAudio(
        context,
        storeKey,
        new Promise<Blob>(resolve => resolve(blob))
      );
    }
    return this._store[storeKey].data;
  };

  /**
   * Immediately creates a `StoredAudio` with a promise that will resolve with
   * the audio data once it has been fetched from the server.
   */
  downloadAndCacheAudio = async ({
    audioId,
    audioContext,
    apolloClient
  }: {
    audioId: string;
    audioContext: AudioContext;
    apolloClient: ApolloClient<object>;
  }): Promise<void> => {
    const dataPromise = new Promise<Blob>((resolve, reject) => {
      fetch(`/audio/${audioId}.webm`).then(res => {
        const cache = apolloClient.cache;

        if (!res.ok) {
          // Handle errors downloading audio file.
          cache.modify({
            id: cache.identify({ __typename: "Audio", id: audioId }),
            fields: {
              error: (): string => res.statusText
            }
          });

          reject("Bad response downloading audio: " + res.status);
        } else {
          res.blob().then(blob => {
            // TODO This shouldn't happen here.
            blob.arrayBuffer().then(arrayBuffer => {
              audioContext.decodeAudioData(arrayBuffer).then(audioBuffer => {
                cache.modify({
                  id: cache.identify({ __typename: "Audio", id: audioId }),
                  fields: {
                    storedLocally: (): boolean => {
                      return true;
                    },
                    duration: (): number => audioBuffer.duration
                  }
                });
              });
            });

            resolve(blob);
          });
        }
      });
    });
    this._store[audioId] = new StoredAudio(audioContext, audioId, dataPromise);
  };
}

// eslint-disable-next-line prefer-const
export let audioStore = new AudioStore();
