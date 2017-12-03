import React, { Component } from "react";
import gql from "graphql-tag";
import { graphql } from "react-apollo";

const addMovieMutation = gql`
    mutation($title: String!, $director: String!, $year: Int!) {
        addMovie(title: $title, director: $director, year: $year) {
            id
            title
            director
            year
        }
    }
`;

class AddMovie extends Component {
    constructor( ) {
        super();
        this.onSubmit = this.onSubmit.bind( this );
    }

    onSubmit( evt ) {
        evt.preventDefault( );
        const title = this.title.value;
        const director = this.director.value;
        const year = parseInt( this.year.value, 10 );
        this.props.mutate( {
            variables: {
                title,
                director,
                year,
            }
        } ).then( ( ) => {
            this.title.value = "";
            this.director.value = "";
            this.year.value = "";
        } );
    }

    render( ) {
        return (
            <form>
                <p>Add a new movie to the database</p>
                <div>
                    <span>Title</span>
                    <input ref={ ref => { this.title = ref; } } type="text" name="title" />
                </div>
                <div>
                    <span>Director</span>
                    <input ref={ ref => { this.director = ref; } } type="text" name="director" />
                </div>
                <div>
                    <span>Year</span>
                    <select ref={ ref => { this.year = ref; } } type="text" name="year">
                        {
                            range( 1970, 2017 ).map( value =>
                                <option key={ value } value={ value }>{ value }</option> )
                        }
                    </select>
                </div>
                <button type="submit" onClick={ this.onSubmit }>Add</button>
            </form>
        );
    }
}

export default graphql( addMovieMutation )( AddMovie );

function range( start, stop ) {
    const result = [ ];
    for ( let value = start; value <= stop; value += 1 ) {
        result.push( value );
    }

    return result;
}
