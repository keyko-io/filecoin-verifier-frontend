import React, { Component } from 'react';
import Overview from './components/Overview'
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { fab } from '@fortawesome/free-brands-svg-icons'
import { far } from '@fortawesome/free-regular-svg-icons'
import { fas } from '@fortawesome/free-solid-svg-icons'
import Logo from './svg/logo.svg';
import Network from './svg/filecoin-network.svg';
import { Data } from './context/Data/Index'
import { addressFilter, bytesToiB } from './utils/Filters'
import WalletModal from './modals/WalletModal'
import copy from 'copy-text-to-clipboard'
import './App.scss';
// @ts-ignore
import { dispatchCustomEvent, Toggle, SVG, LoaderSpinner, Input } from "slate-react-system"
import { config } from './config'
import Blockies from 'react-blockies'
import history from './context/History'
import LogAsNotaryModal from './modals/LogAsNotaryModal'


library.add(fab, far, fas)

type States = {
  networkSelect: boolean
  accountSelect: boolean
  notificationsOpen: boolean
  search: string
}


class App extends Component<{}, States> {
  public static contextType = Data
  child: any

  constructor(props: {}) {
    super(props);
    this.state = {
      networkSelect: false,
      accountSelect: false,
      notificationsOpen: false,
      search: ''
    }
    this.child = React.createRef();
  }

  componentDidMount() {
    if (this.context.wallet.isLogged === false) {
      history.push({
        pathname: "/"
      })
    }
  }

  onClick = () => {
    history.push({
        pathname: "/"
    })
}


  openNetworkSelect = (e: any) => {
    this.setState({
      networkSelect: this.state.networkSelect === false ? true : false
    })
  }

  openAccountSelect = (e: any) => {
    this.setState({
      accountSelect: this.state.accountSelect === false ? true : false
    })
  }

  openNotifications = (e: any) => {
    this.setState({
      notificationsOpen: this.state.notificationsOpen === false ? true : false
    })
  }

  switchNetwork = async (index: number) => {
    this.context.wallet.selectNetwork(index)
    this.refresh()
  }

  switchAccount = async (index: number) => {
    this.context.wallet.selectAccount(index)
  }

  switchRoot = () => {
    if (this.context.switchview) {
      this.context.switchview()
    }
  }

  openWallet = async () => {
    dispatchCustomEvent({
      name: "create-modal", detail: {
        id: Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 5),
        modal: <WalletModal />
      }
    })
  }


   openLoginModalNotary= async () => {
    dispatchCustomEvent({
      name: "create-modal", detail: {
        id: Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 5),
        modal: <LogAsNotaryModal type={"login"} />
      }
    })
  }

  copyAddress = async (address: string) => {
    copy(address)
    this.context.wallet.dispatchNotification(address + ' copied to clipboard')
  }

  refresh = () => {
    this.child.current.loadData();
  }

  getVerifierAmount = (account: string) => {
    for (const verified of this.context.verified) {
      if (account === verified.verifierAccount) {
        return verified.datacap
      }
    }
    return '0'
  } 
  
  updateSearch = () => {
    this.context.search(this.state.search)
  }

  handleChange = (e: any) => {
    this.setState({ [e.target.name]: e.target.value } as any, this.updateSearch)
  }

  search = async (event: any) => {
    event.preventDefault()
    this.context.search(this.state.search)
  }

  render() {
    return (
      <div className="App">
        <div className="header">
          <div className="headerLogoCtrlPanel" onClick={() => this.onClick()}><img src={Logo} title="Return to home page" alt="Filecoin" /></div>
          <div className="networkselect" onClick={this.openNetworkSelect}>
            {this.state.networkSelect ?
              <div className="networkselectholder">
                <div className="headertitles">Network Select</div>
                {config.lotusNodes.filter((node: any, index: number) => config.networks.includes(node.name)).map((node: any, index: number) => {
                  return <div key={index} style={{ color: index === this.context.wallet.networkIndex ? '#003fe3' : 'inherit' }} className="networkentry" onClick={() => this.switchNetwork(index)}>{node.name}</div>
                })}
              </div>
              : null}
            <div className="headertitles">Network selected</div>
            <div className="addressholder">{config.lotusNodes[this.context.wallet.networkIndex].name}</div>
          </div>
          <div className="search">
            <form onSubmit={this.search}>
              <Input
                name="search"
                placeholder="Search"
                onChange={this.handleChange}
              />
            </form>
            <FontAwesomeIcon icon={["fas", "search"]} />
          </div>
          <div className="refresh" onClick={() => this.refresh()}>
            <FontAwesomeIcon icon={["fas", "redo"]} flip="vertical" transform={{ rotate: 135 }} />
          </div>
          {this.context.viewroot === true ?
            <div className="notification" onClick={this.openNotifications}><FontAwesomeIcon icon={["far", "bell"]} />
              {this.state.notificationsOpen ?
                <div className="notificationholder">
                  {this.context.notificationVerifierRequests.map((entry: any, index: number) => {
                    return <div key={index} className="notificationentry">
                      <div onClick={() => window.open(entry.url, "_blank")}>
                        Issue: {entry.number}
                      </div>
                    </div>
                  })}
                </div>
                : null}
            </div>
            : null}
          {this.context.viewroot === false ?
            <div className="notification" onClick={this.openNotifications}><FontAwesomeIcon icon={["far", "bell"]} />
              {this.state.notificationsOpen ?
                <div className="notificationholder">
                  {this.context.notificationClientRequests.map((entry: any, index: number) => {
                    return <div key={index} className="notificationentry">
                      <div onClick={() => window.open(entry.url, "_blank")}>
                        Issue: {entry.number}
                      </div>
                    </div>
                  })}
                </div>
                : null}
            </div>
            : null}
          <div className="accountholder" onClick={this.openAccountSelect}>
            {this.state.accountSelect ?
              <div className="accountselectholder">
                <div className="headertitles">Select Account Type</div>
                <div>
                  <div>{this.context.viewroot ? 'Rootkey Holder' : 'Approved Notary'}</div>
                  <div className="viewswitch">
                    <Toggle
                      active={this.context.viewroot}
                      name="accountview"
                      onChange={this.switchRoot}
                    />
                  </div>
                </div>
                {this.context.wallet.multisig && this.context.viewroot === false ?
                  <React.Fragment>
                    <div className="headertitles">Multisig address</div>
                    <div className="accountentry">
                      <div>
                        <div className="datacapdata">
                          <span className="datacap">Datacap: {bytesToiB(this.getVerifierAmount(this.context.wallet.multisigID))}</span>
                          {this.context.wallet.multisig ?
                            <img src={Network} alt="network" />
                            : null}
                        </div>
                        <div className="accountdata">
                          <span className="accountaddress">{this.context.wallet.multisigAddress.length > 20 ? addressFilter(this.context.wallet.multisigAddress): this.context.wallet.multisigAddress}</span>
                          <span className="copyaddress"><SVG.CopyAndPaste height='15px' /></span>
                        </div>
                      </div>
                    </div>
                  </React.Fragment>
                  : null}
                <div className="headertitles">Account addresses</div>
                {this.context.wallet.accounts.map((account: any, index: number) => {
                  return <div key={index} className="accountentry" style={{ backgroundColor: index === this.context.wallet.walletIndex ? '#C7C7C7' : 'inherit' }}>
                    <div>
                      <div className="datacapdata" onClick={() => this.switchAccount(index)} >
                        {this.context.viewroot === false ? <span className="datacap">Datacap: {bytesToiB(this.getVerifierAmount(account))}</span> : <span className="datacap"></span>}
                        {this.context.wallet.accountsActive[account] ?
                          <img src={Network} alt="network" />
                          : null}
                      </div>
                      <div className="accountdata">
                        <span className="accountaddress" onClick={() => this.switchAccount(index)} >{addressFilter(account)}</span>
                        <span className="copyaddress" onClick={() => this.copyAddress(account)}><SVG.CopyAndPaste height='15px' /></span>
                      </div>
                    </div>
                  </div>
                })}
                {this.context.wallet.wallet !== 'ledger' ?
                <div>
                  <div className="importseedphrase" onClick={() => { this.openWallet() }}>Import seedphrase</div>
                  <div className="importseedphrase" onClick={() => { this.openLoginModalNotary() }}>Change multisig</div>

                </div>
                  : null
                }
              </div>
              : null}
            <div className="headertitles">{this.context.viewroot ? 'Rootkey Holder ID' : 'Approved Notary ID'}</div>
            <div>{addressFilter(this.context.wallet.activeAccount)}, {this.context.wallet.multisig && this.context.viewroot === false ? this.context.wallet.multisigAddress.length > 20 ? addressFilter(this.context.wallet.multisigAddress): this.context.wallet.multisigAddress : null}</div>
          </div>
          <div className="wallet">
            <div className="WalletMenu">
              <Blockies
                seed={this.context.wallet.activeAccount}
                size={10}
                scale={4}
                color="#dfe"
                bgColor="#ffe"
                spotColor="#abc"
              />
            </div>
          </div>
        </div>
        { this.context.wallet.isLoading === true || this.context.wallet.isLogged === false ?
          <div className="walletpicker"><LoaderSpinner /></div>
          : <Overview ref={this.child} />
        }
      </div>
    );
  }
}

export default App;

