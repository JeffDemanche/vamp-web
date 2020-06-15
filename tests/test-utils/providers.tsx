import {createApolloErrorProvider} from './createApolloErrorProvider';
import {createApolloLoadingProvider} from './createApolloLoadingProvider';
import {createApolloMockedProvider} from './createApolloMockedProvider';
import typeDefs from './typedefs';

//by default, we create a new instance of InMemoryCache in each provider
export const ApolloErrorProvider = createApolloErrorProvider();
export const ApolloLoadingProvider = createApolloLoadingProvider();
export const ApolloMockedProvider = createApolloMockedProvider(typeDefs);

