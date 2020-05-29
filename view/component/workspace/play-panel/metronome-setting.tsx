import * as React from "react";

import { SettingSelect } from "../../element/setting-select";

import { gql } from "apollo-boost";
import { useQuery, useMutation } from "react-apollo";
import { useCurrentVampId } from "../../../react-hooks";

const METRONOME_SOUND_QUERY = gql`
  query MetronomeSound {
    metronomeSound @client
  }
`;

const UPDATE_METRONOME_SOUND_MUTATION = gql`
  mutation UpdateMetronomeSound($update: VampUpdateInput!) {
    updateVamp(update: $update) {
      # We don't need to do anything with this.
      metronomeSound
    }
  }
`;

export const MetronomeSetting = (): JSX.Element => {
  const vampId = useCurrentVampId();
  const { data, loading, error } = useQuery(METRONOME_SOUND_QUERY);
  const [
    updateMetronomeSound,
    { loading: updateLoading, error: updateError }
  ] = useMutation(UPDATE_METRONOME_SOUND_MUTATION);

  if (error) console.log(error);
  if (updateError) console.log(updateError);

  if (!data || loading || updateLoading) {
    return <div>Loading</div>;
  }

  return (
    <SettingSelect
      value={data.metronomeSound}
      options={[
        { index: 1, value: "Hi-Hat" },
        { index: 2, value: "Beep" }
      ]}
      onChange={(payload: string): void => {
        updateMetronomeSound({
          variables: { update: { id: vampId, metronomeSound: payload } }
        });
      }}
    ></SettingSelect>
  );
};
