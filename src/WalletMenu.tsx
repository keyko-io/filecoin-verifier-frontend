import React, { Component } from 'react';
import { Wallet } from './context/Index'
import Blockies from 'react-blockies';
// @ts-ignore
import { dispatchCustomEvent, H1, ButtonSecondary } from "slate-react-system";

class WalletMenu extends Component {
  public static contextType = Wallet

  componentDidMount () {
    this.context.getAccounts()
  }

  selectAccount = async (index:number) => {
    this.context.selectAccount(index)
    this.closeWallet()
  }

  openWallet = async () => {
    const accounts = await this.context.getAccounts()
    let modal = (
      <div className="accountModal">
        <H1>Account select</H1>
        <div className="accountsHolder">
          {accounts.map((account:any,index:any) => 
            <div className="account" key={index} onClick={()=>this.selectAccount(index)}>{account}</div>
          )}
        </div>
        <ButtonSecondary onClick={this.closeWallet}>Close</ButtonSecondary>
      </div>
    );
    dispatchCustomEvent({ name: "create-modal", detail: {
      id: Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 5),
      modal
    }});
  }

  closeWallet = () => {
    dispatchCustomEvent({ name: "delete-modal", detail: {} });
  };

  render() {
    return (
      <div className="WalletMenu" onClick={()=>{this.openWallet()}}>
        <Blockies
            seed={this.context.activeAccount}
            size={10}
            scale={4}
            color="#dfe"
            bgColor="#ffe"
            spotColor="#abc"
        />
      </div>
    );
  }
}

export default WalletMenu;
