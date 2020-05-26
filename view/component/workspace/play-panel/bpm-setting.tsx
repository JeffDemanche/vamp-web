import * as React from "react";

import { SettingNumeric } from "../../element/setting-numeric";

import { gql } from "apollo-boost";
import { useQuery, useApolloClient } from "@apollo/react-hooks";

const BPM_QUERY = gql`
  query BPM {
    bpm @client
  }
`;

const BPM_SUBSCRIPTION = gql`
  subscription onBPMChanged {
    bpmChanged
  }
`;

export const BPMSetting = (): JSX.Element => {
  const { data, loading } = useQuery(BPM_QUERY);
  const client = useApolloClient();

  return (
    <SettingNumeric
      value={data.bpm}
      integer={true}
      minValue={1}
      maxValue={499}
      text="BPM"
      onChange={(payload: number): void => {
        client.writeData({ data: { bpm: payload } });
      }}
    ></SettingNumeric>
  );
};
