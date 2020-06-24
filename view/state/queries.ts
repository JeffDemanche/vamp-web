/**
 * For now, just a repository of common GraphQL queries.
 */

import { gql } from "apollo-boost";

export const PLAYING = gql`
  query Playing {
    playing @client
  }
`;

export const GET_PLAY_POSITION_START_TIME = gql`
  query GetPlayPosition {
    playPosition @client
    playStartTime @client
  }
`;

export const GET_CLIPS = gql`
  query GetClips {
    clips @client {
      id @client
      audio @client {
        id @client
        filename @client
        tempFilename @client
        storedLocally @client
        duration @client
      }
    }
  }
`;

export const GET_CLIENT_CLIPS = gql`
  query GetClips {
    clientClips @client {
      id @client
      tempFilename @client
      start @client
    }
  }
`;
