import * as React from "react";
import * as styles from "./cab.less";
import gql from "graphql-tag";
import { useCurrentVampId, useTrueTime } from "../../../react-hooks";
import { useQuery } from "react-apollo";
import { CabMainRecording } from "../../../state/apollotypes";

const CAB_MAIN_RECORDING_QUERY = gql`
  query CabMainRecording($vampId: ID!) {
    vamp(id: $vampId) @client {
      viewState @client {
        temporalZoom @client
      }
    }
  }
`;

const CabMainRecording: React.FC = () => {
  const vampId = useCurrentVampId();
  const {
    data: {
      vamp: { viewState }
    }
  } = useQuery<CabMainRecording>(CAB_MAIN_RECORDING_QUERY, {
    variables: { vampId }
  });

  const trueTime = useTrueTime(200);

  const width = `${100 * trueTime * viewState.temporalZoom}px`;

  return <div style={{ width }} className={styles["cab-recording"]}></div>;
};

export default CabMainRecording;
