import * as React from "react";

import { SettingNumeric } from "../../element/setting-numeric";

import { gql } from "apollo-boost";
import { useQuery, useMutation } from "@apollo/react-hooks";
import { useCurrentVampId } from "../../../react-hooks";
import { BPMClient, UpdateBPM } from "../../../state/apollotypes";

const BPM_CLIENT = gql`
  query BPMClient($vampId: ID!) {
    # loadedVampId @client @export(as: "vampId")
    vamp(id: $vampId) @client {
      bpm @client
    }
  }
`;

const UPDATE_BPM_MUTATION = gql`
  # See server typedefs for VampUpdateInput.
  mutation UpdateBPM($update: VampUpdateInput!) {
    updateVamp(update: $update) {
      # It's not really necessary to select anything here. For now the mutation
      # returns all the Vamp data, but we don't need it.
      bpm
    }
  }
`;

export const BPMSetting = (): JSX.Element => {
  const vampId = useCurrentVampId();
  const { data, loading, error } = useQuery<BPMClient>(BPM_CLIENT, {
    variables: { vampId }
  });
  const [
    updateBPM,
    { loading: updateLoading, error: updateError }
  ] = useMutation<UpdateBPM>(UPDATE_BPM_MUTATION);

  if (error) console.log(error);
  if (updateError) console.log(updateError);

  if (!data || loading || updateLoading) {
    return <div>Loading</div>;
  }

  return (
    <SettingNumeric
      value={data.vamp.bpm}
      integer={true}
      minValue={1}
      maxValue={499}
      text="BPM"
      onChange={(payload: number): void => {
        updateBPM({ variables: { update: { id: vampId, bpm: payload } } });
      }}
    ></SettingNumeric>
  );
};
