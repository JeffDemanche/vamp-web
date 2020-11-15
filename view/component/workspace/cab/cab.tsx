import * as React from "react";

import { CabNew } from "./cab-new";
import { CabNewRecording } from "./cab-new-recording";
import CabMain from "./cab-main";
import CabMainRecording from "./cab-main-recording";

/**
 * This component is the root for all Cab types.
 */
interface CabProps {
  empty: boolean;
  recording: boolean;
}

const Cab: React.FunctionComponent<CabProps> = ({ empty, recording }) => {
  if (empty) {
    if (recording) {
      return <CabNewRecording />;
    } else {
      return <CabNew />;
    }
  } else {
    if (recording) {
      return (
        <>
          <CabMainRecording />
        </>
      );
    } else {
      return (
        <>
          <CabMain></CabMain>
        </>
      );
    }
  }
};

export { Cab };
