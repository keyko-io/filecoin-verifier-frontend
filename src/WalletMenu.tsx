import React, { Component } from 'react';
import { Wallet } from './context/Index'
import WalletModal from './WalletModal'
import Blockies from 'react-blockies';
// @ts-ignore
import { dispatchCustomEvent } from "slate-react-system";

type States = {
  seedphrase: string
};

class WalletMenu extends Component<{}, States> {
  public static contextType = Wallet

  constructor(props: {}) {
    super(props);
    this.state = {
        seedphrase: ''
    }
}

  componentDidMount () {
    this.context.getAccounts()
  }

  selectAccount = async (index:number) => {
    this.context.selectAccount(index)
    this.closeWallet()
  }

  handleChange = (e:any) => {
    this.setState({ [e.target.name]: e.target.value } as any)
  }

  handleImport = () => {
    this.context.importSeed(this.state.seedphrase)
    this.setState({seedphrase:''},()=>{
      this.closeWallet()
    })
  }

  openWallet = async () => {
    dispatchCustomEvent({ name: "create-modal", detail: {
      id: Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 5),
      modal: <WalletModal/>
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
