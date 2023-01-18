import React, { Component, memo } from 'react';
import Overview from './components/OverviewApp/Overview'
import { library } from '@fortawesome/fontawesome-svg-core'
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
import history from './context/History'
import LogAsNotaryModal from './modals/LogAsNotaryModal'
import { Button } from '@material-ui/core';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import RefreshIcon from '@mui/icons-material/Refresh';

library.add(fab, far, fas)

type States = {
  networkSelect: boolean
  accountSelect: boolean
  search: string,
}

class App extends Component<{}, States> {
  public static contextType = Data
  child: any
  modalRef: any
  viewSwitch: any

  constructor(props: {}) {
    super(props);
    this.state = {
      networkSelect: false,
      accountSelect: false,
      search: '',
    }
    this.child = React.createRef();
    this.modalRef = React.createRef();
    this.viewSwitch = React.createRef()
  }

  closeModal = (e: any) => {
    if (e.path[1] !== this.modalRef.current && !e.path.includes(this.viewSwitch.current)) {
      this.setState({ accountSelect: false })
    }
  }

  componentDidMount() {
    document.body.addEventListener("click", this.closeModal)
    if (!this.context.wallet.isLogged) history.push("/")
  }

  componentWillUnmount() {
    document.body.removeEventListener("click", this.closeModal)
  }

  goToHomePage = () => history.push("/")
  goToLogs = () => history.push("/logs")

  openNetworkSelect = (e: any) => {
    this.setState({ networkSelect: !this.state.networkSelect })
  }

  openAccountSelect = (e: any) => {
    if (!this.state.accountSelect) this.setState({ accountSelect: true })
  }

  switchNetwork = async (index: number) => {
    this.context.wallet.selectNetwork(index)
    this.refresh()
  }

  switchAccount = async (index: number) => {
    await this.context.wallet.selectAccount(index)
  }

  switchRoot = () => {
    if (this.context.switchview) this.context.switchview()
  }

  openWallet = async () => {
    dispatchCustomEvent({
      name: "create-modal", detail: {
        id: Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 5),
        modal: <WalletModal />
      }
    })
  }

  openLoginModalNotary = async () => {
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
    if (this.context.viewroot) {
      this.context.loadVerifierAndPendingRequests();
    }
    if (!this.context.wiewroot && this.context.wallet.isLogged) {
      this.context.loadClientRequests()
    }
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

  handleSearch = async (event: any) => {
    event.preventDefault()
    this.context.search(this.state.search)
  }

  render() {
    let context = this.context
    let { accountSelect, networkSelect } = this.state
    return (
      <div className="App">
        <div className="header">
          <div className="headerLeftRight">
            <div style={{ cursor: "pointer" }} onClick={this.goToHomePage}><img src={Logo} title="Return to home page" alt="Filecoin" /></div>
            <div className="networkselect" onClick={this.openNetworkSelect}>
              {networkSelect ?
                <div className="networkselectholder">
                  <div className="headertitles">Network Select</div>
                  {config.lotusNodes.filter((node: any, index: number) => config.networks.includes(node.name)).map((node: any, index: number) => {
                    return <div key={index} style={{ color: index === context.wallet.networkIndex ? '#003fe3' : 'inherit' }} className="networkentry" onClick={() => this.switchNetwork(index)}>{node.name}</div>
                  })}
                </div>
                : null}
              <div className="headertitles">Network selected</div>
              <div className="addressholder">{config.lotusNodes[context.wallet.networkIndex].name}</div>
            </div>
            <div className="refresh">
              <Button
                size="small"
                onClick={this.goToLogs}
                variant="text"
              >LOGS
              </Button>
            </div>
          </div>
          <div className="search" >
            <form onSubmit={this.handleSearch}>
              <Input
                name="search"
                placeholder="Search"
                onChange={this.handleChange}
              />
            </form>
          </div>
          <div className="headerLeftRight">
            <div className="refresh" onClick={this.refresh}>
              <RefreshIcon />
            </div>
            <div className="accountholder" onClick={(e) => this.openAccountSelect(e)} ref={this.modalRef}>
              {accountSelect ?
                <div className="accountselectholder" ref={this.viewSwitch}>
                  <div className="headertitles">Select Account Type</div>
                  <div>
                    <div>{context.viewroot ? 'Rootkey Holder' : 'Approved Notary'}</div>
                    <div className="viewswitch" >
                      <Toggle
                        active={context.viewroot}
                        name="accountview"
                        onChange={this.switchRoot}
                      />
                    </div>
                  </div>
                  {context.wallet.multisig && !context.viewroot ?
                    <React.Fragment>
                      <div className="headertitles">Multisig address</div>
                      <div className="accountentry">
                        <div>
                          <div className="datacapdata">
                            <span className="datacap">Datacap: {bytesToiB(this.getVerifierAmount(context.wallet.multisigID))}</span>
                            {context.wallet.multisig ?
                              <img src={Network} alt="network" />
                              : null}
                          </div>
                          <div className="accountdata">
                            <span className="accountaddress">{context.wallet.multisigAddress.length > 20 ? addressFilter(context.wallet.multisigAddress) : context.wallet.multisigAddress}</span>
                            <span className="copyaddress"><SVG.CopyAndPaste height='15px' /></span>
                          </div>
                        </div>
                      </div>
                    </React.Fragment>
                    : null}
                  <div className="headertitles">Account addresses</div>
                  <div className="accountModal">
                    {context.wallet.accounts.map((account: any, index: number) => {
                      return <div key={index} className="accountentry" style={{ backgroundColor: index === context.wallet.walletIndex ? '#C7C7C7' : 'inherit' }}>
                        <div>
                          <div className="datacapdata" onClick={() => this.switchAccount(index)} >
                            {!context.viewroot ? <span className="datacap">Datacap: {bytesToiB(this.getVerifierAmount(account))}</span> : <span className="datacap"></span>}
                            {context.wallet.accountsActive[account] ?
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
                  </div>
                  {context.wallet.accounts.length > 4 && <div className="arrowDownIcon"><KeyboardArrowDownIcon /></div>}
                  {context.wallet.wallet !== 'ledger' ?
                    <div>
                      <div className="importseedphrase" onClick={() => { this.openWallet() }}>Import seedphrase</div>
                      <div className="importseedphrase" onClick={() => { this.openLoginModalNotary() }}>Change multisig</div>
                    </div>
                    : null
                  }
                </div>
                : null}
              <div onClick={(e) => {
                e.stopPropagation()
                this.setState({ accountSelect: !accountSelect })
              }} className="headertitles">{context.viewroot ? 'Rootkey Holder ID' : 'Approved Notary ID'}</div>
              <div onClick={(e) => {
                e.stopPropagation()
                this.setState({ accountSelect: !accountSelect })
              }}>{addressFilter(context.wallet.activeAccount)}, {context.wallet.multisig && !context.viewroot ? context.wallet.multisigAddress.length > 20 ? addressFilter(context.wallet.multisigAddress) : context.wallet.multisigAddress : null}</div>
            </div>
            <div>
              {
                context.github.githubLogged ?
                  <div className="avatarContainer">
                    <img className="avatarImage" src={localStorage.getItem("avatar") || context.github.avatarUrl} alt="user_profile_photo" />
                  </div>
                  :
                  <div className="avatarContainer">
                    <img className="avatarImage" src="https://avatars.githubusercontent.com/u/72555788?v=4" alt="user_profile_photo" />
                  </div>}
            </div>
          </div>
        </div>
        {context.wallet.isLoading || !context.wallet.isLogged ? <div className="walletpicker"><LoaderSpinner /></div> : <Overview ref={this.child} />}
      </div >
    );
  }
}

export default memo(App);

