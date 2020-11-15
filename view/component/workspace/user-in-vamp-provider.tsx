import * as React from "react";
import { gql, useApolloClient, useQuery } from "@apollo/client";
import { useEffect } from "react";
import { GetUserInVamp, UserInVampSubscription } from "../../state/apollotypes";

const USER_IN_VAMP_QUERY = gql`
  query GetUserInVamp($vampId: ID!, $userId: ID!) {
    userInVamp(vampId: $vampId, userId: $userId) {
      id
      vamp {
        id
      }
      user {
        id
      }
      cab {
        user {
          id
        }
        start
        duration
      }
    }
  }
`;

const USER_IN_VAMP_SUBSCRIPTION = gql`
  subscription UserInVampSubscription($userId: ID!, $vampId: ID!) {
    subUserInVamp(userId: $userId, vampId: $vampId) {
      id
      vamp {
        id
      }
      user {
        id
      }
      cab {
        user {
          id
        }
        start
        duration
      }
    }
  }
`;

interface UserInVampProviderProps {
  vampId: string;
  userId: string;
  children: React.ReactChild;
}

/**
 * This wrapper in the ViewWorkspace queries and subscribes to users in the
 * vamp. This will give us info about our user as well as other users that might
 * be collaborating on the Vamp.
 */
const UserInVampProvider: React.FunctionComponent<UserInVampProviderProps> = ({
  vampId,
  userId,
  children
}: UserInVampProviderProps) => {
  const client = useApolloClient();

  const { subscribeToMore, data, error, loading } = useQuery<GetUserInVamp>(
    USER_IN_VAMP_QUERY,
    { variables: { userId, vampId } }
  );

  if (data) {
    client.writeQuery({
      query: USER_IN_VAMP_QUERY,
      variables: { userId, vampId },
      data
    });
  }

  useEffect(() => {
    subscribeToMore<UserInVampSubscription>({
      document: USER_IN_VAMP_SUBSCRIPTION,
      variables: { userId, vampId },
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data) return prev;
        return { userInVamp: subscriptionData.data.subUserInVamp };
      }
    });
  });

  if (error) {
    console.error(error);
  }

  return <>{children}</>;
};

export default UserInVampProvider;
