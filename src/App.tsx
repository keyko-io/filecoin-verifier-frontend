import React from 'react';
import WalletProvider from './context/WalletProvider'
import { BrowserRouter, Route, Switch, Link } from 'react-router-dom'
import Test from './Test'
import Overview from './Overview'
import Verifiedclients from './Verifiedclients'
import Verifiers from './Verifiers'
import Governance from './Governance'
import Rootkey from './Rootkey'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircle, faCoffee } from '@fortawesome/free-solid-svg-icons'
import { far } from '@fortawesome/free-regular-svg-icons'
import './App.scss';

import { library } from '@fortawesome/fontawesome-svg-core'
import { fab } from '@fortawesome/free-brands-svg-icons'
library.add(fab, far, faCoffee, faCircle)

function App() {
  return (
    <WalletProvider>
      <BrowserRouter>
        <div className="App">
          <div className="sidebar">
            <div>Filecoin logo</div>
            <Link to={'/'}><FontAwesomeIcon icon={["far", "circle"]}/>Overview</Link>
            <Link to={'/verifiedclients'}><FontAwesomeIcon icon={["far", "circle"]} />Verified clients</Link>
            <Link to={'/verifiers'}><FontAwesomeIcon icon={["far", "circle"]} />Verifiers</Link>
            <Link to={'/governance'}><FontAwesomeIcon icon={["far", "circle"]} />Governance</Link>
            <Link to={'/rootkey'}><FontAwesomeIcon icon={["far", "circle"]} />Rootkey</Link>
            <Link to={'/test'}><FontAwesomeIcon icon={["far", "circle"]} />Test</Link>
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
      </BrowserRouter>
    </WalletProvider>
  );
}

export default App;
