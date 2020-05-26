import ApolloClient from "apollo-boost";
import { InMemoryCache } from "apollo-cache-inmemory";
import { initialCache } from "./initial-cache";
import { WebSocketLink } from "apollo-link-ws";
import { split } from "apollo-link";
import { HttpLink } from "apollo-link-http";
import { getMainDefinition } from "apollo-utilities";
import { resolvers, typeDefs } from "./resolvers";

const cache = new InMemoryCache();

const client = new ApolloClient({
  uri: "http://localhost:4567/graphql",
  cache,
  typeDefs,
  resolvers
});
cache.writeData({ data: initialCache });
client.onResetStore(async () => cache.writeData({ data: initialCache }));

const httpLink = new HttpLink({
  uri: "http://localhost:4567/graphql"
});

const wsLink = new WebSocketLink({
  uri: "ws://localhost:4567/graphql",
  options: {
    reconnect: true
  }
});

const link = split(
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

export { client };
