import * as React from "react";

import "bootstrap/dist/css/bootstrap.css";

import { VampButton } from "../../button";
import { useOverlay } from "../overlay";

export default { title: "Floating Overlay" };

const FullscreenOverlayComponent: React.FC<{}> = () => {
  const { Overlay, open } = useOverlay({
    absolute: { top: "5%", left: "5%", height: "90%", width: "90%" },
    backgroundBlur: 2,
    backgroundDarken: 0.2
  });

  return (
    <div>
      <VampButton
        onClick={(): void => {
          open();
        }}
      >
        Overlay Target
      </VampButton>
      <Overlay>Overlay content</Overlay>
    </div>
  );
};

export const fullscreenOverlay = (): JSX.Element => (
  <FullscreenOverlayComponent></FullscreenOverlayComponent>
);

fullscreenOverlay.story = {
  name: "Fullscreen Overlay"
};

const CenteredOverlayComponent: React.FC<{}> = () => {
  const { Overlay, open } = useOverlay({
    absolute: { height: "20%", width: "20%" },
    backgroundBlur: 2,
    backgroundDarken: 0.2
  });

  return (
    <div>
      <VampButton
        onClick={(): void => {
          open();
        }}
      >
        Overlay Target
      </VampButton>
      <Overlay>Overlay content</Overlay>
    </div>
  );
};

export const centeredOverlay = (): JSX.Element => (
  <CenteredOverlayComponent></CenteredOverlayComponent>
);

centeredOverlay.story = {
  name: "Centered Overlay"
};
