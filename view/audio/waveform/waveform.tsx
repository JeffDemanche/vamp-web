import * as React from "react";

interface WaveformSummary {
  /** Number of samples aggregated into one "point" on the waveform. */
  windowWidth: number;

  numWindows: number;

  /** Array of "data points." Each window holds a min and max value. */
  windows: { min: number; max: number }[];
}

/**
 * A single waveform. `createFromAudioBuffer` will load audio data into the
 * object, then `generateSVG` will create a reusable SVG JSX element.
 */
export class Waveform {
  private _loading: boolean;
  private _loaded: boolean;

  /** Holds decoded audio data. */
  private _audioBuffer: AudioBuffer;

  /** Holds raw data from all channels of the AudioBuffer. */
  private _channelData: Float32Array[];

  private _durationSamples: number;

  private _summary: WaveformSummary;

  /** Stores the sauce. */
  private _svg: JSX.Element;

  constructor() {
    this._loading = false;
    this._loaded = false;
  }

  /** Gets the sauce. */
  get svg(): JSX.Element {
    return this._svg;
  }

  get loading(): boolean {
    return this._loading;
  }

  get loaded(): boolean {
    return this._loaded;
  }

  /**
   * Generates the waveform from an AudioBuffer object, then resolves once done.
   *
   * @param audioBuffer This could be the result of
   * `AudioContext.decodeAudioData()`.
   * @param windowWidthSeconds *Approximately* how many seconds between data
   * points on the waveform. It's approximate because we round to the nearest
   * sample.
   */
  async createFromAudioBuffer(
    audioBuffer: AudioBuffer,
    windowWidthSeconds: number
  ): Promise<void> {
    this._loading = true;

    this._audioBuffer = audioBuffer;
    this._durationSamples = audioBuffer.length;
    this._channelData;

    // Copies each channel into _channelData functionally
    this._channelData = [...Array(audioBuffer.numberOfChannels)].map((_, i) =>
      audioBuffer.getChannelData(i)
    );

    this._summary = {
      windowWidth: Math.round(windowWidthSeconds * audioBuffer.sampleRate),
      numWindows: 0,
      windows: []
    };

    this.generateSummaryMean();
    this._svg = this.generateSVG(1000, 300);

    this._loaded = true;
    this._loading = false;
  }

  /**
   * Generates the waveform summary by taking the mean value of all the samples
   * in each window. Negative samples are meaned separately from positive values
   * since waveforms aren't necessarily symmetric.
   */
  private generateSummaryMean(): void {
    const windowWidth = this._summary.windowWidth;
    const numWindows = Math.ceil(this._durationSamples / windowWidth);

    // The newly generated summary.
    const summary: WaveformSummary = {
      numWindows,
      windowWidth,
      windows: []
    };

    // Accumulators for positive and negative values in each window.
    let windowPosAcc = 0;
    let windowNegAcc = 0;

    let windowIndex = 0;

    for (let i = 0; i < this._durationSamples; i++) {
      for (let c = 0; c < this._channelData.length; c++) {
        const pieceOfData = this._channelData[c][i];
        pieceOfData > 0
          ? (windowPosAcc += pieceOfData)
          : (windowNegAcc += pieceOfData);
      }

      if (i === this._audioBuffer.length - 1) {
        // Note if this is the end of the audio, the window probably will be
        // less long than windowWidth
        const denominator = (windowIndex + 1) * this._channelData.length;
        summary.windows.push({
          min: windowNegAcc / denominator,
          max: windowPosAcc / denominator
        });
      } else if (windowIndex === windowWidth - 1) {
        // Also we're dividing by the number of channels otherwise an audio with
        // two channels could appear twice as loud
        const denominator = windowWidth * this._channelData.length;
        summary.windows.push({
          min: windowNegAcc / denominator,
          max: windowPosAcc / denominator
        });
        windowIndex = 0;
        windowPosAcc = 0;
        windowNegAcc = 0;
      } else {
        windowIndex++;
      }
    }

    if (summary.numWindows !== summary.windows.length) {
      throw new Error("Invariant violated in waveform generation");
    }

    this._summary = summary;
  }

  /**
   * Returns a JSX element which is the SVG of the waveform.
   */
  private generateSVG(width: number, height: number): JSX.Element {
    if (this._summary.numWindows === 0)
      throw new Error(
        "Can't generate waveform SVG because the summary wasn't generated."
      );

    const halfHeight = height / 2;

    /** Generates the <d path=*> string, which traces the path. */
    const generatePathD = (): string => {
      const pixelWindowWidth =
        width * (this._summary.windowWidth / this._durationSamples);

      // Trace the top of the waveform path, i.e. the positive values
      const pathTop = this._summary.windows.map((window, i) => {
        return `L ${i * pixelWindowWidth},${halfHeight -
          window.max * halfHeight}`;
      });

      // Add a point at the end which is add 0dB
      pathTop.push(`L ${width},${halfHeight}`);

      // Iterate the windows in reverse to trace the bottom of the waveform
      const pathBottom: string[] = [];
      for (let i = this._summary.windows.length - 1; i >= 0; i--) {
        const window = this._summary.windows[i];
        pathBottom.push(
          `L ${i * pixelWindowWidth},${halfHeight - window.min * halfHeight}`
        );
      }

      return `M 0,${halfHeight} ${pathTop.join(" ")} ${pathBottom.join(" ")}`;
    };

    const path = generatePathD();

    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
        viewBox={`0 0 ${width} ${height}`}
      >
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop
              offset="0%"
              style={{ stopColor: "rgb(220, 111, 87)", stopOpacity: 1 }}
            ></stop>
            <stop
              offset="100%"
              style={{ stopColor: "rgb(255, 44, 44)", stopOpacity: 1 }}
            ></stop>
          </linearGradient>
        </defs>
        <g fill="url(#gradient)">
          <path d={path}></path>
        </g>
      </svg>
    );
  }
}
