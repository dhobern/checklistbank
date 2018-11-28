import React, { Component } from 'react';
// Configure JWT Auth:
import axios from 'axios';


import { Router, Route, Switch, Redirect } from "react-router-dom";
import PrivateRoute from './components/Auth/PrivateRoute'

import history from './history';
import './App.css';
import DatasetList from './pages/DatasetList'
import DatasetPage from './pages/DatasetKey'
import DatasetCreate from './pages/DatasetCreate'
import Taxon from './pages/Taxon'
import Name from './pages/Name'
import LoginPage from './pages/login/LoginPage'

import Assembly from './pages/Assembly'

import Imports from './pages/Imports'
import Auth from './components/Auth/Auth'
Auth.init();

class App extends Component {
  render() {
    return (
      <Router history={history}>
        <Switch>
          <Route exact path="/" render={(props) => <Redirect to={{
            pathname: '/imports/running'
          }} />} />
          <Route exact path="/imports/:section?" render={({match}) => <Imports section={match.params.section}/>} />
          <PrivateRoute exact key="Assembly" path={`/assembly`} component={Assembly}></PrivateRoute> />
          <Route exact key="taxonKey" path={`/dataset/:key/taxon/:taxonKey`} component={Taxon} />
          <Route exact key="nameKey" path={`/dataset/:key/name/:nameKey`} component={Name} />

          <Route exact key="datasetCreate" path={`/dataset/create`} component={DatasetCreate} />
          <Route exact key="datasetKey" path={`/dataset/:key/:section?`} 
            render={({match, location}) => (<DatasetPage section={match.params.section} datasetKey={match.params.key} location={location}/>)}
             />


          <Route exact key="dataset" path="/dataset" render={(props) => <DatasetList location={props.location} />} />
          <Route exact key="login" path="/user/login" render={(props) => <LoginPage location={props.location} />} />

          <Route component={NoMatch} />
        </Switch>
      </Router>
    );
  }
}

const NoMatch = ({ location }) => (
  <div>
    <h3>
      404 - No match for <code>{location.pathname}</code>
    </h3>
  </div>
);

export default App;
