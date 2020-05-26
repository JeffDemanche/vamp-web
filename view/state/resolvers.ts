import { gql, Resolvers } from "apollo-boost";
import { InMemoryCache } from "apollo-cache-inmemory";
import { GET_PLAY_POSITION_START_TIME } from "./queries";

/**
 * Local schema.
 */
export const typeDefs = gql`
  extend type Mutation {
    play: Boolean
    pause: Boolean
    stop: Boolean
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
  Mutation: ResolverMap;
}

export const resolvers: AppResolvers = {
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
          playPosition:
            data.playPosition + (Date.now() - data.playStartTime) / 1000,
          playStartTime: -1
        }
      });
      return true;
    },
    stop: (parent, args, { cache }: { cache: InMemoryCache }): boolean => {
      cache.writeData({
        data: { playing: false, playPosition: 0, playStartTime: -1 }
      });
      return true;
    }
  }
};
