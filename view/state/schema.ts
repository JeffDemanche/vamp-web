/**
 * Resolvers for GraphQL queries and mutations that fetch *local* data.
 * Resolvers actually define what gets returned/mutated on an operation. For
 * instance, on the stop mutation, we actually want a few values in the local
 * cache to change, so we define that logic here.
 */

import { gql, Resolvers, InMemoryCache } from "@apollo/client";

/**
 * Local schema.
 */
export const typeDefs = gql`
  extend type Audio {
    localFilename: String!
    storedLocally: Boolean!
    duration: Float!
    error: String
  }

  extend type Query {
    loadedVampId: String
    # empty: Boolean
  }

  extend type Mutation {
    # Vamp mutations
    play: Boolean
    pause: Boolean
    seek(time: Float!): Boolean
    setLoop(loop: Boolean!): Boolean
    stop: Boolean
    record: Boolean
    repeat: Boolean
    setTemporalZoom(temporalZoom: Float!, cumulative: Boolean): Boolean
    setViewLeft(viewLeft: Float!, cumulative: Boolean): Boolean
  }

  extend type Vamp {
    """
    Is the floor open in the workspace or not.
    """
    floorOpen: Boolean
  }

  extend type Clip {
    referenceId: ID
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
