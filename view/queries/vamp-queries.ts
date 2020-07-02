import { gql } from "apollo-boost";

export const LOCAL_VAMP_ID_CLIENT = gql`
  query LocalVampIdClient {
    loadedVampId @client
  }
`;

export const PLAYING_CLIENT = gql`
  query PlayingClient($vampId: ID!) {
    # loadedVampId @client @export(as: "vampId")
    vamp(id: $vampId) @client {
      playing @client
    }
  }
`;

export const RECORDING_CLIENT = gql`
  query RecordingClient($vampId: ID!) {
    # loadedVampId @client @export(as: "vampId")
    vamp(id: $vampId) @client {
      recording @client
    }
  }
`;

export const VIEW_STATE_CLIENT = gql`
  query ViewStateClient($vampId: ID!) {
    # loadedVampId @client @export(as: "vampId")
    vamp(id: $vampId) @client {
      viewState @client {
        temporalZoom @client
      }
    }
  }
`;

export const PLAY_POSITION_START_TIME_CLIENT = gql`
  query PlayPositionStartTimeClient($vampId: ID!) {
    # loadedVampId @client @export(as: "vampId")
    vamp(id: $vampId) @client {
      playPosition @client
      playStartTime @client
    }
  }
`;
