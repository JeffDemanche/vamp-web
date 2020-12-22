import { gql, Reference, useApolloClient } from "@apollo/client";
import { GetClientClipsClient_vamp_clientClips } from "./apollotypes";
import { loadedVampIdVar } from "./cache";

type ClientClip = GetClientClipsClient_vamp_clientClips;

/**
 * Adds a new client clip to the store after recording begins. At this
 * state, the realClipId is null, meaning that a "real clip" doesn't exist
 * yet, and inProgress is true, meaning the client clip is currently being
 * recorded.
 */
export const useBeginClientClip = (): ((
  start: number,
  audioStoreKey: string
) => void) => {
  const { cache } = useApolloClient();
  const loadedVampId = loadedVampIdVar();

  return (start: number, audioStoreKey: string): void => {
    console.log("beginClientClip");
    const data: ClientClip = {
      __typename: "ClientClip",
      audioStoreKey: audioStoreKey,
      realClipId: null,
      start: start,
      duration: -1,
      inProgress: true
    };

    const newClientClipRef = cache.writeFragment({
      data,
      fragment: gql`
        fragment NewClientClip on ClientClip {
          audioStoreKey
          realClipId
          start
          duration
          inProgress
        }
      `
    });

    cache.modify({
      id: cache.identify({ __typename: "Vamp", id: loadedVampId }),
      fields: {
        clientClips: (clientClips): ClientClip[] => {
          return [...clientClips, newClientClipRef];
        }
      }
    });
  };
};

/**
 * Called when recording ends, sets a client clip's inProgress property to
 * false, signifying that it's not being recorded.
 */
export const useEndClientClip = (): ((audioStoreKey: string) => void) => {
  const { cache } = useApolloClient();
  const loadedVampId = loadedVampIdVar();

  return (audioStoreKey: string): void => {
    console.log("endClientClip");
    const data: Partial<ClientClip> = {
      __typename: "ClientClip",
      audioStoreKey,
      inProgress: false
    };

    const clientClipRef = cache.writeFragment({
      data,
      fragment: gql`
        fragment ClientClipInProgress on ClientClip {
          audioStoreKey
          inProgress
        }
      `
    });

    cache.modify({
      id: cache.identify({ __typename: "Vamp", id: loadedVampId }),
      fields: {
        clientClips: (clientClips: Reference[], { readField }): Reference[] => {
          return clientClips.map(clientClip => {
            if (readField("audioStoreKey", clientClip) === audioStoreKey) {
              return clientClipRef;
            }
            return clientClip;
          });
        }
      }
    });
  };
};

/**
 * Sets the realClipId property on a client clip, signifying that a "real
 * clip" has been recieved and is ready for playback. The ID of that real
 * clip is the value of realClipId.
 */
export const useHandOffClientClip = (): ((
  audioStoreKey: string,
  realClipId: string
) => void) => {
  const { cache } = useApolloClient();
  const loadedVampId = loadedVampIdVar();

  return (audioStoreKey: string, realClipId: string): void => {
    console.log("handOffClientClip");
    const data: Partial<ClientClip> = {
      __typename: "ClientClip",
      audioStoreKey,
      realClipId
    };

    const clientClipRef = cache.writeFragment({
      data,
      fragment: gql`
        fragment ClientClipRealClipId on ClientClip {
          audioStoreKey
          realClipId
        }
      `
    });

    cache.modify({
      id: cache.identify({ __typename: "Vamp", id: loadedVampId }),
      fields: {
        clientClips: (clientClips: Reference[], { readField }): Reference[] => {
          return clientClips.map(clientClip => {
            if (readField("audioStoreKey", clientClip) === audioStoreKey) {
              return clientClipRef;
            }
            return clientClip;
          });
        }
      }
    });
  };
};

/**
 * Called to remove a client clip from the cache.
 */
export const useRemoveClientClip = (): ((audioStoreKey: string) => boolean) => {
  const { cache } = useApolloClient();
  const loadedVampId = loadedVampIdVar();

  return (audioStoreKey: string): boolean => {
    console.log("removeClientClip");
    let removed = false;
    cache.modify({
      id: cache.identify({ __typename: "Vamp", id: loadedVampId }),
      fields: {
        clientClips: (clientClips: Reference[], { readField }): Reference[] =>
          clientClips.filter(clientClip => {
            const r = readField("audioStoreKey", clientClip) !== audioStoreKey;
            removed = r ? true : removed;
            return r;
          })
      }
    });
    // Removes the now-unreachable client clip object from the cache.
    cache.gc();
    return removed;
  };
};
