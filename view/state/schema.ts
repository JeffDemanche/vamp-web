/**
 * Resolvers for GraphQL queries and mutations that fetch *local* data.
 * Resolvers actually define what gets returned/mutated on an operation. For
 * instance, on the stop mutation, we actually want a few values in the local
 * cache to change, so we define that logic here.
 */

import { gql, Resolvers } from "apollo-boost";
import { InMemoryCache } from "apollo-cache-inmemory";

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
    setLoop(loop: Boolean!): Boolean
    stop: Boolean
    record: Boolean
    repeat: Boolean
    setTemporalZoom(temporalZoom: Float!, cumulative: Boolean): Boolean
    setViewLeft(viewLeft: Float!, cumulative: Boolean): Boolean
    addClientClip(localFilename: String!, start: Float!): ClientClip
    removeClientClip(tempFilename: String!): Boolean
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

  ###
  # Client-side types
  ###

  type ViewState {
    # Seconds per 100 horizontal pixels.
    temporalZoom: Float

    # Position in seconds of the left view position.
    viewLeft: Float
  }

  type ClientClip {
    id: ID!
    start: Float!
    tempFilename: String!
    duration: Float!
    storedLocally: Boolean!
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
