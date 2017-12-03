import ApolloClient from "apollo-client";
import { HttpLink } from "apollo-link-http";
import { InMemoryCache } from "apollo-cache-inmemory";
import { WebSocketLink } from "apollo-link-ws";
import { split } from "apollo-link";
import { getMainDefinition } from "apollo-utilities";

const wsLink = new WebSocketLink( {
    uri: "ws://localhost:4000/subscriptions",
    options: {
        reconnect: true,
    },
} );

const httpLink = new HttpLink( {
    uri: "http://localhost:4000/graphql",
} );

const link = split(
    // split based on operation type
    ( { query } ) => {
        const { kind, operation } = getMainDefinition( query );
        return kind === "OperationDefinition" && operation === "subscription";
    },
    wsLink,
    httpLink,
);

export default new ApolloClient( {
    link,
    cache: new InMemoryCache( ),
} );
