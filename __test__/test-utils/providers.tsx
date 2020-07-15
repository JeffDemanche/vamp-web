import {
  createApolloErrorProvider,
  createApolloMockedProvider,
  createApolloLoadingProvider
} from "apollo-mocked-provider";
import { typeDefs } from "./typeDefs";
import vampResolvers from "../../view/state/resolvers/vamp";
import audioResolvers from "../../view/state/resolvers/audio";
import { ApolloProvider } from "react-apollo";
// import clipResolvers from "../../view/state/resolvers/clip";

// source: https://www.freecodecamp.org/news/a-new-approach-to-mocking-graphql-data-1ef49de3d491/

export const ApolloMockedProvider = createApolloMockedProvider(typeDefs, {
  clientResolvers: [audioResolvers, vampResolvers],
  provider: ApolloProvider
});
export const ApolloErrorProvider = createApolloErrorProvider({
  provider: ApolloProvider
});
export const ApolloLoadingProvider = createApolloLoadingProvider({
  provider: ApolloProvider
});
