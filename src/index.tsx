import React from 'react';
import ReactDOM from 'react-dom';
import './index.scss';
import App from './App';
import WalletProvider from './context/WalletProvider'
import { Router, Route, Switch } from 'react-router-dom'
// @ts-ignore
import { GlobalNotification, GlobalModal } from "slate-react-system";
import * as serviceWorker from './serviceWorker';
import Preonboarding from './pages/Preonboarding';
import Onboarding from './pages/Onboarding';
import Landing from './pages/Landing';
import history from './context/History';

ReactDOM.render(
  <React.StrictMode>
    <WalletProvider>
      <Router history={history}>
        <Switch>
          <Route exact path={'/'} component={App} ></Route>
          <Route exact path={'/wallet'} component={Preonboarding} ></Route>
          <Route exact path={'/onboarding'} component={Onboarding} ></Route>
          <Route exact path={'/landing'} component={Landing} ></Route>
        </Switch>
      </Router>
      <GlobalNotification style={{ bottom: 0, right: 0 }} />
      <GlobalModal style={{ maxWidth: "none" }}/>
    </WalletProvider>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
