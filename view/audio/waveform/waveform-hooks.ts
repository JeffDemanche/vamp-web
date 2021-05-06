import { audioStore } from "../audio-store";

export const useWaveformSVG = (
  audioStoreKey: string,
  temporalZoom: number
): {
  svg?: JSX.Element;
  loading?: boolean;
  exists?: boolean;
  error?: string;
} => {
  const storeAudio = audioStore.getStoredAudio(audioStoreKey);

  if (storeAudio === undefined)
    return { error: "Audio store didn't contain the specified key" };

  const adaptiveWaveform = audioStore.getStoredAudio(audioStoreKey)
    .adaptiveWaveform;

  if (adaptiveWaveform === undefined) return { exists: false };

  const waveform = storeAudio.adaptiveWaveform.getBestWaveform(temporalZoom, 5);

  if (waveform.loading) return { loading: true };

  return { svg: waveform.svg };
};
