import * as React from "react";
import { gql, useQuery, useMutation } from "@apollo/client";
import { SettingNumeric } from "../../element/setting-numeric";
import { useCurrentVampId } from "../../../util/react-hooks";
import {
  BeatsPerBarClient,
  UpdateBeatsPerBar
} from "../../../state/apollotypes";

const BEATS_PER_BAR_CLIENT = gql`
  query BeatsPerBarClient($vampId: ID!) {
    # loadedVampId @client @export(as: "vampId")
    vamp(id: $vampId) @client {
      beatsPerBar @client
    }
  }
`;

const UPDATE_BEATS_PER_BAR = gql`
  mutation UpdateBeatsPerBar($update: VampUpdateInput!) {
    updateVamp(update: $update) {
      # We don't need to do anything with this.
      beatsPerBar
    }
  }
`;

export const BeatsPerBarSetting = (): JSX.Element => {
  const vampId = useCurrentVampId();
  const { data, loading, error } = useQuery<BeatsPerBarClient>(
    BEATS_PER_BAR_CLIENT,
    { variables: { vampId } }
  );
  const [
    updateBeatsPerBar,
    { loading: updateLoading, error: updateError }
  ] = useMutation<UpdateBeatsPerBar>(UPDATE_BEATS_PER_BAR);

  if (error) console.log(error);
  if (updateError) console.log(updateError);

  if (!data || loading || updateLoading) {
    return <div>Loading</div>;
  }

  return (
    <SettingNumeric
      value={data.vamp.beatsPerBar}
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
