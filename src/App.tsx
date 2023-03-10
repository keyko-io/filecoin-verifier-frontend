import React, { useContext, useEffect, useRef, useState } from 'react';
import Overview from './components/OverviewApp/Overview'
import Logo from './svg/logo.svg';
import Network from './svg/filecoin-network.svg';
import { Data } from './context/Data/Index'
import { addressFilter, bytesToiB } from './utils/Filters'
import WalletModal from './modals/WalletModal'
import copy from 'copy-text-to-clipboard'
import './App.scss';
// @ts-ignore
import { dispatchCustomEvent, Toggle, SVG, LoaderSpinner } from "slate-react-system"
import { config } from './config'
import history from './context/History'
import LogAsNotaryModal from './modals/LogAsNotaryModal'
import { Button } from '@material-ui/core';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import RefreshIcon from '@mui/icons-material/Refresh';
import SearchIcon from '@mui/icons-material/Search';
import Paper from '@mui/material/Paper';
import InputBase from '@mui/material/InputBase';
import IconButton from '@mui/material/IconButton';
import { library } from '@fortawesome/fontawesome-svg-core'
import { fab } from '@fortawesome/free-brands-svg-icons'
import { far } from '@fortawesome/free-regular-svg-icons'
import { fas } from '@fortawesome/free-solid-svg-icons'

library.add(fab, far, fas)

const App = () => {
  const context = useContext(Data)

  const [networkSelect, setNetworkSelect] = useState(false)
  const [accountSelect, setAccountSelect] = useState(false)
  const [search, setSearch] = useState("")

  const modalRef = useRef<HTMLDivElement>(null)
  const viewSwitch = useRef<HTMLDivElement>(null)

  const closeModal = (e: any) => {
    if (e.path && e?.path[1] !== modalRef.current && !e.path.includes(viewSwitch.current)) {
      setAccountSelect(false)
    }
  }

  let isWalletLogged = context.wallet.isLogged

  useEffect(() => {
    document.body.addEventListener("click", closeModal)
    if (!isWalletLogged) history.push("/")

    return () => {
      document.body.removeEventListener("click", closeModal)
    }
  }, [isWalletLogged])

  const openNetworkSelect = () => setNetworkSelect(!networkSelect)

  const openAccountSelect = () => !accountSelect && setAccountSelect(true)

  const switchNetwork = async (index: number) => {
    context.wallet.selectNetwork(index)
    refresh()
  }

  const switchAccount = async (index: number) => {
    await context.wallet.selectAccount(index)
  }

  const switchRoot = () => {
    if (context.switchview) context.switchview()
  }

  const openWallet = async () => {
    dispatchCustomEvent({
      name: "create-modal", detail: {
        id: Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 5),
        modal: <WalletModal />
      }
    })
  }

  const openLoginModalNotary = async () => {
    dispatchCustomEvent({
      name: "create-modal", detail: {
        id: Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 5),
        modal: <LogAsNotaryModal type={"login"} />
      }
    })
  }

  const copyAddress = async (address: string) => {
    copy(address)
    context.wallet.dispatchNotification(address + ' copied to clipboard')
  }

  const refresh = () => {
    if (context.viewroot) context.loadVerifierAndPendingRequests();

    if (!context.viewroot && localStorage.getItem("loggedUser")) context.loadClientRequests()

    if (!context.viewroot && !localStorage.getItem("loggedUser")) {
      context.wallet.dispatchNotification("You should login first for this action!!")
    }
  }

  const getVerifierAmount = (account: string) => {
    for (const verified of context.verified) {
      if (account === verified.verifierAccount) {
        return Number(verified.datacap)
      }
    }
    return 0
  }

  const handleSearch = async (e: any) => {
    e.preventDefault()
    context.search(search)
  }

  return (
    <div className="App">
      <div className="header">
        <div className="headerLeftRight">
          <div style={{ cursor: "pointer" }} onClick={() => history.push("/")}><img src={Logo} title="Return to home page" alt="Filecoin" /></div>
          <div className="networkselect" onClick={openNetworkSelect}>
            {networkSelect ?
              <div className="networkselectholder">
                <div className="headertitles">Network Select</div>
                {config.lotusNodes.filter((node: any, index: number) => config.networks.includes(node.name)).map((node: any, index: number) => {
                  return <div key={index} style={{ color: index === context.wallet.networkIndex ? '#003fe3' : 'inherit' }} className="networkentry" onClick={() => switchNetwork(index)}>{node.name}</div>
                })}
              </div>
              : null}
            <div className="headertitles">Network selected</div>
            <div className="addressholder">{config.lotusNodes[context.wallet.networkIndex].name}</div>
          </div>
          <div className="refresh">
            <Button
              size="small"
              onClick={() => history.push("/logs")}
              variant="text"
            >LOGS
            </Button>
          </div>
        </div>

        {/* SEARCH COMPONENT */}
        <Paper
          component="form"
          onSubmit={handleSearch}
          sx={{ p: '2px 4px', display: 'flex', alignItems: 'center', width: 300, height: 40 }}
          elevation={3}
        >
          <InputBase
            sx={{ ml: 1, flex: 1 }}
            placeholder="Search"
            onChange={(e) => setSearch(e.target.value)}
          />
          <IconButton type="button" aria-label="search" onClick={handleSearch}>
            <SearchIcon  sx={{ color: "rgb(0, 127, 255)", fontSize: "24px" }} />
          </IconButton>
        </Paper>
        {/* SEARCH COMPONENT */}

        <div className="headerLeftRight">
          <div className="refresh" onClick={refresh}>
            <RefreshIcon />
          </div>
          <div className="accountholder" onClick={openAccountSelect} ref={modalRef}>
            {accountSelect ?
              <div className="accountselectholder" ref={viewSwitch}>
                <div style={{
                  display: "flex",
                  justifyContent : "space-between",
                  alignItems: "center"
                }}>
 
                 <div>
                   <div className="headertitles">Select Account Type</div>
                   <div>{context.viewroot ? 'Rootkey Holder' : 'Approved Notary'}</div>
                 </div>
                        
                  <div className="viewswitch" >
                    <Toggle
                      active={context.viewroot}
                      name="accountview"
                      onChange={switchRoot}
                    />
                  </div>

                </div>

                {context.wallet.multisig && !context.viewroot ?
                  <React.Fragment>
                    <div className="headertitles">Multisig address</div>
                    <div className="accountentry">
                      <div>
                        <div className="datacapdata">
                          <span className="datacap">Datacap: {bytesToiB(getVerifierAmount(context.wallet.multisigID))}</span>
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
                <div className="headertitles" style={{paddingTop : "10px"}}>Account addresses</div>
                <div className="accountModal">
                  {context.wallet.accounts.map((account, index) => {
                    return <div key={index} className="accountentry" style={{ backgroundColor: index === context.wallet.walletIndex ? '#C7C7C7' : 'inherit' }}>
                      <div>
                        <div className="datacapdata" onClick={() => switchAccount(index)} >
                          {!context.viewroot ? <span className="datacap">Datacap: {bytesToiB(getVerifierAmount(account))}</span> : <span className="datacap"></span>}
                          {context.wallet.accountsActive[account] ?
                            <img src={Network} alt="network" />
                            : null}
                        </div>
                        <div className="accountdata">
                          <span className="accountaddress" onClick={() => switchAccount(index)} >{addressFilter(account)}</span>
                          <span className="copyaddress" onClick={() => copyAddress(account)}><SVG.CopyAndPaste height='15px' /></span>
                        </div>
                      </div>
                    </div>
                  })}
                </div>
                {context.wallet.accounts.length > 5 && <div className="arrowDownIcon"><KeyboardArrowDownIcon fontSize='large' /></div>}
                {context.wallet.wallet !== 'ledger' ?
                  <div>
                    <div className="importseedphrase" onClick={() => { openWallet() }}>Import seedphrase</div>
                    <div className="importseedphrase" onClick={() => { openLoginModalNotary() }}>Change multisig</div>
                  </div>
                  : null
                }
              </div>
              : null}
            <div onClick={(e) => {
              e.stopPropagation()
              setAccountSelect(!accountSelect)
            }} className="headertitles">{context.viewroot ? 'Rootkey Holder ID' : 'Approved Notary ID'}</div>
            <div onClick={(e) => {
              e.stopPropagation()
              setAccountSelect(!accountSelect)
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
      {context.wallet.isLoading || !context.wallet.isLogged ? <div className="walletpicker"><LoaderSpinner /></div> : <Overview />}
    </div >
  );
}

export default App

