import gql from "graphql-tag";

export const REMOVE_CLIP_SERVER = gql`
  mutation RemoveClipServer($vampId: ID!, $clipId: ID!) {
    removeClip(vampId: $vampId, clipId: $clipId)
  }
`;
