import React from "react";
import { ApolloProvider } from "react-apollo";
import { BrowserRouter, Route, Switch, Link } from "react-router-dom";
import apolloClient from "./apolloClient";
import Main from "./pages/Main";
import MovieDetails from "./pages/MovieDetails";

import logo from "./logo.svg";
import "./App.css";

const App = ( ) => (
    <ApolloProvider client={ apolloClient }>
        <BrowserRouter>
            <div className="App">
                <header className="App-header">
                    <img src={ logo } className="App-logo" alt="logo" />
                    <Link to="/"><h1 className="App-title">Welcome to GraphQL</h1></Link>
                </header>
                <Switch>
                    <Route exact path="/" component={ Main } />
                    <Route path="/movies/:movieId" component={ MovieDetails } />
                </Switch>
            </div>
        </BrowserRouter>
    </ApolloProvider>
);

export default App;
