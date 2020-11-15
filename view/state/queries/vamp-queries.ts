import { gql } from "@apollo/client";

export const LOCAL_VAMP_ID_CLIENT = gql`
  query LocalVampIdClient {
    loadedVampId @client
  }
`;

export const PLAYING_CLIENT = gql`
  query PlayingClient($vampId: ID!) {
    vamp(id: $vampId) @client {
      playing @client
    }
  }
`;

export const RECORDING_CLIENT = gql`
  query RecordingClient($vampId: ID!) {
    vamp(id: $vampId) @client {
      recording @client
    }
  }
`;

export const PLAY_POSITION_START_TIME_CLIENT = gql`
  query PlayPositionStartTimeClient($vampId: ID!) {
    vamp(id: $vampId) @client {
      playPosition @client
      playStartTime @client
    }
  }
`;

export const METRONOME_INFO_CLIENT = gql`
  query MetronomeInfoClient($vampId: ID!) {
    vamp(id: $vampId) @client {
      bpm @client
      beatsPerBar @client
      metronomeSound @client
    }
  }
`;
