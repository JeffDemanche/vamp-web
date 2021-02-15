import ObjectID from "bson-objectid";

export class Connection {
  private _id: string;
  private _fromNodeId: string;
  private _fromNodePlugName: string;

  private _toNodeId: string | "destination";
  private _toNodePlugName: string | "destination";

  constructor(
    fromNodeId: string,
    fromNodePlugName: string,
    toNodeId: string,
    toNodePlugName: string
  ) {
    this._id = new ObjectID().toHexString();
    this._fromNodeId = fromNodeId;
    this._fromNodePlugName = fromNodePlugName;
    this._toNodeId = toNodeId;
    this._toNodePlugName = toNodePlugName;
  }

  get id(): string {
    return this._id;
  }

  get fromNodeId(): string {
    return this._fromNodeId;
  }

  get fromNodePlug(): string {
    return this._fromNodePlugName;
  }

  get toNodeId(): string {
    return this._toNodeId;
  }

  get toNodePlug(): string {
    return this._toNodePlugName;
  }
}

export type FloorNodeType = "oscillator";

export type ValueType = number | string;

interface FloorNodeInputPlug {
  name: string;
  value: ValueType;
}

interface FloorNodeOutputPlug {
  name: string;
  value?: ValueType;
}

export class FloorNode {
  private _id: string;
  private _name: string;

  private _inputPlugs: FloorNodeInputPlug[];
  private _outputPlugs: FloorNodeOutputPlug[];

  private _inputs: { [name: string]: Connection };
  private _outputs: Connection[];

  private _audioNode: () => AudioNode;

  constructor({
    id,
    name,
    inputPlugs,
    outputPlugs,
    audioNode
  }: {
    id?: string;
    name: string;
    inputPlugs: FloorNodeInputPlug[];
    outputPlugs: FloorNodeOutputPlug[];
    audioNode?: () => AudioNode;
  }) {
    id ? (this._id = id) : (this._id = new ObjectID().toHexString());
    this._name = name;
    this._inputPlugs = inputPlugs;
    this._outputPlugs = outputPlugs;
    this._audioNode = audioNode;
  }

  get id(): string {
    return this._id;
  }
}
