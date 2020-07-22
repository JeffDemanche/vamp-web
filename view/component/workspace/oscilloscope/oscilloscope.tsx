import * as React from "react";
import { vampAudioContext } from "../../../audio/vamp-audio-context";
import { useRef, useEffect } from "react";
import { useStoredAudio } from "../../../react-hooks";
import { workerScript } from "./oscilloscopeWorker";

import * as styles from "./oscilloscope.less";

/*
  Sources: https://css-tricks.com/making-an-audio-waveform-visualizer-with-vanilla-javascript/
*/

const audioContext = vampAudioContext.getAudioContext();
const analyser = audioContext.createAnalyser();

interface OscilloscopeProps {
  audio: {
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
  const workerRef = useRef(null);
  const canvasRef = useRef(null);
  const audioData = useStoredAudio(props.audio.id);

  // On mount, give control to offscreen canvas to do drawing
  useEffect(() => {
    const worker = new Worker(workerScript);
    const canvas = canvasRef.current;
    const offscreen = canvas.transferControlToOffscreen();
    worker.postMessage(
      {
        canvas: offscreen,
        width: props.dimensions.width,
        height: props.dimensions.height
      },
      [offscreen]
    );
    workerRef.current = worker;
  }, []);

  // On change in the audio data or zoom, tell worker to redraw
  useEffect(() => {
    const worker = workerRef.current;
    worker.postMessage({ audioData: audioData, width: props.dimensions.width });
  }, [audioData, props.dimensions.width]);

  return (
    <div className={styles["oscilloscope"]}>
      <canvas ref={canvasRef}></canvas>
    </div>
  );
};
