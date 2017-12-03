const express = require( "express" );
const bodyParser = require( "body-parser" );
const { graphqlExpress, graphiqlExpress } = require( "graphql-server-express" );
const { execute, subscribe } = require( "graphql" );
const { createServer } = require( "http" );
const cors = require( "cors" );
const { SubscriptionServer } = require( "subscriptions-transport-ws" );
const schema = require( "./schema" );

const PORT = 4000;
const server = express();

server.use( "*", cors( { origin: "http://localhost:3000" } ) );

server.use( "/graphql", bodyParser.json(), graphqlExpress( {
    schema,
} ) );

server.use( "/graphiql", graphiqlExpress( {
    endpointURL: "/graphql",
    subscriptionsEndpoint: `ws://localhost:${ PORT }/subscriptions`,
} ) );

const ws = createServer( server );

ws.listen( PORT, () => {
    console.log( `GraphQL Server is now running on http://localhost:${ PORT }` );
    new SubscriptionServer( { // eslint-disable-line no-new
        execute,
        subscribe,
        schema,
    }, {
        server: ws,
        path: "/subscriptions",
    } );
} );
