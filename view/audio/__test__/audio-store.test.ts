import { AudioStore, StoredAudio } from "../audio-store";
import { AudioContext, registrar } from "standardized-audio-context-mock";

const mockAudioContext: AudioContext = new AudioContext();

describe("AudioStore", () => {
  let audioStore: AudioStore;

  beforeAll(() => {
    jest.useFakeTimers();
  });

  beforeEach(() => {
    audioStore = new AudioStore();
  });

  afterEach(() => {
    registrar.reset(mockAudioContext);
  });

  it("appending a blob to a new store key creates a new StoredAudio", async () => {
    const testBlob = new Blob(["just blob thingz"]);

    // @ts-ignore
    audioStore.appendBlob(mockAudioContext, "new_store_key", testBlob);

    expect(audioStore.getStoredAudio("new_store_key")).not.toBeUndefined();
    expect(audioStore.getStoredAudio("new_store_key").dataLoading).toBeTruthy();

    await new Promise(setImmediate);

    expect(audioStore.getStoredAudio("new_store_key").data).not.toBeUndefined();
    expect(audioStore.getStoredAudio("new_store_key").data.size).toEqual(16);
  });

  it("appending a blob to an existing store key increases blob size", async () => {
    const testBlob = new Blob(["just blob thingz"]);
    const testBlob2 = new Blob(["more blob thingz"]);

    // @ts-ignore
    audioStore.appendBlob(mockAudioContext, "store_key", testBlob);

    await new Promise(setImmediate);

    expect(audioStore.getStoredAudio("store_key").data.size).toEqual(16);

    // @ts-ignore
    audioStore.appendBlob(mockAudioContext, "store_key", testBlob2);

    await new Promise(setImmediate);

    expect(audioStore.getStoredAudio("store_key").data.size).toEqual(32);
  });

  describe("StoredAudio", () => {
    it("is kept in dataLoading state while blob promise is unresolved", async () => {
      const blobPromise = new Promise<Blob>(resolve => {
        setTimeout(() => {
          resolve(new Blob());
        }, 500);
      });

      const storedAudio = new StoredAudio(
        // @ts-ignore
        mockAudioContext,
        "stored_audio_id",
        blobPromise
      );

      expect(storedAudio.dataLoading).toBeTruthy();
      expect(storedAudio.data).toBeUndefined();

      expect(storedAudio.audioBufferLoading).toBeTruthy();
      expect(storedAudio.adaptiveWaveFormLoading).toBeTruthy();

      jest.advanceTimersByTime(500);
      await new Promise(setImmediate);

      expect(storedAudio.dataLoading).toBeFalsy();
      expect(storedAudio.data).not.toBeUndefined();
    });
  });
});
