import { useState } from "react";
import { audioStore } from "../audio-store";
import { AdaptiveWaveform } from "./adaptive-waveform";

export const useWaveformSVG = (
  audioStoreKey: string,
  temporalZoom: number
): {
  svg?: JSX.Element;
  loading?: boolean;
  error?: string;
} => {
  const [adaptiveWaveform, setAdaptiveWaveform] = useState<AdaptiveWaveform>(
    undefined
  );

  const storeAudio = audioStore.getStoredAudio(audioStoreKey);

  if (storeAudio === undefined)
    return { error: "Audio store didn't contain the specified key" };
  const adaptiveWaveformPromise = audioStore
    .getStoredAudio(audioStoreKey)
    .awaitAdaptiveWaveform();

  adaptiveWaveformPromise.then(waveform => {
    setAdaptiveWaveform(waveform);
  });

  if (!adaptiveWaveform) return { loading: true };

  const waveform = adaptiveWaveform.getBestWaveform(temporalZoom, 5);

  if (waveform.loading) return { loading: true };

  return { svg: waveform.svg };
};
