declare module "*.less";

declare module "apollo-upload-client";

declare interface Window {
  AudioContext: typeof AudioContext;
  webkitAudioContext: typeof AudioContext;
  webkitSpeechRecognition: typeof SpeechRecognition;
  webkitSpeechGrammarList: typeof SpeechGrammarList;
  webkitSpeechRecognitionEvent: typeof SpeechRecognitionEvent;
}

declare module "jspeech";
