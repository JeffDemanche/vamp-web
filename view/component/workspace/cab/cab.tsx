import * as React from "react";

import { CabNew } from "./cab-new";
import { CabRecording } from "./cab-recording";

/**
 * This component is the root for all Cab types.
 */

interface CabProps {
  empty: boolean;
  recording: boolean;
}

const Cab: React.FunctionComponent<CabProps> = ({ empty, recording }) => {
  if (recording) {
    return <CabRecording></CabRecording>;
  } else if (empty) {
    return <CabNew></CabNew>;
  } else {
    return null;
    // TODO other Cab states.
  }
};

export { Cab };
