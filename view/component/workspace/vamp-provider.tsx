import * as React from "react";
import { useEffect } from "react";
import { gql, useApolloClient, useQuery } from "@apollo/client";
import { GetVamp, VampSubscription } from "../../state/apollotypes";
import { ViewNotFound } from "../not-found/view-not-found";
import { ViewLoading } from "../loading/view-loading";
import { loadedVampIdVar } from "../../state/cache";
import { usePrevious } from "../../util/react-hooks";

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
        recordingId
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
        content {
          id
          type
          start
          duration
          offset
          audio {
            id
            filename
            storedLocally @client
            localFilename @client
            duration @client
            error @client
          }
        }
      }
      sections {
        id
        name
        bpm
        beatsPerBar
        metronomeSound
        startMeasure
        repetitions
        subSections {
          id
        }
      }
      forms {
        preSection {
          id
        }
        insertedSections {
          id
        }
        postSection {
          id
        }
      }
      floorOpen @client
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
          recordingId
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
          content {
            id
            type
            start
            duration
            offset
            audio {
              id
              filename
              storedLocally @client
              localFilename @client
              duration @client
              error @client
            }
          }
        }
        sections {
          id
          name
          bpm
          beatsPerBar
          metronomeSound
          startMeasure
          repetitions
          subSections {
            id
          }
        }
        forms {
          preSection {
            id
          }
          insertedSections {
            id
          }
          postSection {
            id
          }
        }
        floorOpen @client
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
// eslint-disable-next-line max-len
const VampProvider: React.FunctionComponent<VampProviderProps> = ({
  vampId,
  children
}: VampProviderProps) => {
  const client = useApolloClient();
  loadedVampIdVar(vampId);

  const {
    subscribeToMore: vampSubscribeToMore,
    data: vampData,
    error: vampError,
    loading: vampLoading,
    refetch
  } = useQuery<GetVamp>(VAMP_QUERY, {
    variables: { id: vampId }
  });

  const previousVampId = usePrevious(vampId);

  useEffect(() => {
    if (previousVampId !== vampId) {
      refetch({ vampId });
    }
  }, [vampId, previousVampId, refetch]);

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
  // Ensures that the Vamp is done loading before any children are rendered.
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
