import * as React from "react";
import { useEffect } from "react";
import { gql, useApolloClient, useQuery } from "@apollo/client";
import { GetVamp, VampSubscription } from "../../state/apollotypes";
import { ViewNotFound } from "../not-found/view-not-found";
import { ViewLoading } from "../loading/view-loading";
import { loadedVampIdVar } from "../../state/cache";
import { useHandOffClientClip } from "../../state/client-clip-state-hooks";

/**
 * This encompasses all the data that should be in the cache *when the page
 * loads*
 */
const VAMP_QUERY = gql`
  query GetVamp($id: ID!) {
    vamp(id: $id) {
      id
      name
      bpm
      beatsPerBar
      metronomeSound
      tracks {
        id
      }
      clips {
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
          storedLocally @client
          localFilename @client
          duration @client
        }
      }

      playing @client
      playPosition @client
      playStartTime @client
      start @client
      end @client
      loop @client
      recording @client
      clientClips @client {
        audioStoreKey
      }
    }
  }
`;

const VAMP_SUBSCRIPTION = gql`
  subscription VampSubscription($vampId: ID!) {
    subVamp(vampId: $vampId) {
      vampPayload {
        id
        name
        bpm
        beatsPerBar
        metronomeSound
        tracks {
          id
        }
        clips {
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
            storedLocally @client
            localFilename @client
            duration @client
          }
        }

        playing @client
        playPosition @client
        playStartTime @client
        start @client
        end @client
        loop @client
        recording @client
        clientClips @client {
          audioStoreKey
        }
      }
      addedClipId
      addedClipRefId
    }
  }
`;

interface VampProviderProps {
  vampId: string;
  children: React.ReactChild;
}

/**
 * Wraps around the ViewWorkspace component and handles subscription receptions
 * for general Vamp states. I.e. if the BPM get's changed it'll be handled here.
 */
// eslint-disable-next-line max-len
const VampProvider: React.FunctionComponent<VampProviderProps> = ({
  vampId,
  children
}: VampProviderProps) => {
  const client = useApolloClient();
  loadedVampIdVar(vampId);

  const handOffClientClip = useHandOffClientClip();

  const {
    subscribeToMore: vampSubscribeToMore,
    data: vampData,
    error: vampError,
    loading: vampLoading
  } = useQuery<GetVamp>(VAMP_QUERY, {
    variables: { id: vampId }
  });

  if (vampData) {
    client.writeQuery({
      query: VAMP_QUERY,
      variables: { id: vampId },
      data: vampData
    });
  }

  useEffect(() => {
    vampSubscribeToMore<VampSubscription>({
      document: VAMP_SUBSCRIPTION,
      variables: { vampId },
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data) return prev;

        const subVamp = subscriptionData.data.subVamp;

        if (subVamp.addedClipId && subVamp.addedClipRefId) {
          handOffClientClip(subVamp.addedClipRefId, subVamp.addedClipId);
        }

        const newVamp = subVamp.vampPayload;

        return {
          vamp: newVamp
        };
      }
    });
  }, []);

  if (vampError) {
    console.error(vampError);
  }
  if (vampLoading) {
    return <ViewLoading />;
  }
  if (!vampData) {
    return <ViewNotFound />;
  }
  if (vampData.vamp == null) {
    return <ViewNotFound />;
  } else {
    return <>{children}</>;
  }
};

export default VampProvider;
