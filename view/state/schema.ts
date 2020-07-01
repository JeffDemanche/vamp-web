/**
 * Resolvers for GraphQL queries and mutations that fetch *local* data.
 * Resolvers actually define what gets returned/mutated on an operation. For
 * instance, on the stop mutation, we actually want a few values in the local
 * cache to change, so we define that logic here.
 */

import { gql, Resolvers } from "apollo-boost";
import { InMemoryCache } from "apollo-cache-inmemory";
import { Clip, ClientClip } from "./cache";
import ObjectID from "bson-objectid";
import {
  PLAYING_CLIENT,
  PLAY_POSITION_START_TIME_CLIENT,
  LOCAL_VAMP_ID_CLIENT
} from "../queries/vamp-queries";
import {
  GET_CLIPS_SERVER,
  GET_CLIENT_CLIPS_CLIENT
} from "../queries/clips-queries";
import {
  LocalVampIdClient,
  PlayingClient,
  GetClientClipsClient,
  GetClientClipsClient_vamp_clientClips,
  AddClientClip_addClientClip
} from "./apollotypes";

/**
 * Local schema.
 */
export const typeDefs = gql`
  extend type Audio {
    localFilename: String!
    storedLocally: Boolean!
    duration: Float!
  }

  extend type Query {
    loadedVampId: String
    empty: Boolean
  }

  extend type Mutation {
    play: Boolean
    pause: Boolean
    seek(time: Float!): Boolean
    stop: Boolean
    record: Boolean
    repeat: Boolean
    addClientClip(localFilename: String!, start: Float!): ClientClip
    removeClientClip(tempFilename: String!): Boolean
  }

  type ViewState {
    # Seconds per 100 horizontal pixels.
    temporalZoom: Float
  }

  type ClientClip {
    id: ID!
    start: Float!
    tempFilename: String!
    duration: Float!
    storedLocally: Boolean!
  }

  extend type Vamp {
    playing: Boolean

    # The position in seconds of the current position before play was pressed.
    playPosition: Float

    # The Date.now() value of the instant when playing began, or -1 if not
    # playing. The true current time when playing will be playPosition +
    # (Date.now() - playStartTime) / 1000.
    playStartTime: Int

    start: Float
    end: Float
    loop: Boolean

    recording: Boolean

    clientClips: [ClientClip]

    viewState: ViewState
  }
`;

type ResolverFn = (
  parent: any,
  args: any,
  { cache }: { cache: InMemoryCache }
) => any;

interface ResolverMap {
  [field: string]: ResolverFn;
}

interface AppResolvers extends Resolvers {
  Clip: ResolverMap;
  Query: ResolverMap;
  Mutation: ResolverMap;
}

const defaults = {
  Vamp: {
    playing: false,
    playPosition: 0,
    playStartTime: 0,
    start: 0,
    end: 0,
    loop: true,
    recording: false,
    viewState: {
      __typename: "ViewState",

      /**
       * Hundred pixels per second.
       */
      temporalZoom: 1
    }
  },
  Audio: {
    localFilename: "",
    storedLocally: false,
    duration: -1
  }
};

export const resolvers: AppResolvers = {
  Vamp: {
    // Default resolvers.
    playing: (): boolean => defaults.Vamp.playing,
    playPosition: (): number => defaults.Vamp.playPosition,
    playStartTime: (): number => defaults.Vamp.playStartTime,
    start: (): number => defaults.Vamp.start,
    end: (): number => defaults.Vamp.end,
    loop: (): boolean => defaults.Vamp.loop,
    recording: (): boolean => defaults.Vamp.recording,
    viewState: (): typeof defaults.Vamp.viewState => defaults.Vamp.viewState,
    clientClips: () => []
  },

  Clip: {},

  Audio: {
    localFilename: (): string => defaults.Audio.localFilename,
    storedLocally: (): boolean => defaults.Audio.storedLocally,
    duration: (): number => defaults.Audio.duration
  },

  Query: {
    empty: (parent, args, { cache }: { cache: InMemoryCache }): boolean => {
      const data: {
        clips: Clip[];
      } = cache.readQuery({ query: GET_CLIPS_SERVER });
      return data.clips.length == 0;
    }
  },

  Mutation: {
    play: (parent, args, { cache }: { cache: InMemoryCache }): boolean => {
      const { loadedVampId: vampId } = cache.readQuery<LocalVampIdClient>({
        query: LOCAL_VAMP_ID_CLIENT
      });
      cache.writeData({
        data: {
          vamp: {
            __typename: "Vamp",
            id: vampId,
            playing: true,
            playStartTime: Date.now()
          }
        }
      });
      return true;
    },
    pause: (parent, args, { cache }: { cache: InMemoryCache }): boolean => {
      const { loadedVampId: vampId } = cache.readQuery<LocalVampIdClient>({
        query: LOCAL_VAMP_ID_CLIENT
      });
      const data: {
        playPosition: number;
        playStartTime: number;
      } = cache.readQuery({
        query: PLAY_POSITION_START_TIME_CLIENT,
        variables: { vampId }
      });
      cache.writeData({
        data: {
          vamp: {
            __typename: "Vamp",
            id: vampId,
            playing: false,
            recording: false,
            playPosition:
              data.playPosition + (Date.now() - data.playStartTime) / 1000,
            playStartTime: -1
          }
        }
      });
      return true;
    },
    seek: (parent, args, { cache }: { cache: InMemoryCache }): boolean => {
      const { loadedVampId: vampId } = cache.readQuery<LocalVampIdClient>({
        query: LOCAL_VAMP_ID_CLIENT
      });
      const data: {
        vamp: {
          playing: boolean;
        };
      } = cache.readQuery<PlayingClient>({
        query: PLAYING_CLIENT,
        variables: { vampId }
      });
      cache.writeData({
        data: {
          vamp: {
            __typename: "Vamp",
            id: vampId,
            recording: false,
            playPosition: args.time,
            playStartTime: data.vamp.playing ? Date.now() : -1
          }
        }
      });
      return true;
    },
    stop: (parent, args, { cache }: { cache: InMemoryCache }): boolean => {
      const { loadedVampId: vampId } = cache.readQuery<LocalVampIdClient>({
        query: LOCAL_VAMP_ID_CLIENT
      });
      cache.writeData({
        data: {
          vamp: {
            __typename: "Vamp",
            id: vampId,
            playing: false,
            recording: false,
            playPosition: 0,
            playStartTime: -1
          }
        }
      });
      return true;
    },
    record: (parent, args, { cache }: { cache: InMemoryCache }): boolean => {
      const { loadedVampId: vampId } = cache.readQuery<LocalVampIdClient>({
        query: LOCAL_VAMP_ID_CLIENT
      });
      cache.writeData({
        data: {
          vamp: {
            __typename: "Vamp",
            id: vampId,
            playing: true,
            recording: true,
            playStartTime: Date.now()
          }
        }
      });
      return true;
    },

    addClientClip: (
      parent,
      args,
      { cache }: { cache: InMemoryCache }
    ): AddClientClip_addClientClip => {
      const { loadedVampId: vampId } = cache.readQuery<LocalVampIdClient>({
        query: LOCAL_VAMP_ID_CLIENT
      });
      const clipsData = cache.readQuery<GetClientClipsClient>({
        query: GET_CLIENT_CLIPS_CLIENT,
        variables: { vampId }
      });
      const clientClipsCopy = [...clipsData.vamp.clientClips];
      const newClientClip: GetClientClipsClient_vamp_clientClips = {
        __typename: "ClientClip",
        id: ObjectID.generate(),
        start: args.start,
        tempFilename: args.localFilename,
        duration: -1,
        storedLocally: false
      };
      clientClipsCopy.push(newClientClip);
      cache.writeData({
        data: {
          vamp: { __typename: "Vamp", id: vampId, clientClips: clientClipsCopy }
        }
      });
      return newClientClip;
    },
    removeClientClip: (
      parent,
      args,
      { cache }: { cache: InMemoryCache }
    ): boolean => {
      const { loadedVampId: vampId } = cache.readQuery<LocalVampIdClient>({
        query: LOCAL_VAMP_ID_CLIENT
      });
      let removed = false;
      const clipsData = cache.readQuery<GetClientClipsClient>({
        query: GET_CLIENT_CLIPS_CLIENT,
        variables: { vampId }
      });
      const clientClipsCopy: ClientClip[] = [];
      clipsData.vamp.clientClips.forEach(clientClip => {
        if (clientClip.tempFilename == args.tempFilename) {
          removed = true;
        } else {
          clientClipsCopy.push(clientClip);
        }
      });
      cache.writeData({
        data: {
          vamp: { __typename: "Vamp", id: vampId, clientClips: clientClipsCopy }
        }
      });
      return removed;
    }
  }
};
