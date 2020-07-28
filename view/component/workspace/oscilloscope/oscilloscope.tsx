import * as React from "react";

import { useRef, useEffect } from "react";
import { useStoredAudio, useStreamedAudio } from "../../../react-hooks";
import { workerScript } from "./oscilloscopeWorker";
import * as styles from "./oscilloscope.less";
import { useWindowDimensions } from "../../../workspace-hooks";

/*
  Sources: https://css-tricks.com/making-an-audio-waveform-visualizer-with-vanilla-javascript/
*/

interface OscilloscopeProps {
  audio?: {
    id: string;
    filename: string;
    storedLocally: boolean;
    localFilename: string;
    duration: number;
  };
  dimensions: {
    height: number;
    width: number;
  };
}

export const Oscilloscope: React.FC<OscilloscopeProps> = (
  props: OscilloscopeProps
) => {
  // How far out we want to render past what's visible
  const renderingMargin = 10;
  const divRef = useRef<HTMLDivElement>(null);
  const workerRef = useRef(null);
  const canvasRef = useRef(null);
  const { width: viewportWidth } = useWindowDimensions();

  let audioData: number[];

  if (props.audio) {
    audioData = useStoredAudio(props.audio.id);
  } else {
    audioData = useStreamedAudio();
  }

  // On mount, give control to offscreen canvas to do drawing
  useEffect(() => {
    const worker = new Worker(workerScript);
    const canvas = canvasRef.current;
    const div = divRef.current;
    const { left } = div.getBoundingClientRect();
    const offscreen = canvas.transferControlToOffscreen();
    worker.postMessage(
      {
        canvas: offscreen,
        width: Math.max(props.dimensions.width, 1), // To fix a bug
        height: props.dimensions.height,
        viewportWidth: viewportWidth + renderingMargin,
        leftBound: left - renderingMargin
      },
      [offscreen]
    );
    workerRef.current = worker;
  }, []);

  // On change in the audio data or zoom, tell worker to redraw
  useEffect(() => {
    const worker = workerRef.current;
    const div = divRef.current;
    const { left: leftBound } = div.getBoundingClientRect();
    worker.postMessage({
      audioData: audioData,
      width: Math.max(props.dimensions.width, 1),
      leftBound: leftBound,
      viewportWidth: viewportWidth
    });
  }, [audioData, props.dimensions.width]);

  return (
    <div className={styles["oscilloscope"]} ref={divRef}>
      <canvas ref={canvasRef}></canvas>
    </div>
  );
};
