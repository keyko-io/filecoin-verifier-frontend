import React, { Component } from 'react';
import Logo from '../logo.svg';
// @ts-ignore
import { ButtonPrimary } from "slate-react-system";
import RootKey from './svg/root-key.svg';

class Preonboarding extends Component<{}> {

  render() {
    return (
      <div className="preonboarding">
        <div className="header">
          <div><img src={Logo} alt="Filecoin" /></div>
        </div>
        <div className="container">
          <div className="welcome">
            <div className="title">Load Rootkey Holder Wallet</div>
            <div className="description">Here is where you will manage all your verifiers as you operate as a rootkey holder. To become a rootkey holder, you’ll need to have been selected by the network originally.</div>
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
