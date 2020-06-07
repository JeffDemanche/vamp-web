/**
 * Resolvers for GraphQL queries and mutations that fetch *local* data.
 * Resolvers actually define what gets returned/mutated on an operation. For
 * instance, on the stop mutation, we actually want a few values in the local
 * cache to change, so we define that logic here.
 */

import { gql, Resolvers } from "apollo-boost";
import { InMemoryCache } from "apollo-cache-inmemory";
import { GET_PLAY_POSITION_START_TIME, GET_CLIPS } from "./queries";
import { Clip, Me, Audio } from "./cache";

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
    audio(id: ID!): Audio
    clip(id: ID!): Clip
    empty: Boolean
    me: Me
  }

  extend type Mutation {
    play: Boolean
    pause: Boolean
    stop: Boolean
    record: Boolean
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
    }
  }
};
