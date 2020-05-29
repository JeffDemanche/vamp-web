import { ApolloClient } from "apollo-client";
import { InMemoryCache } from "apollo-cache-inmemory";
import { initialCache } from "./initial-cache";
import { WebSocketLink } from "apollo-link-ws";
import { split } from "apollo-link";
import { ApolloLink } from "apollo-link";
import { HttpLink } from "apollo-link-http";
import { getMainDefinition } from "apollo-utilities";
import { resolvers, typeDefs } from "./resolvers";
import { onError } from "apollo-link-error";

const httpLink = new HttpLink({
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
  httpLink
);

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
  link,
  cache: new InMemoryCache(),
  typeDefs,
  resolvers
});

// Initialize cache to default values.
client.writeData({ data: initialCache });
client.onResetStore(async () => client.writeData({ data: initialCache }));

export { client };
