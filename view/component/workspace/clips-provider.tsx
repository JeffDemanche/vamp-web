import * as React from "react";
import { useEffect } from "react";
import { useQuery, useApolloClient, useMutation } from "react-apollo";
import { gql } from "apollo-boost";
import {
  GetClipsServer,
  ClipsSubscription,
  GetClipsServer_clips,
  HandOffClientClip
} from "../../state/apollotypes";
import { ViewLoading } from "../loading/view-loading";
import { ViewNotFound } from "../not-found/view-not-found";
import { GET_CLIPS_SERVER } from "../../state/queries/clips-queries";

const CLIPS_SUBSCRIPTION = gql`
  subscription ClipsSubscription($vampId: ID!) {
    subClips(vampId: $vampId) {
      mutation
      updatedClip {
        id
        start
        track {
          id
        }
        audio {
          id
          filename
          localFilename @client
          storedLocally @client
          duration @client
        }
        user {
          id
        }
        vamp {
          id
        }
        draggingInfo @client {
          dragging @client
          track @client
          position @client
        }
      }
      referenceId
    }
  }
`;

const HAND_OFF_CLIENT_CLIP = gql`
  mutation HandOffClientClip($audioStoreKey: String!, $realClipId: ID!) {
    handOffClientClip(audioStoreKey: $audioStoreKey, realClipId: $realClipId)
      @client
  }
`;

interface ClipsProviderProps {
  vampId: string;
  children: React.ReactChild;
}

/**
 * Wraps around the ViewWorkspace component and handles the Clips subscription.
 * Also plays a role in juggling ClientClips handing off to proper Clips.
 */
// eslint-disable-next-line max-len
const ClipsProvider: React.FunctionComponent<ClipsProviderProps> = ({
  vampId,
  children
}: ClipsProviderProps) => {
  const {
    subscribeToMore: clipsSubscribeToMore,
    data: clipsData,
    error: clipsError,
    loading: clipsLoading
  } = useQuery<GetClipsServer>(GET_CLIPS_SERVER, {
    variables: { vampId }
  });

  const [handOffClientClip] = useMutation<HandOffClientClip>(
    HAND_OFF_CLIENT_CLIP
  );

  const client = useApolloClient();

  useEffect(() => {
    clipsSubscribeToMore<ClipsSubscription>({
      document: CLIPS_SUBSCRIPTION,
      variables: { vampId },
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data) return prev;
        if (subscriptionData.data.subClips.mutation === "ADDED") {
          const newClips = prev.clips ? [...prev.clips] : [];
          const addedClip = subscriptionData.data.subClips.updatedClip;
          newClips.push(addedClip);
          const refId = subscriptionData.data.subClips.referenceId;
          if (refId) {
            handOffClientClip({
              variables: { audioStoreKey: refId, realClipId: addedClip.id }
            });
          }
          return { clips: newClips };
        } else if (subscriptionData.data.subClips.mutation === "REMOVED") {
          const newClips: GetClipsServer_clips[] = [];
          prev.clips.forEach(clip => {
            if (clip.id != subscriptionData.data.subClips.updatedClip.id) {
              newClips.push(clip);
            }
          });
          return { clips: newClips };
        }
      }
    });
  }, []);

  if (clipsError) {
    console.error(clipsError);
  }
  if (clipsLoading) {
    return <ViewLoading />;
  }
  if (!clipsData) {
    return <ViewNotFound />;
  }
  client.writeData({
    data: { vamp: { __typename: "Vamp", id: vampId, clips: clipsData.clips } }
  });

  return <>{children}</>;
};

export default ClipsProvider;
