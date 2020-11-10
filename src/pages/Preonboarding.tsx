import React, { Component } from 'react';
// @ts-ignore
import { ButtonPrimary } from "slate-react-system";
import RootKey from './svg/root-key.svg';
import Verifiers from './svg/verifier-wallet.svg';
import Welcome from '../components/Welcome'
import { Location } from 'history';
import history from '../context/History'
import { Wallet } from '../context/Index'
import Header from '../components/Header';
import LearnMore from '../components/LearnMore';

type PreonboardingStates = {
  tabs: string
}

type LocationState = {
  state: { selected: Location };
};


class Preonboarding extends Component<{}, PreonboardingStates, LocationState> {
  public static contextType = Wallet

  constructor(props: { location: LocationState }) {
    super(props);
    const index = props.location.state.selected as unknown as Number;
    this.state = {
      tabs: index > 0 ? index.toString() : '0'
    }
  }

  componentDidMount() {
  }

  showRootKey = async () => {
    this.setState({ tabs: "0" })
  }

  showVerifier = async () => {
    this.setState({ tabs: "1" })
  }

  loadLedgerWallet = async () => {
    const logged = await this.context.loadWallet('Ledger')
    if (logged) {
      if (this.state.tabs === "0" && this.context.viewroot === false) {
        this.context.switchview()
      }
      history.push({
        pathname: "/app"
      })
    }
  }

  loadBurnerWallet = async () => {
    const logged = await this.context.loadWallet('Burner')
    if (logged) {
      if (this.state.tabs === "0" && this.context.viewroot === false) {
        this.context.switchview()
      }
      history.push({
        pathname: "/app"
      })
    }
  }

  render() {
    return (
      <div className="preonboarding">
        <Header />
        <div className="container">
          <Welcome
            title="Load Rootkey Holder Wallet"
            description="Here is where you will manage all your verifiers as you operate as a rootkey holder. To become a rootkey holder, you’ll need to have been selected by the network originally."
          />
          <div className="tabsholder">
            <div className={this.state.tabs === "0" ? "selected tab" : "tab"} onClick={() => { this.showRootKey() }}>RootKey Holder Wallet</div>
            <div className={this.state.tabs === "1" ? "selected tab" : "tab"} onClick={() => { this.showVerifier() }}>Notary Wallet</div>
          </div>
          <div className="options">
            <div className="columnleft">
              <div>{this.state.tabs === "0" ?
                <img src={RootKey} alt="For RKH & Verifiers" />
                : <img src={Verifiers} alt="For RKH & Verifiers" />
              }
              </div>
            </div>
            {this.state.tabs === "0" ?
              <div className="columright">
                <div className="optiontitle">Log in as a Root Key Holder</div>
                <div className="optiondesc"> Here is where you can action pending Notary allocation decisions.</div>
              </div>
              :
              <div className="columright">
                <div className="optiontitle">Log in as a Notary</div>
                <div className="optiondesc">Here is where you can manage pending public requests and action DataCap allocation decisions.</div>
              </div>}
          </div>
          <div className="started">
            <div className="doublebutton buttonsholder">
              <div className="buttonlegend">
                <ButtonPrimary onClick={() => this.loadBurnerWallet()}>Load Browser wallet</ButtonPrimary>
                <div className="info">
                  <p>Not available for Mainnet</p>
                </div>
              </div>
              <div className="buttonlegend">
                <ButtonPrimary onClick={() => this.loadLedgerWallet()}>Load Ledger wallet</ButtonPrimary>
                <div className="info">
                  <p>1) Please ensure you have the latest firmware with Ledger</p>
                  <p>2) Please ensure your ledger is plugged in and unlocked</p>
                  <p>3) Please ensure you have “expert mode” enabled</p>
                </div>
              </div>
            </div>
          </div>
          <LearnMore />
        </div>
      </div>
    );
  }
}

export default Preonboarding;
