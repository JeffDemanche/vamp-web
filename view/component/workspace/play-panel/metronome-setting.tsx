import * as React from "react";
import { gql, useQuery, useMutation } from "@apollo/client";
import { SettingSelect } from "../../element/setting-select";
import { useCurrentVampId } from "../../../util/react-hooks";
import {
  MetronomeSoundClient,
  UpdateMetronomeSound
} from "../../../state/apollotypes";

const METRONOME_SOUND_CLIENT = gql`
  query MetronomeSoundClient($vampId: ID!) {
    # loadedVampId @client @export(as: "vampId")
    vamp(id: $vampId) @client {
      metronomeSound @client
    }
  }
`;

const UPDATE_METRONOME_SOUND = gql`
  mutation UpdateMetronomeSound($update: VampUpdateInput!) {
    updateVamp(update: $update) {
      # We don't need to do anything with this.
      metronomeSound
    }
  }
`;

export const MetronomeSetting = (): JSX.Element => {
  const vampId = useCurrentVampId();
  const { data, loading, error } = useQuery<MetronomeSoundClient>(
    METRONOME_SOUND_CLIENT,
    { variables: { vampId } }
  );
  const [
    updateMetronomeSound,
    { loading: updateLoading, error: updateError }
  ] = useMutation<UpdateMetronomeSound>(UPDATE_METRONOME_SOUND);

  if (error) console.log(error);
  if (updateError) console.log(updateError);

  if (!data || loading || updateLoading) {
    return <div>Loading</div>;
  }

  return (
    <SettingSelect
      value={data.vamp.metronomeSound}
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
