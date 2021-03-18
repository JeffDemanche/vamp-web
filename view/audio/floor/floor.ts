import ObjectID from "bson-objectid";
import { KeyMap } from "react-hotkeys";
import { vampAudioContext } from "../vamp-audio-context";
import { NodeGraph, nodeGraphFromState } from "./nodegraph";

/**
 * This class represents the audio-related functionality of the Floor.
 */
class Floor {
  private _context: AudioContext;
  private _enabled: boolean;

  private _test_oscillator: OscillatorNode;

  private _test_nodegraph: NodeGraph;

  public keyMap: KeyMap = {
    B_KEY_DOWN: { sequence: "b", action: "keydown" },
    B_KEY_UP: { sequence: "b", action: "keyup" }
  };

  public keyHandlers = {
    B_KEY_DOWN: (): void => {
      console.log("B Key Down");
      this._test_oscillator.start();
    },
    B_KEY_UP: (): void => {
      console.log("B Key Up");
      this._test_oscillator.stop();
      this._test_oscillator.disconnect();
      this.setupTestOscillator();
    }
  };

  private setupTestNodegraph = (): void => {
    const oscId = new ObjectID().toHexString();
    this._test_nodegraph = nodeGraphFromState(
      {
        nodes: [{ id: oscId, type: "oscillator" }],
        connections: [
          {
            id: new ObjectID().toHexString(),
            fromId: oscId,
            fromPlug: "audio",
            toId: "destination",
            toPlug: "audio"
          }
        ]
      },
      this._context
    );
  };

  private setupTestOscillator = (): void => {
    this._test_oscillator = this._context.createOscillator();
    this._test_oscillator.type = "square";
    this._test_oscillator.frequency.setValueAtTime(
      440,
      this._context.currentTime
    );
    this._test_oscillator.connect(this._context.destination);
  };

  constructor() {
    this._context = vampAudioContext.getAudioContext();
    this._enabled = false;
    this.setupTestOscillator();
    this.setupTestNodegraph();
  }

  set enabled(enabled: boolean) {
    this._enabled = enabled;
  }

  get enabled(): boolean {
    return this._enabled;
  }
}

const FloorInstance = new Floor();

export { FloorInstance };
