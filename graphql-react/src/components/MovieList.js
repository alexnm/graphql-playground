import React, { Component } from "react";
import gql from "graphql-tag";
import { graphql } from "react-apollo";
import { bool, arrayOf, string, shape, object } from "prop-types";
import { Link } from "react-router-dom";
import { compose } from "../helpers";

const movieListQuery = gql`
    query movieListQuery( $searchString: String ) {
        allMovies(filter: {title_contains: $searchString}) {
            id,
            title,
            director,
            year
        }
    }
`;

const removeMovieMutation = gql`
    mutation removeMovieMutation( $movieId: ID! ) {
        deleteMovie( id: $movieId ) {
            id
        }
    }
`;

const movieSubscription = gql`
    subscription {
        Movie {
            mutation
            node{
                id,
                title,
                director,
                year
            }
            previousValues{
                id,
                title
            }
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

                const change = subscriptionData.data.Movie;
                if ( change.mutation === "CREATED" ) {
                    if ( prev.allMovies.find( ( movie ) => movie.id === change.node.id ) ) {
                        return prev;
                    }

                    const nextMovies = [ ...prev.allMovies, change.node ];
                    return Object.assign( { }, prev, { allMovies: nextMovies } );
                }

                if ( change.mutation === "DELETED" ) {
                    const indexToRemove = prev.allMovies.map( m => m.id ).indexOf( change.previousValues.id );
                    const nextMovies = [
                        ...prev.allMovies.slice( 0, indexToRemove ),
                        ...prev.allMovies.slice( indexToRemove + 1 ),
                    ];
                    return Object.assign( { }, prev, { allMovies: nextMovies } );
                }

                return prev;
            },
        } );
    }

    handleRemove( movieId ) {
        this.props.mutate( {
            variables: {
                movieId,
            },
        } );
    }

    render( ) {
        const { data: { loading, error, allMovies } } = this.props;

        if ( loading ) {
            return <p>Loading ...</p>;
        }

        if ( error ) {
            return <p>{error.message}</p>;
        }

        return (
            <ul>
                { allMovies.map( movie => (
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
