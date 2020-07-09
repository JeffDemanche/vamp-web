import * as React from "react";
import { gql } from "apollo-boost";
import { useMutation } from "react-apollo";
import { GetOrAddUserInVamp, UserInVampClient } from "../../state/apollotypes";
import { useEffect } from "react";
import { USER_IN_VAMP_CLIENT } from "../../state/queries/user-in-vamp-queries";

const USER_IN_VAMP_MUTATION = gql`
  mutation GetOrAddUserInVamp($vampId: ID!, $userId: ID!) {
    getOrAddUserInVamp(vampId: $vampId, userId: $userId) {
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
  // This server sidemutation is actaully used more like a query, but will fall
  // back to adding a UserInVamp to the database if one can't be found.
  const [getOrAddUserInVamp] = useMutation<GetOrAddUserInVamp>(
    USER_IN_VAMP_MUTATION
  );

  useEffect(() => {
    // Since getOrAddUserInVamp is a mutation as opposed to a query, it won't
    // automatically update the cache unless an entry with the same ID and type
    // name already exists in the cache. So we have to do the cache write
    // manually.
    if (vampId != null && userId != null) {
      getOrAddUserInVamp({
        variables: { vampId, userId },
        update: (cache, { data: { getOrAddUserInVamp } }) => {
          cache.writeQuery<UserInVampClient>({
            query: USER_IN_VAMP_CLIENT,
            variables: { vampId, userId },
            data: {
              userInVamp: getOrAddUserInVamp
            }
          });
        }
      });
    }
  }, []);

  return <>{children}</>;
};

export default UserInVampProvider;
