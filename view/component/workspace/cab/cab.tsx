import * as React from "react";

import { CabNew } from "./cab-new";
import { CabNewRecording } from "./cab-new-recording";
import CabMain from "./cab-main";
import VerticalSpacer from "../../element/vertical-spacer";

/**
 * This component is the root for all Cab types.
 */

interface CabProps {
  empty: boolean;
  recording: boolean;
}

const Cab: React.FunctionComponent<CabProps> = ({ empty, recording }) => {
  if (recording) {
    return <CabNewRecording></CabNewRecording>;
  } else if (empty) {
    return <CabNew></CabNew>;
  } else {
    return (
      <>
        <VerticalSpacer height={50}></VerticalSpacer>
        <CabMain></CabMain>
      </>
    );
  }
};

export { Cab };
