import { gql, useQuery } from "@apollo/client";
import * as React from "react";
import { useEffect } from "react";
import { useFloor } from "../../util/audio-module-hooks";
import { useCurrentVampId, usePrevious } from "../../util/react-hooks";

const FLOOR_ADAPTER_QUERY = gql`
  query FloorAdapter($vampId: ID!) {
    vamp(id: $vampId) @client {
      floorOpen
    }
  }
`;

export const FloorAdapter: React.FC<{}> = () => {
  const vampId = useCurrentVampId();

  const {
    data: {
      vamp: { floorOpen }
    }
  } = useQuery(FLOOR_ADAPTER_QUERY, { variables: { vampId } });

  const prevFloorOpen = usePrevious(floorOpen);

  const floor = useFloor();

  useEffect(() => {
    if (floorOpen === true && prevFloorOpen === false) {
      floor.enabled = true;
    } else if (floorOpen === false && prevFloorOpen === true) {
      floor.enabled = false;
    }
  }, [floor, floorOpen, prevFloorOpen]);

  return null;
};
