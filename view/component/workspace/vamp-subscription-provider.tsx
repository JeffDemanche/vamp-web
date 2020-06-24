import * as React from "react";
import { useEffect } from "react";
import { useQuery, useApolloClient } from "react-apollo";
import { gql } from "apollo-boost";

const VAMP_QUERY = gql`
  query GetVamp($id: ID!) {
    vamp(id: $id) {
      id
      name
      bpm
      beatsPerBar
      metronomeSound
    }
  }
`;

const VAMP_SUBSCRIPTION = gql`
  subscription vamp($vampId: ID!) {
    subVamp(vampId: $vampId) {
      id
      name
      bpm
      beatsPerBar
      metronomeSound
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
  const {
    subscribeToMore: vampSubscribeToMore,
    data: vampData,
    error: vampError
  } = useQuery(VAMP_QUERY, {
    variables: { id: vampId }
  });

  useEffect(() => {
    vampSubscribeToMore({
      document: VAMP_SUBSCRIPTION,
      variables: { vampId },
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data) return prev;
        const newVamp = subscriptionData.data.subVamp;
        client.writeData({ data: newVamp });

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

  client.writeData({ data: vampData.vamp });

  if (vampData.vamp == null) {
    return <div>Vamp not found :(</div>;
  } else {
    return <>{children}</>;
  }
};

export default VampSubscriptionProvider;
