import { WebSocketLink } from "@apollo/client/link/ws";
import { onError } from "@apollo/client/link/error";
import { createUploadLink } from "apollo-upload-client";
import { getMainDefinition } from "@apollo/client/utilities";
import { ApolloClient, split, ApolloLink } from "@apollo/client";

import { typeDefs } from "./schema";
import { cache } from "./cache";

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

const link = ApolloLink.from([
  onError(({ graphQLErrors, networkError }) => {
    if (graphQLErrors)
      graphQLErrors.forEach(({ message, locations, path }) =>
        console.log(
          `[GraphQL error]: Message: ${message},\
           Location: ${locations.map(
             l => `${l.column} ${l.line}`
           )}\n Path:\n\t${path.join("\n\t")}`
        )
      );
    if (networkError)
      console.log(
        `[Network error]: ${networkError.name} ${networkError.message}`
      );
  }),
  terminatingLink
]);

const client = new ApolloClient({
  cache,
  link,
  typeDefs
});

export { client };
