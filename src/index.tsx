import React from 'react';
import ReactDOM from 'react-dom';
import './index.scss';
import App from './App';
import WalletProvider from './context/Wallet/WalletProvider'
import GithubProvider from './context/Github/GithubProvider'
import DataProvider from './context/Data/DataProvider'
import { Wallet } from './context/Wallet/Index'
import { Github } from './context/Github/Index'
import { Router, Route, Switch } from 'react-router-dom'
// @ts-ignore
import { GlobalNotification, GlobalModal } from "slate-react-system";
import * as serviceWorker from './serviceWorker';
import Preonboarding from './pages/Preonboarding';
import Onboarding from './pages/Onboarding';
import Landing from './pages/Landing';
import history from './context/History';
import Verifiers from './pages/Verifiers';
import './fonts/SuisseIntl-Regular.woff'
import Miners from './pages/Miners';

ReactDOM.render(
  <React.StrictMode>
    <WalletProvider>
        <GithubProvider>
          <Wallet.Consumer>
            {wallet => (
              <Github.Consumer>
                {github => (
                  <DataProvider wallet={wallet} github={github}>
                    <Router history={history}>
                      <Switch>
                        <Route exact path={'/'} component={Onboarding} ></Route>
                        <Route path={'/app'} component={App} ></Route>
                        <Route path={'/wallet'} component={Preonboarding} ></Route>
                        <Route path={'/landing'} component={Landing} ></Route>
                        <Route path={'/verifiers'} component={Verifiers} ></Route>
                        <Route path={'/miners'} component={Miners} ></Route>
                      </Switch>
                    </Router>
                    <GlobalNotification style={{ bottom: 0, right: 0 }} />
                    <GlobalModal style={{ maxWidth: "none" }} />
                  </DataProvider>
                )}
              </Github.Consumer>
            )}
          </Wallet.Consumer>
        </GithubProvider>
    </WalletProvider>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
