import React, { Component } from 'react';
import { Route, Switch } from 'react-router-dom'
import Overview from './Overview'
import Verifiedclients from './Verifiedclients'
import Verifiers from './Verifiers'
import Governance from './Governance'
import Rootkey from './Rootkey'
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { fab } from '@fortawesome/free-brands-svg-icons'
import { far } from '@fortawesome/free-regular-svg-icons'
import { fas } from '@fortawesome/free-solid-svg-icons'
import Logo from './logo.svg';
import { Wallet } from './context/Index'
import { addressFilter } from './Filters'
import WalletModal from './WalletModal'
import './App.scss';
// @ts-ignore
import { Input, dispatchCustomEvent, TabGroup } from "slate-react-system"
import { config } from './config'
import Blockies from 'react-blockies'

library.add(fab, far, fas)

type States = {
  networkSelect: boolean
  accountSelect: boolean
}

class App extends Component<{},States> {
  public static contextType = Wallet

  constructor(props: {}) {
    super(props);
    this.state = {
      networkSelect: false,
      accountSelect: false
    }
}

  componentDidMount () {
    
  }

  openNetworkSelect = (e:any) => {
    this.setState({
      networkSelect: this.state.networkSelect === false ? true : false
    })
  }

  openAccountSelect = (e:any) => {
    this.setState({
      accountSelect: this.state.accountSelect === false ? true : false
    })
  }

  switchNetwork = (index:number) => {
    this.context.selectNetwork(index)
  }

  switchAccount = (index:number) => {
    this.context.selectAccount(index)
  }

  openWallet = async () => {
    dispatchCustomEvent({ name: "create-modal", detail: {
      id: Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 5),
      modal: <WalletModal/>
    }})
  }

  render() {
    return (
      <div className="App">
        <div className="header">
          <div><img src={Logo} alt="Filecoin"/></div>
          <div className="networkselect" onClick={this.openNetworkSelect}>
            {this.state.networkSelect?
              <div className="networkselectholder">
                <div className="headertitles">Network Select</div>
                {config.lotusNodes.map((node:any, index:number)=>{
                  return <div key={index} style={{ color: index === this.context.networkIndex ? '#003fe3' : 'inherit' }} className="networkentry" onClick={()=>this.switchNetwork(index)}>{node.name}</div>
                })}
              </div>
            : null}
            <div className="headertitles">Network selected</div>
            <div className="addressholder">{config.lotusNodes[this.context.networkIndex].name}</div>
          </div>
          <div className="datacap">
            <div className="headertitles">Datacap Amount</div>
            <div><FontAwesomeIcon icon={["far", "save"]}/> 50 TiB</div>
          </div>
          <div className="search">
            <Input
              name="search"
              placeholder="Search"
            />
            <FontAwesomeIcon icon={["fas", "search"]}/>
          </div>
          <div className="refresh"><FontAwesomeIcon icon={["fas", "redo"]} flip="vertical" transform={{ rotate: 135 }}/></div>
          <div className="notification"><FontAwesomeIcon icon={["far", "bell"]}/></div>
          <div className="accountholder" onClick={this.openAccountSelect}>
            {this.state.accountSelect?
              <div className="accountselectholder">
                <div className="headertitles">Selected Account Type</div>
                {this.context.accounts.map((account:any, index: number)=>{
                  return <div key={index} style={{ color: index === this.context.walletIndex ? '#003fe3' : 'inherit' }} className="accountentry" onClick={()=>this.switchAccount(index)}>{addressFilter(account)}</div>
                })}
                <div className="importseedphrase" onClick={()=>{this.openWallet()}}>Import seedphrase</div>
              </div>
            : null}
            <div className="headertitles">Rootkey Holder ID</div>
            <div>{addressFilter(this.context.activeAccount)}</div>
          </div>
          <div className="wallet">
            <div className="WalletMenu">
              <Blockies
                seed={this.context.activeAccount}
                size={10}
                scale={4}
                color="#dfe"
                bgColor="#ffe"
                spotColor="#abc"
              />
            </div>
          </div>
        </div>
        {/*
        <NavLink activeClassName="active" exact to={'/'}><FontAwesomeIcon icon={["far", "circle"]}/>Overview</NavLink>
        <NavLink activeClassName="active" to={'/verifiedclients'}><FontAwesomeIcon icon={["far", "circle"]} />Verified clients</NavLink>
        <NavLink activeClassName="active" to={'/verifiers'}><FontAwesomeIcon icon={["far", "circle"]} />Verifiers</NavLink>
        <NavLink activeClassName="active" to={'/governance'}><FontAwesomeIcon icon={["far", "circle"]} />Governance</NavLink>
        <NavLink activeClassName="active" to={'/rootkey'}><FontAwesomeIcon icon={["far", "circle"]} />Rootkey</NavLink>
        */}
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
    );
  }
}

export default App;
