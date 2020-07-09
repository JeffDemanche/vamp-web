import { gql } from "apollo-boost";

export const PLAY_CLIENT = gql`
  mutation PlayClient {
    play @client
  }
`;

export const PAUSE_CLIENT = gql`
  mutation PauseClient {
    pause @client
  }
`;

export const STOP_CLIENT = gql`
  mutation StopClient {
    stop @client
  }
`;

export const RECORD_CLIENT = gql`
  mutation RecordClient {
    record @client
  }
`;

export const SEEK_CLIENT = gql`
  mutation Seek($time: Float!) {
    seek(time: $time) @client
  }
`;

export const SET_VIEW_LEFT_CLIENT = gql`
  mutation SetViewLeftClient($viewLeft: Float!, $cumulative: Boolean) {
    setViewLeft(viewLeft: $viewLeft, cumulative: $cumulative) @client
  }
`;

export const SET_TEMPORAL_ZOOM_CLIENT = gql`
  mutation SetTemporalZoomClient($temporalZoom: Float!, $cumulative: Boolean) {
    setTemporalZoom(temporalZoom: $temporalZoom, cumulative: $cumulative)
      @client
  }
`;
