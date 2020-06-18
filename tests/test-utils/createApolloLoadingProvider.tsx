import * as React from "react";
import ApolloClient from "apollo-client";
import { ApolloProvider } from "react-apollo";
import { ApolloLink, Observable } from "apollo-link";
import { ApolloCache } from "apollo-cache";
import { InMemoryCache } from "apollo-boost";

/* 
    Purpose: get a component for mocking loading provider
    In: apollo cache
    Out: a component with children we pass in  
 */

export const createApolloLoadingProvider = (
  apolloCache: ApolloCache<any> = new InMemoryCache()
) => ({
  children
}: {
  children: React.ReactChild | JSX.Element;
}): JSX.Element => {
  const link = new ApolloLink(() => {
    return new Observable(() => {});
  });

  const client = new ApolloClient({
    link,
    cache: apolloCache
  });

  return <ApolloProvider client={client}>{children}</ApolloProvider>;
};
