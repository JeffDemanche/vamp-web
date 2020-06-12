import * as React from 'react';
import { ApolloProvider } from 'react-apollo';
import ApolloClient from 'apollo-client';
import { GraphQLError } from 'graphql';
import { ApolloCache } from 'apollo-cache';
import { ApolloLink, Observable } from 'apollo-link';
import { InMemoryCache } from 'apollo-boost';


 /* 
  Purpose: get a component for mocking error provider
  In: an apollo cache
  Out: a component that takes in graphQLErrors and children we pass in
*/
const createApolloErrorProvider = (apolloCache: ApolloCache<any> = new InMemoryCache) => ({
  graphQLErrors,
  children,
}:{
  graphQLErrors: GraphQLError[];
  children: React.ReactNode | JSX.Element;
}) => {
  // for all operations going into the link, returns a specified error for every request
  const link = new ApolloLink(()=>{
    return new Observable(observer => {
      observer.next({
        errors: graphQLErrors,
      })
      observer.complete();
    })
  }) as any;

  const client = new ApolloClient({
    link,
    cache: apolloCache,
  })

  // wrap children in this custom client
  return <ApolloProvider client={client}>{children}</ApolloProvider>;
};

export default createApolloErrorProvider;
