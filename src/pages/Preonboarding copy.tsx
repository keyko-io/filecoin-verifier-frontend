import React, { Component } from 'react';
// @ts-ignore
import { ButtonSecondary } from "slate-react-system";
import Globe from './svg/globe.svg'


class Preonboarding extends Component<{}> {

  render() {
    return (
      <div className="preonboarding">
        <div className="container">
        <div className="globe"><img src={Globe} alt="Globe"/></div>
          <div className="title">What is the Filecoin Pro Registry?</div>
          <div className="description">Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.</div>
          <div className="buttons">
            <div className="button"><ButtonSecondary>Load Browser Wallet</ButtonSecondary></div>
            <div className="button"><ButtonSecondary>Load Ledger Wallet</ButtonSecondary></div>
          </div>
        </div>
      </div>
    );
  }
}

export default Preonboarding;
