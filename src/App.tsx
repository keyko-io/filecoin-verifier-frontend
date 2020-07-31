import React from 'react';
import { Route, Switch, NavLink } from 'react-router-dom'
import { useLocation } from "react-router-dom";
import Test from './Test'
import Overview from './Overview'
import Verifiedclients from './Verifiedclients'
import Verifiers from './Verifiers'
import Governance from './Governance'
import Rootkey from './Rootkey'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircle, faCoffee } from '@fortawesome/free-solid-svg-icons'
import { far } from '@fortawesome/free-regular-svg-icons'
import filecoinLogo from './filecoin-logo.png'
import './App.scss';

import { library } from '@fortawesome/fontawesome-svg-core'
import { fab } from '@fortawesome/free-brands-svg-icons'
library.add(fab, far, faCoffee, faCircle)

function App() {
  const location = useLocation();
  return (
    <div className="App">
      <div className="sidebar">
        <div><img src={filecoinLogo}/></div>
        <NavLink activeClassName="active" exact to={'/'}><FontAwesomeIcon icon={["far", "circle"]}/>Overview</NavLink>
        <NavLink activeClassName="active" to={'/verifiedclients'}><FontAwesomeIcon icon={["far", "circle"]} />Verified clients</NavLink>
        <NavLink activeClassName="active" to={'/verifiers'}><FontAwesomeIcon icon={["far", "circle"]} />Verifiers</NavLink>
        <NavLink activeClassName="active" to={'/governance'}><FontAwesomeIcon icon={["far", "circle"]} />Governance</NavLink>
        <NavLink activeClassName="active" to={'/rootkey'}><FontAwesomeIcon icon={["far", "circle"]} />Rootkey</NavLink>
        <NavLink activeClassName="active" to={'/test'}><FontAwesomeIcon icon={["far", "circle"]} />Test</NavLink>
      </div>
      <div className="main">
        <Switch>
          <Route component={Overview} path="/" exact/>
          <Route component={Verifiedclients} path="/verifiedclients" />
          <Route component={Verifiers} path="/verifiers" />
          <Route component={Governance} path="/governance" />
          <Route component={Rootkey} path="/rootkey" />
          <Route component={Test} path="/test" />
        </Switch>
      </div>
    </div>
  );
}

export default App;
