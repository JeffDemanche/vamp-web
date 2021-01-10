import * as React from "react";

import { useRef, useEffect } from "react";
import { useStoredAudio, useStreamedAudio } from "../../../util/react-hooks";
import { workerScript } from "./oscilloscopeWorker";
import * as styles from "./oscilloscope.less";
import { useWindowDimensions } from "../../../util/workspace-hooks";
import { draw } from "./oscilloscopeScripts";

interface OscilloscopeProps {
  audio?: {
    id: string;
    filename: string;
    storedLocally: boolean;
    localFilename: string;
    duration: number;
  };
  dimensions: {
    width: number;
  };
}

export const Oscilloscope: React.FC<OscilloscopeProps> = (
  props: OscilloscopeProps
) => {
  const renderingMargin = 10; // Render past what's visible
  const divRef = useRef<HTMLDivElement>(null);
  const workerRef = useRef<Worker>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { width: right } = useWindowDimensions();

  let audioData: Float32Array;

  if (props.audio) {
    audioData = useStoredAudio(props.audio.id);
  } else {
    audioData = useStreamedAudio();
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    const div = divRef.current;
    const { height, left, top } = div.getBoundingClientRect();
    canvas.width = props.dimensions.width;
    canvas.height = height;
    canvas.style.left = `${left}px`;
    canvas.style.top = `${top}px`;
    let offscreen: OffscreenCanvas;
    try {
      // Graphics on a seperate thread if offscreen canvas possible
      offscreen = canvas.transferControlToOffscreen();
      const worker = new Worker(workerScript);
      worker.postMessage(
        {
          canvas: offscreen,
          width: Math.max(props.dimensions.width, 1), // To fix a bug
          rightBound: right + renderingMargin,
          leftBound: left - renderingMargin
        },
        [offscreen]
      );
      workerRef.current = worker;
    } catch (err) {
      console.log("Offscreen canvas is not supported by this browser");
      canvas.width = props.dimensions.width;
      const context = canvasRef.current.getContext("2d");
      context.translate(0, canvas.height / 2);
      draw(
        canvasRef.current,
        audioData,
        left - renderingMargin,
        right + renderingMargin
      ); // Helper script
      canvasRef.current = canvas;
    }
  }, []);

  // On change in the audio data or zoom, adjust the drawing
  useEffect(() => {
    const div = divRef.current;
    const { left } = div.getBoundingClientRect();
    if (workerRef.current) {
      const worker = workerRef.current;
      worker.postMessage({
        audioData: audioData,
        width: Math.max(props.dimensions.width, 1),
        leftBound: left - renderingMargin,
        rightBound: right + renderingMargin
      });
    } else {
      const canvas = canvasRef.current;
      canvas.width = props.dimensions.width;
      const context = canvasRef.current.getContext("2d");
      context.translate(0, canvas.height / 2);
      draw(
        canvasRef.current,
        audioData,
        left - renderingMargin,
        right + renderingMargin
      );
      canvasRef.current = canvas;
    }
  }, [audioData, props.dimensions.width]);

  return (
    <div className={styles["oscilloscope"]} ref={divRef}>
      <canvas ref={canvasRef}></canvas>
    </div>
  );
};
