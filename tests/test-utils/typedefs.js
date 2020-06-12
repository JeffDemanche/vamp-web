const { gql } = require("apollo-server");

const typeDefs = gql`
  # See very bottom of
  # https://www.apollographql.com/docs/apollo-server/data/file-uploads/
  scalar Upload

  #GQL/Apollo schema
  type User {
    id: ID!
    username: String!
    email: String!
    vamps: [Vamp!]
  }

  type Vamp {
    id: ID!
    name: String!
    creator: User!
    bpm: Int!
    beatsPerBar: Int!
    metronomeSound: String!
    clips: [Clip]!
  }

  type Audio {
    id: ID!
    filename: String!
    uploader: User!
    storedLocally: Boolean!
    duration: Float!
  }

  type Clip {
    id: ID!
    audio: Audio!
    vamp: Vamp!
    user: User!
    # All times in seconds.
    start: Float!
  }

  type Query {
    user(id: ID!): User
    me: User
    vamp(id: ID!): Vamp
    clips(vampId: ID!): [Clip]
  }

  # Fields that can be used to update a Vamp
  input VampUpdateInput {
    id: ID!
    name: String
    bpm: Int
    beatsPerBar: Int
    metronomeSound: String
  }

  input AddClipInput {
    vampId: ID!
    userId: ID!
    file: Upload!
  }

  type Mutation {
    logout: User
    addUser(username: String!, email: String!): User
    addVamp(creatorId: ID!): Vamp
    addClip(clip: AddClipInput!): Clip

    updateVamp(update: VampUpdateInput!): Vamp!
  }

  type ClipSubscriptionOutput {
    mutation: String!
    updatedClip: Clip!
  }

  type Subscription {
    vamp(vampId: ID!): Vamp!
    clips(vampId: ID!): ClipSubscriptionOutput!
  }
`;

export default typeDefs;
