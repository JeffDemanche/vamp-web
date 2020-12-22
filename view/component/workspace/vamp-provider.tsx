import * as React from "react";
import {
  gql,
  useApolloClient,
  useQuery,
  useSubscription
} from "@apollo/client";
import {
  GetVamp,
  VampSubscription,
  VampSubscription_subVamp_vampPayload
} from "../../state/apollotypes";
import { ViewNotFound } from "../not-found/view-not-found";
import { ViewLoading } from "../loading/view-loading";
import { loadedVampIdVar } from "../../state/cache";
import { Modifier, Modifiers } from "@apollo/client/cache/core/types/common";

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
        duration
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
          error @client
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
        }
      }
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
const VampProvider: React.FunctionComponent<VampProviderProps> = ({
  vampId,
  children
}: VampProviderProps) => {
  const client = useApolloClient();
  const cache = client.cache;
  loadedVampIdVar(vampId);

  const { data: vampData, error: vampError, loading: vampLoading } = useQuery<
    GetVamp
  >(VAMP_QUERY, {
    variables: { id: vampId },
    onCompleted: (data: GetVamp) => {
      // This is necessary (for some reason) to load default local state data
      // into the cache when the workspace loads.
      client.writeQuery({
        query: VAMP_QUERY,
        variables: { id: vampId },
        data
      });
    }
  });

  useSubscription<VampSubscription>(VAMP_SUBSCRIPTION, {
    variables: { vampId },
    shouldResubscribe: true,
    onSubscriptionData: ({ client, subscriptionData }) => {
      if (subscriptionData.error) {
        //
      }
      if (subscriptionData.data) {
        const subVamp = subscriptionData.data.subVamp;

        const payload: VampSubscription_subVamp_vampPayload =
          subVamp.vampPayload;

        const updateFields: Modifiers | Modifier<unknown> = {};

        Object.entries(payload).forEach(([key, value]) => {
          if (key === "clips") return;
          if (value !== null && value !== undefined) {
            updateFields[key] = (): unknown => value;
          }
        });

        client.cache.modify({
          id: cache.identify({ __typename: "Vamp", id: vampId }),
          fields: updateFields
        });
      }
    }
  });

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
