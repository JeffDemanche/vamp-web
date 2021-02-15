import { FloorNode, FloorNodeType } from "./node";

const createOscillatorNode = (id: string): FloorNode => {
  return new FloorNode({
    id,
    name: "Oscillator",
    inputPlugs: [{ name: "frequency", value: 440 }],
    outputPlugs: [{ name: "audio" }]
  });
};

export const createNode = (id: string, type: FloorNodeType): FloorNode => {
  switch (type) {
    case "oscillator":
      return createOscillatorNode(id);
    default:
      throw new Error("Node type not supported.");
  }
};
