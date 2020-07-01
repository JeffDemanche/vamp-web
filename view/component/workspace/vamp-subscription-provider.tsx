import * as React from "react";
import { useEffect } from "react";
import { useQuery, useApolloClient } from "react-apollo";
import { gql } from "apollo-boost";
import { GetVamp, VampSubscription } from "../../state/apollotypes";

/**
 * Gets pretty much all Vamp information for the loaded vamp, except clips.
 */
const VAMP_QUERY = gql`
  query GetVamp($id: ID!) {
    vamp(id: $id) {
      id
      name
      bpm
      beatsPerBar
      metronomeSound
      clientClips @client {
        id @client
      }
      playing @client
      playPosition @client
      playStartTime @client
      start @client
      end @client
      loop @client
      recording @client
      viewState @client {
        temporalZoom @client
      }
    }
  }
`;

const VAMP_SUBSCRIPTION = gql`
  subscription VampSubscription($vampId: ID!) {
    subVamp(vampId: $vampId) {
      id
      name
      bpm
      beatsPerBar
      metronomeSound
      clientClips @client {
        id @client
      }
      playing @client
      playPosition @client
      playStartTime @client
      start @client
      end @client
      loop @client
      recording @client
      viewState @client {
        temporalZoom @client
      }
    }
  }
`;

interface VampSubscriptionProviderProps {
  vampId: string;
  children: React.ReactChild;
}

/**
 * Wraps around the ViewWorkspace component and handles subscription receptions
 * for general Vamp states. I.e. if the BPM get's changed it'll be handled here.
 */
// eslint-disable-next-line max-len
const VampSubscriptionProvider: React.FunctionComponent<VampSubscriptionProviderProps> = ({
  vampId,
  children
}: VampSubscriptionProviderProps) => {
  const client = useApolloClient();

  client.writeData({ data: { loadedVampId: vampId } });

  const {
    subscribeToMore: vampSubscribeToMore,
    data: vampData,
    error: vampError
  } = useQuery<GetVamp>(VAMP_QUERY, {
    variables: { id: vampId }
  });

  useEffect(() => {
    vampSubscribeToMore<VampSubscription>({
      document: VAMP_SUBSCRIPTION,
      variables: { vampId },
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data) return prev;
        const newVamp = subscriptionData.data.subVamp;

        return {
          vamp: newVamp
        };
      }
    });
  }, []);

  if (vampError) {
    console.error(vampError);
  }
  if (!vampData) {
    return <div>Loading...</div>;
  }

  if (vampData.vamp == null) {
    return <div>Vamp not found :(</div>;
  } else {
    return <>{children}</>;
  }
};

export default VampSubscriptionProvider;
