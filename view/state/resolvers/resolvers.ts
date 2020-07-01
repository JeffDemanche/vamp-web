import { Resolvers } from "apollo-boost";
import { InMemoryCache } from "apollo-cache-inmemory";

type ResolverFn = (
  parent: any,
  args: any,
  { cache }: { cache: InMemoryCache }
) => any;

interface ResolverMap {
  [field: string]: ResolverFn;
}

interface AppResolvers extends Resolvers {
  Clip: ResolverMap;
  Query: ResolverMap;
  Mutation: ResolverMap;
}

export { ResolverFn, ResolverMap, AppResolvers };
