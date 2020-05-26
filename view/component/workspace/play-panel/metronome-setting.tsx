import * as React from "react";

import { SettingSelect } from "../../element/setting-select";

import { gql } from "apollo-boost";
import { useQuery, useApolloClient } from "react-apollo";

const METRONOME_SOUND_QUERY = gql`
  query MetronomeSound {
    metronomeSound @client
  }
`;

export const MetronomeSetting = (): JSX.Element => {
  const { data, loading } = useQuery(METRONOME_SOUND_QUERY);
  const client = useApolloClient();

  return (
    <SettingSelect
      value={data.metronomeSound}
      options={[
        { index: 1, value: "Hi-Hat" },
        { index: 2, value: "Beep" }
      ]}
      onChange={(payload: string): void => {
        client.writeData({ data: { metronomeSound: payload } });
      }}
    ></SettingSelect>
  );
};
