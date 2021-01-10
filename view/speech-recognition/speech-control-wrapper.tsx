import * as React from "react";
import { useQuery } from "@apollo/client";
import {
  PLAYING_CLIENT,
  RECORDING_CLIENT
} from "../state/queries/vamp-queries";
import { PlayingClient, RecordingClient } from "../state/apollotypes";
import { useCurrentVampId } from "../util/react-hooks";
import { useEffect, useState } from "react";
import { vampSpeechRecognizer } from "./vamp-speech-recognizer";
import {
  usePause,
  usePlay,
  useRecord,
  useSeek,
  useStop
} from "../state/vamp-state-hooks";

interface SpeechControlTypes {
  children: React.ReactNode;
}

export const SpeechControl: React.FC<SpeechControlTypes> = (
  props: SpeechControlTypes
): JSX.Element => {
  const startSpeechRecognition = (): SpeechRecognition => {
    if (vampSpeechRecognizer.getEnabled()) {
      return vampSpeechRecognizer.getRecognition();
    } else {
      console.log("Web speech not supported");
      return null;
    }
  };

  const recognition = startSpeechRecognition();
  if (!recognition) {
    return <div style={{ height: "100%" }}>{props.children}</div>;
  }

  const vampId = useCurrentVampId();

  const play = usePlay();
  const pause = usePause();
  const stop = useStop();
  const record = useRecord();
  const seek = useSeek();

  const { data, loading, error } = useQuery<PlayingClient>(PLAYING_CLIENT, {
    variables: { vampId }
  });
  const { data: recordingData } = useQuery<RecordingClient>(RECORDING_CLIENT, {
    variables: { vampId }
  });

  const [isListening, setIsListening] = useState(false);

  // wake word detection
  const transcriptHelper = (transcript: string): string => {
    const transcriptList = transcript.split(" ");
    const wakeWordIndex = transcriptList.indexOf(
      vampSpeechRecognizer.getAssistantName()
    );

    if (wakeWordIndex === -1) {
      return null;
    } else {
      transcript = transcriptList
        .slice(wakeWordIndex + 1, transcript.length)
        .join(" ");

      return transcript;
    }
  };

  // result from intent of the transcript
  const voiceCommand = (transcript: string): void => {
    /*
      For now, we'll use if statements here, eventually we'll want to use 
      more sophisticated NLP for Named entity recog -> intents, so we would send the transcript 
      to an API to do that
      */
    if (transcript.includes("play")) {
      if (!data.vamp.playing) {
        play();
      }
    } else if (transcript.includes("stop")) {
      if (data.vamp.playing) {
        if (recordingData.vamp.recording) {
          seek(0);
        } else {
          stop();
        }
      }
    } else if (transcript.includes("pause")) {
      console.log("pause!");
    } else if (transcript.includes("record")) {
      console.log("record!");
    }
  };

  // the recognition occurs here
  const handleSpeech = (): void => {
    recognition.onnomatch = (): void => {
      console.log("sorry I didn't get that");
    };
    recognition.onresult = (e: SpeechRecognitionEvent): boolean => {
      let transcript = e.results[e.results.length - 1][0].transcript;
      // console.log(transcript);

      transcript = transcriptHelper(transcript);

      if (!transcript) {
        setIsListening(false);
        return false;
      }
      voiceCommand(transcript);
      setIsListening(true);
      return true;
    };
    // web speech times out even in continuous mode, here's the fix
    recognition.onend = (): void => {
      recognition.start();
    };
  };

  useEffect(() => {
    handleSpeech();
  });

  // maybe we'd like to render something if we're listening
  useEffect(() => {}, [isListening]);

  return (
    <div className={"speech-control"} style={{ height: "inherit" }}>
      {props.children}
    </div>
  );
};
