import * as React from "react";

import { SettingNumeric } from "../../element/setting-numeric";

import { gql } from "apollo-boost";
import { useQuery, useApolloClient } from "react-apollo";

const BEATS_PER_BAR_QUERY = gql`
  query BeatsPerBar {
    beatsPerBar @client
  }
`;

export const BeatsPerBarSetting = (): JSX.Element => {
  const { data, loading } = useQuery(BEATS_PER_BAR_QUERY);
  const client = useApolloClient();

  return (
    <SettingNumeric
      value={data.beatsPerBar}
      integer={true}
      minValue={1}
      maxValue={499}
      text="/ Bar"
      onChange={(payload: number): void => {
        client.writeData({ data: { beatsPerBar: payload } });
      }}
    ></SettingNumeric>
  );
};
