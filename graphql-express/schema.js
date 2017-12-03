const movies = require( "./movies" );
const { makeExecutableSchema } = require( "graphql-tools" );
const { PubSub, withFilter } = require( "graphql-subscriptions" );

const typeDefs = `
type Movie {
    id: ID!
    title: String
    year: Int
    director: String
    rating: Float
    watched: Boolean
}

type Query {
    movies(title: String, director: String): [Movie]
    movie(id: ID!): Movie
}

type Mutation {
    addMovie(title: String, director: String, year: Int): Movie
    toggleWatched(id: ID!): Movie
    removeMovie(id: ID!): Movie
}

type Subscription {
    movieAdded: Movie
}
`;

const pubsub = new PubSub();

const resolvers = {
    Query: {
        movies( root, { title, director, year } ) {
            if ( !director && !year && !title ) {
                return movies;
            }

            return movies.filter( movie => movie.title.indexOf( title ) > -1 ||
                movie.director.indexOf( director ) > -1 ||
                movie.year === year );
        },
        movie( root, { id } ) {
            return movies.find( movie => movie.id === id );
        },
    },
    Mutation: {
        addMovie( root, {
            title, director, year,
        } ) {
            const newMovie = {
                id: Math.floor( ( Math.random() * 10000 ) ).toString( ),
                title,
                director,
                year,
                watched: false,
            };

            movies.push( newMovie );

            pubsub.publish( "movieAdded", { movieAdded: newMovie } );

            return newMovie;
        },
        toggleWatched( root, { id } ) {
            return new Promise( ( resolve ) => {
                const changedMovie = movies.find( movie => movie.id === id );
                changedMovie.watched = !changedMovie.watched;
                setTimeout( ( ) => resolve( changedMovie ), 1000 );
            } );
        },
        removeMovie( root, { id } ) {
            const movieToBeRemoved = movies.find( movie => movie.id === id );
            const indexToRemove = movies.map( movie => movie.id ).indexOf( id );
            movies.splice( indexToRemove, 1 );
            return movieToBeRemoved;
        },
    },
    Subscription: {
        movieAdded: {
            subscribe: () => pubsub.asyncIterator( "movieAdded" ),
        },
    },
};

module.exports = makeExecutableSchema( { typeDefs, resolvers } );
