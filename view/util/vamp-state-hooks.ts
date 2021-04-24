import { loadedVampIdVar } from "../state/cache";
import { gql, useApolloClient } from "@apollo/client";
import { ME_CLIENT } from "../state/queries/user-queries";
import {
  MeClient,
  CabClient,
  CountOffDurationQuery
} from "../state/apollotypes";
import { CAB_CLIENT } from "../state/queries/user-in-vamp-queries";

export const useCountOff = (): ((recordCountOff: boolean) => void) => {
  const { cache } = useApolloClient();
  const loadedVampId = loadedVampIdVar();

  const COUNT_OFF_DURATION_QUERY = gql`
    query CountOffDurationQuery($vampId: ID!) {
      vamp(id: $vampId) @client {
        countOff {
          duration
        }
      }
    }
  `;

  const {
    vamp: {
      countOff: { duration }
    }
  } = cache.readQuery<CountOffDurationQuery>({
    query: COUNT_OFF_DURATION_QUERY,
    variables: { vampId: loadedVampId }
  });

  return (recordCountOff = false): void => {
    const startTime = Date.now();
    cache.modify({
      id: cache.identify({ __typename: "Vamp", id: loadedVampId }),
      fields: {
        playStartTime: (): number => startTime + duration * 1000,
        recording: (recording): boolean => recordCountOff || recording,
        countingOff: (): boolean => true,
        countingOffStartTime: (): number => startTime
      }
    });
    // NOTE setTimeout isn't very accurate, so we try to handle actual audio
    // scheduling changes below this level (in scheduler.ts). The goal is that
    // this cache update affects only visual UI components, for which higher
    // error is acceptable.
    setTimeout(() => {
      cache.modify({
        id: cache.identify({ __typename: "Vamp", id: loadedVampId }),
        fields: {
          countingOff: (): boolean => false,
          countingOffStartTime: (): number => -1,
          playing: (): boolean => true
        }
      });
    }, duration * 1000);
  };
};

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
