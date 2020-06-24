/**
 * Resolvers for GraphQL queries and mutations that fetch *local* data.
 * Resolvers actually define what gets returned/mutated on an operation. For
 * instance, on the stop mutation, we actually want a few values in the local
 * cache to change, so we define that logic here.
 */

import { gql, Resolvers } from "apollo-boost";
import { InMemoryCache } from "apollo-cache-inmemory";
import {
  GET_PLAY_POSITION_START_TIME,
  GET_CLIPS,
  PLAYING,
  GET_CLIENT_CLIPS
} from "./queries";
import { Clip, Me, Audio, ClientClip } from "./cache";
import { v4 as uuidv4 } from "uuid";
import ObjectID from "bson-objectid";
import { ME } from "../build/view/queries/user-queries";

/**
 * Local schema.
 */
export const typeDefs = gql`
  type Clip {
    id: ID!
    audio: Audio!
  }

  type Audio {
    id: ID!
    filename: String
    localFilename: String!
    storedLocally: Boolean!
    duration: Float!
  }

  type Me {
    id: ID!
    username: String!
    email: String!
  }

  extend type Query {
    getAudio(id: ID!): Audio
    getClip(id: ID!): Clip
    empty: Boolean
    me: Me
  }

  extend type Mutation {
    play: Boolean
    pause: Boolean
    seek(time: Float!): Boolean
    stop: Boolean
    record: Boolean
    repeat: Boolean
    addClientClip(localFilename: String!, start: Float!): Clip
    removeClientClip(tempFilename: String!): Boolean
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

export const resolvers: AppResolvers = {
  Clip: {
    audio: (parent, args, { cache }: { cache: InMemoryCache }): Audio => {
      const data: {
        audio: Audio;
      } = cache.readQuery({
        query: gql`
          query GetAudio($audioId: ID!) {
            audio(id: $audioId) @client
          }
        `,
        variables: { id: parent.audio }
      });
      return data.audio;
    }
  },

  Query: {
    clip: (parent, args, { cache }: { cache: InMemoryCache }): Clip => {
      const data: {
        clips: Clip[];
      } = cache.readQuery({
        query: gql`
          query GetClips {
            clips @client {
              id
              audio
            }
          }
        `
      });
      return data.clips.find(clip => clip.id === args.id);
    },
    audio: (parent, args, { cache }: { cache: InMemoryCache }): Audio => {
      const data: {
        audios: Audio[];
      } = cache.readQuery({
        query: gql`
          query GetAudios {
            audios @client {
              id
              filename
              storedLocally
              duration
            }
          }
        `
      });
      return data.audios.find(audio => audio.id === args.id);
    },

    empty: (parent, args, { cache }: { cache: InMemoryCache }): boolean => {
      const data: {
        clips: Clip[];
      } = cache.readQuery({ query: GET_CLIPS });
      console.log(data);
      return data.clips.length == 0;
    }
  },

  Mutation: {
    play: (parent, args, { cache }: { cache: InMemoryCache }): boolean => {
      cache.writeData({ data: { playing: true, playStartTime: Date.now() } });
      return true;
    },
    pause: (parent, args, { cache }: { cache: InMemoryCache }): boolean => {
      const data: {
        playPosition: number;
        playStartTime: number;
      } = cache.readQuery({ query: GET_PLAY_POSITION_START_TIME });
      cache.writeData({
        data: {
          playing: false,
          recording: false,
          playPosition:
            data.playPosition + (Date.now() - data.playStartTime) / 1000,
          playStartTime: -1
        }
      });
      return true;
    },
    seek: (parent, args, { cache }: { cache: InMemoryCache }): boolean => {
      const data: {
        playing: boolean;
      } = cache.readQuery({ query: PLAYING });
      cache.writeData({
        data: {
          // TODO
          recording: false,
          playPosition: args.time,
          playStartTime: data.playing ? Date.now() : -1
        }
      });
      return true;
    },
    stop: (parent, args, { cache }: { cache: InMemoryCache }): boolean => {
      cache.writeData({
        data: {
          playing: false,
          recording: false,
          playPosition: 0,
          playStartTime: -1
        }
      });
      return true;
    },
    record: (parent, args, { cache }: { cache: InMemoryCache }): boolean => {
      cache.writeData({
        data: { playing: true, recording: true, playStartTime: Date.now() }
      });
      return true;
    },

    addClientClip: (
      parent,
      args,
      { cache }: { cache: InMemoryCache }
    ): ClientClip => {
      const clipsData: {
        clientClips: ClientClip[];
      } = cache.readQuery({ query: GET_CLIENT_CLIPS });
      const clientClipsCopy = [...clipsData.clientClips];
      const newClientClip = {
        __typename: "ClientClip",
        id: ObjectID.generate(),
        start: args.start,
        tempFilename: args.localFilename,
        duration: -1,
        storedLocally: false
      };
      clientClipsCopy.push(newClientClip);
      cache.writeData({
        data: { clientClips: clientClipsCopy }
      });
      return newClientClip;
    },
    removeClientClip: (
      parent,
      args,
      { cache }: { cache: InMemoryCache }
    ): boolean => {
      let removed = false;
      const clipsData: {
        clientClips: ClientClip[];
      } = cache.readQuery({ query: GET_CLIENT_CLIPS });
      const clientClipsCopy: ClientClip[] = [];
      clipsData.clientClips.forEach(clientClip => {
        if (clientClip.tempFilename == args.tempFilename) {
          removed = true;
        } else {
          clientClipsCopy.push(clientClip);
        }
      });
      cache.writeData({
        data: { clientClips: clientClipsCopy }
      });
      return removed;
    }
  }
};
