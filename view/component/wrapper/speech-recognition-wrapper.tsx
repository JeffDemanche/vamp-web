import * as React from "react";
import { useMutation, useQuery } from "react-apollo";
import {
  PLAY_CLIENT,
  PAUSE_CLIENT,
  STOP_CLIENT,
  RECORD_CLIENT,
  SEEK_CLIENT
} from "../../queries/vamp-mutations";
import { PLAYING_CLIENT, RECORDING_CLIENT } from "../../queries/vamp-queries";
import {
  PlayClient,
  StopClient,
  RecordClient,
  Seek,
  PauseClient,
  PlayingClient,
  RecordingClient
} from "../../state/apollotypes";
import { useCurrentVampId } from "../../react-hooks";
import { useEffect, useState } from "react";
import jspeech from "jspeech";

/*
  Web Speech API is still experimental and is only supported by
  Chrome and Firefox.  I'm also hoping that eventuall
*/
const assistantName = "Vivian";

// uses available speech recognition
const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;

const SpeechGrammarList =
  window.SpeechGrammarList || window.webkitSpeechGrammarList;

// setting up properties of the recognition, if available
const getRecognition = (): SpeechRecognition => {
  if (!SpeechRecognition) {
    return null;
  }
  const recognition = new SpeechRecognition();
  const speechRecognitionList = new SpeechGrammarList();
  const grammar = jspeech("wakeword", {
    version: "V1.0",
    lang: "en",
    encoding: "utf-8"
  });
  grammar.public.rule("greeting", "(a | hey | yo | ayo | <VOID> | <NULL> )");
  grammar.public.rule("command", "(play | stop | record | pause | loop )");
  grammar.public.rule("wake", "<greeting> " + assistantName + " <command>");
  speechRecognitionList.addFromString(grammar.stringify(), 1);
  recognition.grammars = speechRecognitionList;

  recognition.lang = "en-US";
  recognition.continuous = true;
  recognition.start();
  return recognition;
};

const recognition = getRecognition();

interface ToWrapTypes {
  children: React.ReactNode;
}

export const SpeechRecognizer: React.FC<ToWrapTypes> = (
  props: ToWrapTypes
): JSX.Element => {
  if (!recognition) {
    console.log("speech recognition not supported by this browser");
  } else {
    const vampId = useCurrentVampId();
    const [play] = useMutation<PlayClient>(PLAY_CLIENT);
    const [pause] = useMutation<PauseClient>(PAUSE_CLIENT);
    const [stop] = useMutation<StopClient>(STOP_CLIENT);
    const [record] = useMutation<RecordClient>(RECORD_CLIENT);
    const [seek] = useMutation<Seek>(SEEK_CLIENT);
    const { data, loading, error } = useQuery<PlayingClient>(PLAYING_CLIENT, {
      variables: { vampId }
    });
    const { data: recordingData } = useQuery<RecordingClient>(
      RECORDING_CLIENT,
      {
        variables: { vampId }
      }
    );

    const [isListening, setIsListening] = useState(false);

    // wake word detection hack
    const transcriptHelper = (transcript: string): string => {
      const transcriptList = transcript.split(" ");
      const wakeWordIndex = transcriptList.indexOf(assistantName);

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
            seek({ variables: { time: 0 } });
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
        console.log(transcript);

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
  }

  return <div className={"speech-recognizer"}>{props.children}</div>;
};
