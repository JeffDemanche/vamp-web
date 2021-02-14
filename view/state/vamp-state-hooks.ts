import { loadedVampIdVar } from "./cache";
import { useApolloClient } from "@apollo/client";
import { ME_CLIENT } from "./queries/user-queries";
import { MeClient, CabClient } from "./apollotypes";
import { CAB_CLIENT } from "./queries/user-in-vamp-queries";

export const usePlay = (): (() => void) => {
  const { cache } = useApolloClient();
  const loadedVampId = loadedVampIdVar();

  return (): void => {
    cache.modify({
      id: cache.identify({ __typename: "Vamp", id: loadedVampId }),
      fields: {
        playing: (): boolean => true,
        playStartTime: (): number => Date.now()
      }
    });
  };
};

export const usePause = (): (() => void) => {
  const { cache } = useApolloClient();
  const loadedVampId = loadedVampIdVar();

  return (): void => {
    cache.modify({
      id: cache.identify({ __typename: "Vamp", id: loadedVampId }),
      fields: {
        playing: (): boolean => false,
        recording: (): boolean => false,
        playPosition: (playPosition: number, { readField }): number => {
          const playStartTime = readField<number>("playStartTime");
          console.assert(
            playStartTime !== undefined && typeof playStartTime == "number"
          );
          return playPosition + (Date.now() - playStartTime) / 1000;
        }
      }
    });
  };
};

export const useSeek = (): ((time: number) => void) => {
  const { cache } = useApolloClient();
  const loadedVampId = loadedVampIdVar();

  return (time: number): void => {
    cache.modify({
      id: cache.identify({ __typename: "Vamp", id: loadedVampId }),
      fields: {
        recording: (): boolean => false,
        playPosition: (): number => time,
        playStartTime: (_, { readField }): number =>
          readField<boolean>("playing") ? Date.now() : -1
      }
    });
  };
};

export const useStop = (): (() => void) => {
  const { cache } = useApolloClient();
  const loadedVampId = loadedVampIdVar();

  return (): void => {
    const { me } = cache.readQuery<MeClient>({
      query: ME_CLIENT
    });
    const {
      userInVamp: { cab }
    } = cache.readQuery<CabClient>({
      query: CAB_CLIENT,
      variables: { vampId: loadedVampId, userId: me.id }
    });

    cache.modify({
      id: cache.identify({ __typename: "Vamp", id: loadedVampId }),
      fields: {
        playing: (): boolean => false,
        recording: (): boolean => false,
        playPosition: (): number => cab.start,
        playStartTime: (): number => -1
      }
    });
  };
};

export const useRecord = (): (() => void) => {
  const { cache } = useApolloClient();
  const loadedVampId = loadedVampIdVar();

  return (): void => {
    cache.modify({
      id: cache.identify({ __typename: "Vamp", id: loadedVampId }),
      fields: {
        playing: (): boolean => true,
        recording: (): boolean => true,
        playStartTime: (): number => Date.now()
      }
    });
  };
};

export const useSetLoop = (): ((loop: boolean) => void) => {
  const { cache } = useApolloClient();
  const loadedVampId = loadedVampIdVar();

  return (loop: boolean): void => {
    cache.modify({
      id: cache.identify({ __typename: "Vamp", id: loadedVampId }),
      fields: {
        loop: (): boolean => loop
      }
    });
  };
};

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
