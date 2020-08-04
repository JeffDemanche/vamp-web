import * as React from "react";

import { gql } from "apollo-boost";
import { useQuery, useMutation } from "@apollo/react-hooks";
import { useCurrentVampId } from "../../../react-hooks";
import { VampUpdateInput } from "../../../state/apollotypes";
import { SettingText } from "../../element/setting-text";

const NAME_CLIENT = gql`
  query NameClient($vampId: ID!) {
    # loadedVampId @client @export(as: "vampId")
    vamp(id: $vampId) @client {
      name @client
    }
  }
`;

const UPDATE_NAME_MUTATION = gql`
  # See server typedefs for VampUpdateInput.
  mutation UpdateName($update: VampUpdateInput!) {
    updateVamp(update: $update) {
      name
    }
  }
`;

export const TitleSetting = (): JSX.Element => {
  const vampId = useCurrentVampId();
  const { data, loading, error } = useQuery(NAME_CLIENT, {
    variables: { vampId }
  });
  const [
    updateName,
    { loading: updateLoading, error: updateError }
  ] = useMutation<VampUpdateInput>(UPDATE_NAME_MUTATION);

  if (error) console.log(error);
  if (updateError) console.log(updateError);

  if (!data || loading || updateLoading) {
    return <div>Loading</div>;
  }

  return (
    <SettingText
      value={data.vamp.name}
      onChange={(payload: string): void => {
        updateName({ variables: { update: { id: vampId, name: payload } } });
      }}
    ></SettingText>
  );
};
