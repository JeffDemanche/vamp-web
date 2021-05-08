import { Waveform } from "./waveform";

/**
 * Manages an audio file with potentially multiple waveform levels of detail.
 */
export class AdaptiveWaveform {
  private _audioBuffer: AudioBuffer;

  /**
   * When indexing into this map with a target seconds per window, choose the
   * first key with a greater value than the target, or default to the greatest
   * keyed entry.
   */
  private _waveforms: { [maxSecondsPerWindow: number]: Waveform };

  constructor(audioBuffer: AudioBuffer) {
    this._audioBuffer = audioBuffer;
    this._waveforms = {};
  }

  /**
   * Returns the best waveform for a given zoom level.
   *
   * @param temporalZoom Seconds per 100 pixels (comes from state somewhere).
   * @param targetPixelsPerWindow Will try to return the highest-detail waveform
   * that is still lower detail than this.
   */
  getBestWaveform(
    temporalZoom: number,
    targetPixelsPerWindow: number
  ): Waveform {
    const secondsPerPixel = temporalZoom / 100.0;
    const targetSecondsPerWindow = secondsPerPixel * targetPixelsPerWindow;

    const sortedKeys = Object.keys(this._waveforms)
      .map(Number)
      .sort();

    const bestKey =
      sortedKeys.find(key => key > targetSecondsPerWindow) ??
      sortedKeys[sortedKeys.length - 1];

    return this._waveforms[bestKey];
  }

  /**
   * Generates a waveform at a specified level of detail and stores the result
   * in this AdaptiveWaveform. By the time one of the callbacks is executed, the
   * SVG should be ready to use.
   *
   * @param secondsPerWindow Seconds between each SVG data point.
   * @param onComplete Executed after the waveform has been successfully
   * generated.
   * @param onRejected Executed after failure to generate the waveform.
   */
  generateWaveform(
    secondsPerWindow: number,
    onComplete?: () => void,
    onRejected?: (reason: PromiseRejectionEvent) => void
  ): void {
    const waveform = new Waveform();
    waveform.createFromAudioBuffer(this._audioBuffer, secondsPerWindow).then(
      () => {
        this._waveforms[secondsPerWindow] = waveform;
        onComplete && onComplete();
      },
      reason => {
        console.error("Error generating waveform");
        console.error(reason);
        onRejected && onRejected(reason);
      }
    );
  }
}
