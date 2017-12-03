import React, { Component } from "react";
import gql from "graphql-tag";
import { graphql } from "react-apollo";
import { bool, arrayOf, string, shape, object } from "prop-types";
import { Link } from "react-router-dom";
import { compose } from "../helpers";

const movieListQuery = gql`
    query movieListQuery( $searchString: String ) {
        movies(director: $searchString, title: $searchString) {
            id,
            title,
            director,
            year
        }
    }
`;

const removeMovieMutation = gql`
    mutation removeMovieMutation( $movieId: ID! ) {
        removeMovie( id: $movieId ) {
            id
        }
    }
`;

const movieSubscription = gql`
    subscription {
        movieAdded {
            id,
            title,
            director,
            year
        }
    }
`;

class MovieList extends Component {
    constructor( ) {
        super( );
        this.handleRemove = this.handleRemove.bind( this );
    }

    componentWillMount( ) {
        this.props.data.subscribeToMore( {
            document: movieSubscription,
            updateQuery: ( prev, { subscriptionData } ) => {
                if ( !subscriptionData.data ) {
                    return prev;
                }

                const newMovie = subscriptionData.data.movieAdded;
                if ( prev.movies.find( ( movie ) => movie.id === newMovie.id ) ) {
                    return prev;
                }

                const nextMovies = [ ...prev.movies, newMovie ];
                return Object.assign( { }, prev, { movies: nextMovies } );
            },
        } );
    }

    handleRemove( movieId ) {
        this.props.mutate( {
            variables: {
                movieId,
            },
            optimisticResponse: {
                removeMovie: {
                    id: movieId,
                    __typename: "Movie",
                },
            },
            update: ( proxy, { data: { removeMovie } } ) => {
                const data = proxy.readQuery( {
                    query: movieListQuery,
                    variables: {
                        searchString: "",
                    },
                } );
                const { id } = removeMovie;
                const indexToRemove = data.movies.map( movie => movie.id ).indexOf( id );
                data.movies.splice( indexToRemove, 1 );
                proxy.writeQuery( {
                    query: movieListQuery,
                    variables: {
                        searchString: "",
                    },
                    data,
                } );
            },
        } );
    }

    render( ) {
        const { data: { loading, error, movies } } = this.props;

        if ( loading ) {
            return <p>Loading ...</p>;
        }

        if ( error ) {
            return <p>{error.message}</p>;
        }

        return (
            <ul>
                { movies.map( movie => (
                    <li key={ movie.id }>
                        <Link to={ `/movies/${ movie.id }` }>{ movie.title }</Link>
                        { " " } - { movie.director }
                        { " " } - { movie.year }
                        { " " } <button onClick={ ( ) => this.handleRemove( movie.id ) }>X</button>
                    </li>
                ) ) }
            </ul>
        );
    }
}

MovieList.propTypes = {
    data: shape( {
        loading: bool.isRequired,
        error: object,
        movies: arrayOf( shape( {
            title: string.isRequired,
        } ) ),
    } ),
};

export {
    movieListQuery,
};

const composedHocs = compose(
    graphql( movieListQuery ),
    graphql( removeMovieMutation ),
);

export default composedHocs( MovieList );
