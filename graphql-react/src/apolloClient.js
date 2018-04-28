import ApolloClient from "apollo-client";
import { HttpLink } from "apollo-link-http";
import { InMemoryCache } from "apollo-cache-inmemory";
import { WebSocketLink } from "apollo-link-ws";
import { split } from "apollo-link";
import { getMainDefinition } from "apollo-utilities";

const wsLink = new WebSocketLink( {
    uri: "wss://subscriptions.graph.cool/v1/cjd9a07lo0qat01954otqo76p",
    options: {
        reconnect: true,
    },
} );

const httpLink = new HttpLink( {
    uri: "https://api.graph.cool/simple/v1/cjd9a07lo0qat01954otqo76p",
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
