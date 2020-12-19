import { InMemoryCache, makeVar } from "@apollo/client";

export const loadedVampIdVar = makeVar<string>("");
export const usersInVampIds = makeVar<string[]>([]);

export const cache = new InMemoryCache({
  typePolicies: {
    Query: {
      fields: {
        loadedVampIdVar: (): string => loadedVampIdVar(),
        userInVamp: {
          keyArgs: ["userId", "vampId"]
        }
      }
    },
    Vamp: {
      fields: {
        clips: {
          read: (clips = []) => clips,
          merge: (existing, incoming) => incoming
        },
        tracks: {
          read: (tracks = []) => tracks,
          merge: (existing, incoming) => incoming
        },

        playing: (playing = false): boolean => playing,
        playPosition: (playPosition = 0): number => playPosition,
        playStartTime: (playStartTime = 0): number => playStartTime,
        start: (start = 0): number => start,
        end: (end = 0): number => end,
        loop: (loop = true): boolean => loop,
        recording: (recording = false): boolean => recording,
        clientClips: {
          read: (clientClips = []) => clientClips,
          merge: (existing, incoming) => incoming
        }
      }
    },
    Clip: {
      fields: {
        referenceId: (referenceId = null): string => referenceId,
        draggingInfo: (
          draggingInfo = {
            dragging: false,
            track: null as string,
            position: null as number
          }
        ): { dragging: boolean; track: string; position: number } =>
          draggingInfo
      }
    },
    ClientClip: {
      keyFields: ["audioStoreKey"],
      fields: {
        start: (start = 0): number => start,
        audioStoreKey: (audioStoreKey = ""): string => audioStoreKey,
        realClipId: (realClipId = ""): string => realClipId,
        inProgress: (inProgress = false): boolean => inProgress,
        duration: (duration = 0): number => duration
      }
    },
    Audio: {
      fields: {
        localFilename: (localFilename = ""): string => localFilename,
        storedLocally: (storedLocally = false): boolean => storedLocally,
        duration: (duration = -1): number => duration,
        error: (error: string = null): string => error
      }
    }
  }
});
