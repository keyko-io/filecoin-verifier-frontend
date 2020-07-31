import React, { Component } from 'react';
import { Route, Switch, NavLink } from 'react-router-dom'
import Overview from './Overview'
import Verifiedclients from './Verifiedclients'
import Verifiers from './Verifiers'
import Governance from './Governance'
import Rootkey from './Rootkey'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircle, faCoffee } from '@fortawesome/free-solid-svg-icons'
import { far } from '@fortawesome/free-regular-svg-icons'
import filecoinLogo from './filecoin-logo.png'
import { Wallet } from './context/Index'
import './App.scss';

import { library } from '@fortawesome/fontawesome-svg-core'
import { fab } from '@fortawesome/free-brands-svg-icons'
library.add(fab, far, faCoffee, faCircle)

class App extends Component {
  public static contextType = Wallet

  componentDidMount () {
    console.log(this.context)
  }

  render() {
    return (
      <div className="App">
        <div className="sidebar">
          <div><img src={filecoinLogo} alt="Filecoin"/></div>
          <NavLink activeClassName="active" exact to={'/'}><FontAwesomeIcon icon={["far", "circle"]}/>Overview</NavLink>
          <NavLink activeClassName="active" to={'/verifiedclients'}><FontAwesomeIcon icon={["far", "circle"]} />Verified clients</NavLink>
          <NavLink activeClassName="active" to={'/verifiers'}><FontAwesomeIcon icon={["far", "circle"]} />Verifiers</NavLink>
          <NavLink activeClassName="active" to={'/governance'}><FontAwesomeIcon icon={["far", "circle"]} />Governance</NavLink>
          <NavLink activeClassName="active" to={'/rootkey'}><FontAwesomeIcon icon={["far", "circle"]} />Rootkey</NavLink>
        </div>
        <div className="main">
          { this.context.isLogged === false ? (
              <div>Loading</div>
          ) : (
            <Switch>
              <Route component={Overview} path="/" exact/>
              <Route component={Verifiedclients} path="/verifiedclients" />
              <Route component={Verifiers} path="/verifiers" />
              <Route component={Governance} path="/governance" />
              <Route component={Rootkey} path="/rootkey" />
            </Switch>
          )}
        </div>
      </div>
    );
  }
}

export default App;
