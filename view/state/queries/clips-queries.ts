import { gql } from "@apollo/client";

export const GET_CLIPS_SERVER = gql`
  query GetClipsServer($vampId: ID!) {
    clips(vampId: $vampId) {
      id
      start
      track {
        id
      }
      vamp {
        id
      }
      user {
        id
      }
      audio {
        id
        filename
      }
    }
  }
`;

export const GET_CLIPS_CLIENT = gql`
  query GetClipsClient($vampId: ID!) {
    # loadedVampId @client @export(as: "vampId")
    vamp(id: $vampId) @client {
      clips @client {
        id @client
        start @client
        audio @client {
          id @client
          filename @client
          localFilename @client
          storedLocally @client
          duration @client
          # uploader ?
        }
      }
    }
  }
`;

export const GET_CLIENT_CLIPS_CLIENT = gql`
  query GetClientClipsClient($vampId: ID!) {
    # loadedVampId @client @export(as: "vampId")
    vamp(id: $vampId) @client {
      clientClips {
        start
        audioStoreKey
        realClipId
        duration
        inProgress
        latencyCompensation
      }
    }
  }
`;
