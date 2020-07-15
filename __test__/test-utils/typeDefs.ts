export const typeDefs = `
input AddClipInput {
  start: Float
  vampId: ID!
  userId: ID!
  file: Upload!
  referenceId: ID
}

"""Audio database model"""
type Audio {
  id: ID!
  filename: String!
  uploader: User!
}

"""Clip database model"""
type Clip {
  id: ID!
  start: Float!
  user: User!
  vamp: Vamp!
  audio: Audio!
}

type ClipSubscriptionOutput {
  mutation: String!
  updatedClip: Clip!
  referenceId: ID
}

type Mutation {
  addClip(clip: AddClipInput!): Clip!
  logout: User!
  addUser(email: String!, username: String!): User!
  addVamp(creatorId: ID!): Vamp!
  updateVamp(update: VampUpdateInput!): Vamp
}

type Query {
  audio(id: ID!): Audio!
  clips(vampId: ID!): [Clip!]
  user(id: ID!): User!
  me: User
  vamp(id: ID!): Vamp
}

type Subscription {
  subClips(vampId: ID!): ClipSubscriptionOutput!
  subVamp(vampId: ID!): Vamp!
}

"""The \`Upload\` scalar type represents a file upload."""
scalar Upload

"""User database model"""
type User {
  id: ID!
  username: String!
  email: String!
  vamps: [Vamp!]!
}

"""Vamp database model"""
type Vamp {
  id: ID!
  name: String!
  creator: User!
  bpm: Int!
  beatsPerBar: Int!
  metronomeSound: String!
  clips: [Clip!]!
}

"""Vamp update input"""
input VampUpdateInput {
  id: ID!
  name: String
  bpm: Float
  beatsPerBar: Float
  metronomeSound: String
}
`;
