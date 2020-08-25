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
  const workerRef = useRef<Worker>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { width: viewportWidth } = useWindowDimensions();

  let audioData: number[];

  if (props.audio) {
    audioData = useStoredAudio(props.audio.id);
  } else {
    audioData = Array.from(useStreamedAudio());
  }

  // Helper for drawing a single line
  const drawLine = (
    coordinates: number[],
    binSize: number
  ): Promise<boolean> => {
    const x = coordinates[0];
    const y = coordinates[1];
    const context = canvasRef.current.getContext("2d");
    const gradient = context.createLinearGradient(0, 0, 170, 0);
    gradient.addColorStop(0, "rgba(138, 18, 233, 1)");
    gradient.addColorStop(0.5, "rgba(74, 18, 233, 1)");
    gradient.addColorStop(1.0, "#56B0F2");
    context.strokeStyle = gradient;
    context.beginPath();
    context.moveTo(x, 0);
    context.lineTo(x, y);
    context.lineTo(x + binSize, 0);
    context.stroke();
    context.closePath();
    return Promise.resolve(true);
  };

  // Draws on the canvas in parallel
  const draw = (leftBound: number, viewportWidth: number): void => {
    const length = audioData.length;
    const width = canvasRef.current.width;
    const samples =
      Math.floor(width * Math.log(width)) * Number(width > 100) +
      200 * Number(width <= 100); // Adaptive resolution
    const binSize = width / length;
    const stepSize = Math.max(Math.floor(audioData.length / samples), 1);
    const canvasScale = 0.5;
    const coordinatesArray: number[][] = [[]];
    for (let i = 0; i < audioData.length; i = i + stepSize) {
      const coordinate = [
        binSize * i,
        audioData[i] * canvasScale * canvasRef.current.height
      ];
      coordinatesArray.push(coordinate);
    }
    // Draw points in parallel
    Promise.all(
      coordinatesArray.map(coordinate => {
        if (coordinate[0] > -leftBound || coordinate[0] < viewportWidth)
          drawLine(coordinate, binSize);
      })
    );
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const div = divRef.current;
    const { left } = div.getBoundingClientRect();
    let offscreen: OffscreenCanvas;
    try {
      offscreen = canvas.transferControlToOffscreen();
      const worker = new Worker(workerScript);
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
    } catch (err) {
      console.log(
        "Offscreen canvas is not supported by this browser, expect lag"
      );
      const context = canvasRef.current.getContext("2d");
      context.scale(props.dimensions.width / canvas.width, 1);
      canvas.width = props.dimensions.width;
      context.translate(0, canvas.height / 2);
      draw(left, viewportWidth);
      canvasRef.current = canvas;
    }
  }, []);

  // On change in the audio data or zoom, tell worker to redraw
  useEffect(() => {
    const div = divRef.current;
    const { left: leftBound } = div.getBoundingClientRect();
    if (workerRef.current) {
      const worker = workerRef.current;
      worker.postMessage({
        audioData: audioData,
        width: Math.max(props.dimensions.width, 1),
        leftBound: leftBound,
        viewportWidth: viewportWidth
      });
    } else {
      const context = canvasRef.current.getContext("2d");
      const canvas = canvasRef.current;
      context.scale(props.dimensions.width / canvas.width, 1);
      canvas.width = props.dimensions.width;
      context.translate(0, canvas.height / 2);
      draw(leftBound, viewportWidth);
      canvasRef.current = canvas;
    }
  }, [audioData, props.dimensions.width]);

  return (
    <div className={styles["oscilloscope"]} ref={divRef}>
      <canvas ref={canvasRef}></canvas>
    </div>
  );
};
