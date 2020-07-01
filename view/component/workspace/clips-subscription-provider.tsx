import * as React from "react";
import { useEffect } from "react";
import { useQuery, useApolloClient, useMutation } from "react-apollo";
import { gql } from "apollo-boost";
import { GET_CLIPS_SERVER } from "../../queries/clips-queries";
import {
  RemoveClientClip,
  GetClipsServer,
  ClipsSubscription
} from "../../state/apollotypes";

const CLIPS_SUBSCRIPTION = gql`
  subscription ClipsSubscription($vampId: ID!) {
    subClips(vampId: $vampId) {
      mutation
      updatedClip {
        id
        start
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
      }
      referenceId
    }
  }
`;

const REMOVE_CLIENT_CLIP = gql`
  mutation RemoveClientClip($tempFilename: String!) {
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
  } = useQuery<GetClipsServer>(GET_CLIPS_SERVER, {
    variables: { vampId }
  });

  const [removeClientClip] = useMutation<RemoveClientClip>(REMOVE_CLIENT_CLIP);

  const client = useApolloClient();

  useEffect(() => {
    clipsSubscribeToMore<ClipsSubscription>({
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
  // const localizeClips = (): Clip[] => {
  //   clipsData.clips.forEach(clip => {
  //     if (!clip.audio.storedLocally) clip.audio.storedLocally = false;
  //     if (!clip.audio.duration) clip.audio.duration = -1;
  //     if (!clip.audio.tempFilename) clip.audio.tempFilename = "";
  //   });
  //   return clipsData.clips;
  // };

  // console.log(clipsData.clips);
  client.writeData({
    data: { vamp: { __typename: "Vamp", id: vampId, clips: clipsData.clips } }
  });
  // const data = client.readQuery({
  //   query: gql`
  //     query Test($vampId: ID!) {
  //       vamp(id: $vampId) @client {
  //         id @client
  //         clips @client {
  //           id @client
  //           start @client
  //           audio @client {
  //             id @client
  //           }
  //         }
  //       }
  //     }
  //   `,
  //   variables: { vampId }
  // });
  // console.log(data);

  return <>{children}</>;
};

export default ClipsSubscriptionProvider;
