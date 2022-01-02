import { useState } from "react";
import { vampAudioContext } from "../vamp-audio-context";

export const useVampAudioContext = (): AudioContext => {
  const [context] = useState(() => {
    try {
      return vampAudioContext.getAudioContext();
    } catch (e) {
      console.error("Error getting the audio context");
      console.error(e);
    }
  });

  return context;
};
