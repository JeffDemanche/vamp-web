# How to use Apollo and GraphQL

Here's some notes about Apollo and GraphQL and an outline of how it's being used
in Vamp, because there's a lot of things you have to simultaneously wrap your
head around to make sense of it.

## What Apollo/GraphQL is used for

GraphQL is a language specification for writing API requests. It doesn't say how
the request is implemented, just how it's written. For instance, we have a query
on the server called `Me` that returns data about the logged-in user. We would
issue that query using the GraphQL:

    Query GetMe {
      Me {
        id
        username
        email
      }
    }

However it's up to us to define how that data is actually returned (in this
case, that means authenticating the client that gave the query and then
retrieving user data from the Mongo database on the server). That's done in
something called a resolver, which you can find on the server.

### Local state management

In addition to querying the server, Apollo lets us cache the state of the app
locally, and query that cache using GraphQL.

## Coordinating between client cache and server

This is the most confusing part of Apollo, IMO. We have a local cache that
represents the state of the client application, and a database on the server
that represents persistent, "public" data. We write queries and mutations that
interact with both of these places at the same time.

The first key is for querying the correct data. Every query can take a parameter
`fetchPolicy` that determines how it looks for the data between the client cache
and the server. [That's outlined on this page, toward the bottom.]
(https://www.apollographql.com/docs/react/api/react-apollo/).

As for the "fetch policy" of mutations, see [this GitHub
page](https://github.com/apollographql/apollo-client/issues/4577), which shines
some light on how mutations talk to both the server and the client. The takeaway
is that **by default, mutations call the server first, and then the client**.