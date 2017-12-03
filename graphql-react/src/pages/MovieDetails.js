import React, { Component } from "react";
import gql from "graphql-tag";
import { graphql } from "react-apollo";
import { compose } from "../helpers";

const movieByIdQuery = gql`
    query MovieById( $movieId: ID! ){
        movie( id: $movieId ) {
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
        toggleWatched( id: $movieId ) {
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
        const { movie } = data;
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
            update: ( proxy, { data: { toggleWatched } } ) => {
                const data = proxy.readQuery( {
                    query: movieByIdQuery,
                    variables: {
                        movieId: match.params.movieId,
                    },
                } );
                data.movie.watched = toggleWatched.watched;
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
        const { data: { loading, error, movie } } = this.props;

        if ( loading ) {
            return <p>Loading ...</p>;
        }

        if ( error ) {
            return <p>{error.message}</p>;
        }

        const buttonMessage = movie.watched ? "Remove from watched list" : "Add to watched list";

        return (
            <div>
                <h1>{ movie.title } - { movie.year }</h1>
                <p>Directed by: <strong>{ movie.director }</strong></p>
                <p>{ movie.watched ? "Already watched" : "Should definitely watch this" }</p>
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
