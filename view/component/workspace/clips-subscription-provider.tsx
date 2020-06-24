import * as React from "react";
import { useEffect, useState } from "react";
import { useQuery, useApolloClient, useMutation } from "react-apollo";
import { gql } from "apollo-boost";
import { Clip } from "../../state/cache";
import { GET_CLIPS } from "../../state/queries";

const CLIPS_QUERY = gql`
  query Clips($vampId: ID!) {
    clips(vampId: $vampId) {
      id
      start
      audio {
        id
        filename
      }
    }
  }
`;

const CLIPS_SUBSCRIPTION = gql`
  subscription clips($vampId: ID!) {
    subClips(vampId: $vampId) {
      mutation
      updatedClip {
        id
        start
        audio {
          id
          filename
        }
        user {
          id
        }
        vamp {
          id
        }
      }
      referenceId
    }
  }
`;

const REMOVE_CLIENT_CLIP = gql`
  mutation RemoveClientClip($tempFilename: string) {
    removeClientClip(tempFilename: $tempFilename) @client
  }
`;

interface ClipsSubscriptionProviderProps {
  vampId: string;
  children: React.ReactChild;
}

/**
 * Wraps around the ViewWorkspace component and handles the Clips subscription.
 * Also plays a role in juggling ClientClips handing off to proper Clips.
 */
// eslint-disable-next-line max-len
const ClipsSubscriptionProvider: React.FunctionComponent<ClipsSubscriptionProviderProps> = ({
  vampId,
  children
}: ClipsSubscriptionProviderProps) => {
  const {
    subscribeToMore: clipsSubscribeToMore,
    data: clipsData,
    error: clipsError
  } = useQuery(CLIPS_QUERY, {
    variables: { vampId }
  });

  const [removeClientClip] = useMutation(REMOVE_CLIENT_CLIP);

  const client = useApolloClient();

  useEffect(() => {
    clipsSubscribeToMore({
      document: CLIPS_SUBSCRIPTION,
      variables: { vampId },
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data) return prev;
        if (subscriptionData.data.subClips.mutation === "ADDED") {
          const newClips = prev.clips ? [...prev.clips] : [];
          newClips.push(subscriptionData.data.subClips.updatedClip);

          const refId = subscriptionData.data.subClips.referenceId;
          if (refId) {
            removeClientClip({ variables: { tempFilename: refId } });
          }

          console.log(subscriptionData.data);
          console.log("Clip subscription updated");
          return { clips: newClips };
        }
      }
    });
  }, []);

  if (clipsError) {
    console.error(clipsError);
  }

  if (!clipsData) {
    return <div>Loading...</div>;
  }

  // TODO should definitely be rethought/put in a different file. Fills in clip
  // fields that we don't get from the clips query but need client-side.
  const localizeClips = (): Clip[] => {
    clipsData.clips.forEach((clip: Clip) => {
      clip.__typename == "Clip";
      clip.audio.__typename = "Audio";
      if (!clip.audio.storedLocally) clip.audio.storedLocally = false;
      if (!clip.audio.duration) clip.audio.duration = -1;
      if (!clip.audio.tempFilename) clip.audio.tempFilename = "";
    });
    return clipsData.clips;
  };

  client.writeData({
    data: { clips: localizeClips() }
  });

  return <>{children}</>;
};

export default ClipsSubscriptionProvider;
