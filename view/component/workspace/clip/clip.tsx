import * as React from "react";
import { useQuery } from "react-apollo";

import styles = require("./clip.less");
import { VIEW_STATE_CLIENT } from "../../../queries/vamp-queries";
import { ViewStateClient } from "../../../state/apollotypes";
import { useCurrentVampId } from "../../../react-hooks";
import { Oscilloscope } from "../oscilloscope/oscilloscope";

interface ClipProps {
  clip: {
    id: string;
    audio: {
      id: string;
      filename: string;
      storedLocally: boolean;
      localFilename: string;
      duration: number;
    };
  };
}

const Clip: React.FunctionComponent<ClipProps> = ({ clip }: ClipProps) => {
  const vampId = useCurrentVampId();
  const {
    data: { vamp }
  } = useQuery<ViewStateClient>(VIEW_STATE_CLIENT, { variables: { vampId } });

  const width = 100 * clip.audio.duration * vamp.viewState.temporalZoom;
  const opacity = clip.audio.storedLocally ? 1.0 : 0.7;

  const synced = clip.audio.filename !== "" ? "" : "not synced";

  return (
    <div className={styles["clip"]} style={{ width: width, opacity: opacity }}>
      <Oscilloscope
        audio={clip.audio}
        dimensions={{
          height: 150,
          width: width
        }}
      ></Oscilloscope>
      {synced}
    </div>
  );
};

export default Clip;
