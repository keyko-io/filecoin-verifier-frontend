import React, { Component } from 'react';
import Logo from '../logo.svg';
// @ts-ignore
import { ButtonPrimary } from "slate-react-system";
import RootKey from './svg/root-key.svg';
import Welcome from '../components/Welcome'


type PreonboardingStates = {
  tabs: string
}


class Preonboarding extends Component<{}, PreonboardingStates> {

  state = {
    tabs: '0',
  }

  componentDidMount() {

  }

  showRootKey = async () => {
    this.setState({ tabs: "0" })
  }

  showVerifier = async () => {
    this.setState({ tabs: "1" })
  }

  render() {
    return (
      <div className="preonboarding">
        <div className="header">
          <div><img src={Logo} alt="Filecoin" /></div>
        </div>
        <div className="container">
          <Welcome />
          <div className="tabsholder">
            <div className={this.state.tabs === "0" ? "selected tab" : "tab"} onClick={() => { this.showRootKey() }}>Root Key Holder Wallet</div>
            <div className={this.state.tabs === "1" ? "selected tab" : "tab"} onClick={() => { this.showVerifier() }}>Verifier Wallet</div>
          </div>
          <div className="options">
            <div className="columnleft">
              <div><img src={RootKey} alt="For RKH & Verifiers" /></div>
            </div>
            <div className="columright">
              <div className="optiontitle">For Clients & Miners</div>
              <div className="optiondesc">Here is where you will manage all your deals with miners as you operate as a verified client. To become verified, you’ll need to manage your relationship with approved verifies here.</div>
            </div>
          </div>
          <div className="started">
            <div className="doublebutton">
              <ButtonPrimary>Load Browser Wallet</ButtonPrimary>
              <ButtonPrimary>Load Ledger Wallet</ButtonPrimary>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Preonboarding;
