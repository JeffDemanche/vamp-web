import * as React from 'react';
import { ApolloProvider } from 'react-apollo';
import ApolloClient from 'apollo-client';
import {
  makeExecutableSchema,
  addMocksToSchema,
  ITypeDefinitions,
} from 'graphql-tools';
import { SchemaLink } from 'apollo-link-schema';
import { ApolloCache } from 'apollo-cache';
import { InMemoryCache } from 'apollo-boost';


/* 
    Purpose: get a component for custom data provider
    In: typeDefs and apollo cache
    Out: a component 
*/
export const createApolloMockedProvider = (
    typeDefs: ITypeDefinitions,
    apolloCache: ApolloCache<any> = new InMemoryCache,
) => ({
    customResolvers = {},
    children,
}:{
    customResolvers?: any;
    children: React.ReactChild | JSX.Element,
}) => {
    const schema = makeExecutableSchema({
        typeDefs,
        resolverValidationOptions: { requireResolversForResolveType: false },
    });
    
    addMocksToSchema({schema, mocks: customResolvers });

    const client = new ApolloClient({
        link: new SchemaLink({ schema }),
        cache: apolloCache,
    });

    return <ApolloProvider client={client}>{children}</ApolloProvider>;
};