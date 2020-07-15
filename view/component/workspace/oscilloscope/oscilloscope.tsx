import * as React from "react";
import { vampAudioContext } from "../../../audio/vamp-audio-context";
import { audioStore } from "../../../audio/audio-store";
import { useRef, useState, useEffect } from "react";
// tf used as a scientific computing package
import * as tf from "@tensorflow/tfjs";
import { Tensor1D } from "@tensorflow/tfjs";

import * as styles from "./oscilloscope.less";
/*
  Sources: https://css-tricks.com/making-an-audio-waveform-visualizer-with-vanilla-javascript/
*/

const audioContext = vampAudioContext.getAudioContext();
// const analyser = audioContext.createAnalyser();

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
  const canvasRef = useRef(null);
  const fileBuffer = audioStore.getStoredAudio(props.audio.id);

  const draw = (normalizedData: number[]): void => {
    const canvas = canvasRef.current;
    canvas.width = props.dimensions.width;
    canvas.height = props.dimensions.height;
    const canvasContext = canvas.getContext("2d");
    canvasContext.translate(0, canvas.height / 2);

    const length = normalizedData.length;
    const width = canvas.width / length;
    for (let i = 0; i < length; i++) {
      const x = width * i;
      const height = normalizedData[i] * canvas.height;

      canvasContext.lineWidth = 1;
      canvasContext.strokeStyle = "#000000";
      canvasContext.beginPath();
      canvasContext.moveTo(x, 0);
      canvasContext.lineTo(x, height);
      canvasContext.lineTo(x + width, 0);
      canvasContext.stroke();
    }
  };

  //called upon recieving the data
  const handleAudioBuffer = (audioBuffer: AudioBuffer): void => {
    const data = tf.tensor1d(audioBuffer.getChannelData(0));
    // scaling constant normalizes the data and determines how waveform scales visually on the div
    const scalingConstant = tf.mul(tf.abs(data).max(), 2);
    const normalizedData: Tensor1D = tf.div(data, scalingConstant);
    // TODO: vectorize draw? I don't know if it's possible with turtle graphics, but maybe
    normalizedData.array().then(array => {
      draw(array);
    });
  };

  useEffect(() => {
    if (fileBuffer) {
      fileBuffer.data.arrayBuffer().then(arrayBuffer => {
        const audioBuffer = audioContext.decodeAudioData(arrayBuffer);
        audioBuffer.then(audioBuffer => {
          // does webgl garbage collection of tensors, if using webgl backend
          tf.tidy(() => {
            handleAudioBuffer(audioBuffer);
          });
        });
      });
    } else {
      console.log("I don't have the file yet!");
    }
  }, [fileBuffer]);

  return (
    <div className={styles["oscilloscope"]}>
      <canvas ref={canvasRef}></canvas>
    </div>
  );
};
