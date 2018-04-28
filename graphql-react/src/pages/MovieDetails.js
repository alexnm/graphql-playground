import React, { Component } from "react";
import gql from "graphql-tag";
import { graphql } from "react-apollo";
import { compose } from "../helpers";

const movieByIdQuery = gql`
    query MovieById( $movieId: ID! ){
        Movie( id: $movieId ) {
            id,
            title,
            director,
            year,
            watched
        }
    }
`;

const toggleWatchedMutation = gql`
    mutation ToggleWatched( $movieId: ID!) {
        updateMovie( id: $movieId ) {
            watched
        }
    }
`;

class MovieDetails extends Component {
    constructor( ) {
        super( );
        this.onToggleWatched = this.onToggleWatched.bind( this );
    }

    onToggleWatched( ) {
        const { mutate, data, match } = this.props;
        const movie = data.Movie;
        mutate( {
            variables: {
                id: movie.id,
            },
            optimisticResponse: {
                toggleWatched: {
                    watched: !movie.watched,
                    __typename: "Movie",
                },
            },
            update: ( proxy ) => {
                const data = proxy.readQuery( {
                    query: movieByIdQuery,
                    variables: {
                        movieId: match.params.movieId,
                    },
                } );
                data.Movie.watched = !data.Movie.watched;
                proxy.writeQuery( {
                    query: movieByIdQuery,
                    variables: {
                        movieId: match.params.movieId,
                    },
                    data,
                } );
            },
        } );
    }

    render( ) {
        const { data: { loading, error, Movie } } = this.props;

        if ( loading ) {
            return <p>Loading ...</p>;
        }

        if ( error ) {
            return <p>{error.message}</p>;
        }

        const buttonMessage = Movie.watched ? "Remove from watched list" : "Add to watched list";

        return (
            <div>
                <h1>{ Movie.title } - { Movie.year }</h1>
                <p>Directed by: <strong>{ Movie.director }</strong></p>
                <p>{ Movie.watched ? "Already watched" : "Should definitely watch this" }</p>
                <p><button onClick={ this.onToggleWatched } >{ buttonMessage }</button></p>
            </div>
        );
    }
}

const mapPropsToVariables = {
    options: ( { match } ) => ( { variables: { movieId: match.params.movieId } } ),
};

const composedHocs = compose(
    graphql( movieByIdQuery, mapPropsToVariables ),
    graphql( toggleWatchedMutation, mapPropsToVariables ),
);

export default composedHocs( MovieDetails );
