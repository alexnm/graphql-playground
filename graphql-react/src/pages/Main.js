import React, { Component } from "react";
import MovieList from "../components/MovieList";
import AddMovie from "../components/AddMovie";

class Main extends Component {
    constructor( ) {
        super( );
        this.state = { searchString: "" };
        this.onChange = this.onChange.bind( this );
    }

    onChange( event ) {
        this.setState( { searchString: event.target.value } );
    }

    render( ) {
        const { searchString } = this.state;
        return (
            <div>
                <p>
                    Search:
                    <input
                        type="text"
                        onChange={ this.onChange }
                    />
                </p>
                <MovieList searchString={ searchString } />
                <AddMovie />
            </div>
        );
    }
}

export default Main;
