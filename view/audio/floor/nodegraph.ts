import { Connection, FloorNode, FloorNodeType } from "./nodes/node";
import { createNode } from "./nodes/node-factory";

export class NodeGraph {
  private _context: AudioContext;

  private _connections: { [id: string]: Connection };
  private _nodes: { [id: string]: FloorNode };

  constructor(context: AudioContext) {
    this._connections = {};
    this._nodes = {};
    this._context = context;
  }

  public addNode = (node: FloorNode): void => {
    this._nodes[node.id] = node;
  };

  public addConnection = (connection: Connection): void => {
    if (this.verifyConnection(connection)) {
      this._connections[connection.id] = connection;
    } else {
      throw new Error("Invalid connection.");
    }
  };

  public verifyConnection = (connection: Connection): boolean => {
    let verified = true;
    if (
      !this._nodes[connection.fromNodeId] ||
      (!this._nodes[connection.toNodeId] &&
        connection.toNodeId !== "destination")
    ) {
      verified = false;
    }
    return verified;
  };
}

/**
 * TODO This will eventually come from Apollo.
 */
interface StateType {
  nodes: {
    id: string;
    type: FloorNodeType;
  }[];
  connections: {
    id: string;
    fromId: string;
    fromPlug: string;
    toId: string;
    toPlug: string;
  }[];
}

export const nodeGraphFromState = (
  state: StateType,
  context: AudioContext
): NodeGraph => {
  const graph = new NodeGraph(context);
  state.nodes.forEach(node => {
    graph.addNode(createNode(node.id, node.type));
  });
  state.connections.forEach(connection => {
    graph.addConnection(
      new Connection(
        connection.fromId,
        connection.fromPlug,
        connection.toId,
        connection.toPlug
      )
    );
  });
  return graph;
};
