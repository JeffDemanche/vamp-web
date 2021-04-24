import { gql, useQuery } from "@apollo/client";
import * as React from "react";
import { useEffect } from "react";
import { useSetFloorOpen } from "../../../util/vamp-state-hooks";
import { useCurrentVampId, usePrevious } from "../../../util/react-hooks";
import { useOverlay } from "../../element/overlay/overlay";
import { Floor } from "./floor";

const FLOOR_OVERLAY_WRAPPER_QUERY = gql`
  query FloorOverlayWrapper($vampId: ID!) {
    vamp(id: $vampId) @client {
      floorOpen
    }
  }
`;

export const FloorOverlay: React.FC<{}> = () => {
  const vampId = useCurrentVampId();

  const setFloorOpen = useSetFloorOpen();

  const {
    data: {
      vamp: { floorOpen }
    }
  } = useQuery(FLOOR_OVERLAY_WRAPPER_QUERY, {
    variables: { vampId }
  });

  const prevFloorOpen = usePrevious(floorOpen);

  const { Overlay, open, close } = useOverlay({
    absolute: { height: "80%", width: "90%" },
    backgroundBlur: 2,
    backgroundDarken: 0.2,
    onOpened: () => {
      setFloorOpen(true);
    },
    onClosed: () => {
      setFloorOpen(false);
    }
  });

  useEffect(() => {
    if (floorOpen === true && prevFloorOpen === false) {
      open();
    } else if (floorOpen === false && prevFloorOpen === true) {
      close();
    }
  }, [prevFloorOpen, floorOpen, open, close]);

  return (
    <Overlay>
      <Floor></Floor>
    </Overlay>
  );
};
