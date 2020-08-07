import React, { Component } from 'react';
import { Wallet } from './context/Index'
// @ts-ignore
import { dispatchCustomEvent, H1, Input, ButtonPrimary } from "slate-react-system";

type States = {
  seedphrase: string
  accounts: any[]
};

class WalletModal extends Component<{}, States> {
  public static contextType = Wallet

  constructor(props: {}) {
    super(props);
    this.state = {
        seedphrase: '',
        accounts: []
    }
}

  componentDidMount () {
    this.loadAccounts()
  }

  loadAccounts = async () => {
    const accounts = await this.context.getAccounts()
    console.log('accounts', accounts, this.context)
    this.setState({ accounts })
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
      this.loadAccounts()
    })
  }

  closeWallet = () => {
    dispatchCustomEvent({ name: "delete-modal", detail: {} });
  };

  render() {
    return (
      <div className="accountModal">
        <H1>Account select</H1>
        <div className="accountsHolder">
          {this.state.accounts.map((account:any,index:any) => 
            <div className="account" style={{ color: index === this.context.walletIndex ? '#003fe3' : 'inherit' }} key={index} onClick={()=>this.selectAccount(index)}>{account}</div>
          )}
        </div>
        <H1>Import seedphrase</H1>
        <Input
          description=""
          name="seedphrase"
          value={this.state.seedphrase}
          placeholder="Enter your seedphrase"
          onChange={this.handleChange}
        />
        <ButtonPrimary onClick={()=>this.handleImport()}>Import</ButtonPrimary>
      </div>
    );
  }
}

export default WalletModal;
