import { InMemoryCache, makeVar, TypePolicies } from "@apollo/client";

export const loadedVampIdVar = makeVar<string>("");
export const usersInVampIds = makeVar<string[]>([]);

export const typePolicies: TypePolicies = {
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
      floorOpen: (floorOpen = false): boolean => floorOpen
    }
  },
  Clip: {
    fields: {
      draggingInfo: (
        draggingInfo = {
          dragging: false,
          track: null as string,
          position: null as number
        }
      ): { dragging: boolean; track: string; position: number } => draggingInfo
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
};

export const cache = new InMemoryCache({
  typePolicies
});
