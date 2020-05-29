import * as React from "react";

import { SettingNumeric } from "../../element/setting-numeric";

import { gql } from "apollo-boost";
import { useQuery, useMutation } from "react-apollo";
import { useCurrentVampId } from "../../../react-hooks";

const BEATS_PER_BAR_QUERY = gql`
  query BeatsPerBar {
    beatsPerBar @client
  }
`;

const UPDATE_BEATS_PER_BAR_MUTATION = gql`
  mutation UpdateBeatsPerBar($update: VampUpdateInput!) {
    updateVamp(update: $update) {
      # We don't need to do anything with this.
      beatsPerBar
    }
  }
`;

export const BeatsPerBarSetting = (): JSX.Element => {
  const vampId = useCurrentVampId();
  const { data, loading, error } = useQuery(BEATS_PER_BAR_QUERY);
  const [
    updateBeatsPerBar,
    { loading: updateLoading, error: updateError }
  ] = useMutation(UPDATE_BEATS_PER_BAR_MUTATION);

  if (error) console.log(error);
  if (updateError) console.log(updateError);

  if (!data || loading || updateLoading) {
    return <div>Loading</div>;
  }

  return (
    <SettingNumeric
      value={data.beatsPerBar}
      integer={true}
      minValue={1}
      maxValue={499}
      text="/ Bar"
      onChange={(payload: number): void => {
        updateBeatsPerBar({
          variables: { update: { id: vampId, beatsPerBar: payload } }
        });
      }}
    ></SettingNumeric>
  );
};
