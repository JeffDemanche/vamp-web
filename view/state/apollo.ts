import { ApolloClient } from "apollo-client";
import { InMemoryCache } from "apollo-cache-inmemory";
import { WebSocketLink } from "apollo-link-ws";
import { split } from "apollo-link";
import { ApolloLink } from "apollo-link";
import { HttpLink } from "apollo-link-http";
import { createUploadLink } from "apollo-upload-client";
import { getMainDefinition } from "apollo-utilities";
import { typeDefs } from "./schema";
import { onError } from "apollo-link-error";
import defaults from "./defaults";
import vampResolvers from "./resolvers/vamp";
import audioResolvers from "./resolvers/audio";

/**
 * This *replaces* the httpLink while adding support for file uploads over GQL.
 */
const uploadLink = new createUploadLink({
  uri: "http://localhost:4567/graphql"
});

const wsLink = new WebSocketLink({
  uri: "ws://localhost:4567/graphql",
  options: {
    reconnect: true
  }
});

const terminatingLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === "OperationDefinition" &&
      definition.operation === "subscription"
    );
  },
  wsLink,
  uploadLink
);

const cache = new InMemoryCache();

const link = ApolloLink.from([
  onError(({ graphQLErrors, networkError }) => {
    if (graphQLErrors)
      graphQLErrors.forEach(({ message, locations, path }) =>
        console.log(
          `[GraphQL error]: Message: ${message},\
           Location: ${locations}, Path: ${path}`
        )
      );
    if (networkError) console.log(`[Network error]: ${networkError}`);
  }),
  terminatingLink
]);

const client = new ApolloClient({
  cache,
  link,
  typeDefs,
  resolvers: { ...vampResolvers, ...audioResolvers }
});

// Initialize cache to default values.
client.writeData({ data: defaults });

export { client };
