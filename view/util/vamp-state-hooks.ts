import { loadedVampIdVar } from "../state/cache";
import { useApolloClient } from "@apollo/client";

/**
 * Returns a function that will update the state of `floorOpen` when called. If
 * no arg is passed to that function, toggles floor, otherwise sets value of
 * `floorOpen` to the arg value.
 */
export const useSetFloorOpen = (): ((floorOpen?: boolean) => void) => {
  const { cache } = useApolloClient();
  const loadedVampId = loadedVampIdVar();

  return (floorOpen?: boolean): void => {
    cache.modify({
      id: cache.identify({ __typename: "Vamp", id: loadedVampId }),
      fields: {
        floorOpen: (prevOpen): boolean =>
          floorOpen === undefined ? !prevOpen : floorOpen
      }
    });
  };
};
