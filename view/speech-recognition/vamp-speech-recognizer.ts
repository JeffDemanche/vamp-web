import jspeech from "jspeech";

/**
 * Wrapper class for web speech API's recognizer
 */
class VampSpeechRecognizer {
  private _enabled: boolean;

  private _assistantName: string;
  private _recognition: SpeechRecognition;

  constructor() {
    this._assistantName = "Vivian";

    const SpeechRecognition =
      window.speechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      this._enabled = false;
    } else {
      this._enabled = true;

      this._recognition = new SpeechRecognition();

      this._recognition.grammars = this.getGrammar();

      this._recognition.lang = "en-US";
      this._recognition.continuous = true;
      this._recognition.start();
    }
  }

  getGrammar = (): SpeechGrammarList => {
    const SpeechGrammarList =
      window.SpeechGrammarList || window.webkitSpeechGrammarList;
    const speechRecognitionList = new SpeechGrammarList();

    const grammar = jspeech("wakeword", {
      version: "V1.0",
      lang: "en",
      encoding: "utf-8"
    });
    grammar.public.rule("greeting", "(a | hey | yo | ayo | <VOID> | <NULL> )");
    grammar.public.rule("command", "(play | stop | record | pause | loop )");
    grammar.public.rule(
      "wake",
      "<greeting> " + this._assistantName + " <command>"
    );
    speechRecognitionList.addFromString(grammar.stringify(), 1);

    return speechRecognitionList;
  };

  getAssistantName = (): string => this._assistantName;

  getRecognition = (): SpeechRecognition => this._recognition;

  getEnabled = (): boolean => this._enabled;
}

// eslint-disable-next-line prefer-const
export let vampSpeechRecognizer = new VampSpeechRecognizer();
