import React, { Component } from 'react';
import { Wallet } from './context/Index'
// @ts-ignore
import { dispatchCustomEvent, H3, Input, ButtonPrimary } from "slate-react-system";

type States = {
  seedphrase: string
};

class WalletModal extends Component<{}, States> {
  public static contextType = Wallet

  constructor(props: {}) {
    super(props);
    this.state = {
      seedphrase: ''
    }
  }

  componentDidMount () {

  }

  handleChange = (e:any) => {
    this.setState({ [e.target.name]: e.target.value } as any)
  }

  handleImport = () => {
    this.context.importSeed(this.state.seedphrase)
    this.closeWallet()
  }

  closeWallet = () => {
    dispatchCustomEvent({ name: "delete-modal", detail: {} })
  }

  render() {
    return (
      <div className="accountModal">
        <H3>Import seedphrase</H3>
        <Input
          description=""
          name="seedphrase"
          value={this.state.seedphrase}
          placeholder="Enter your seedphrase"
          onChange={this.handleChange}
        />
        <ButtonPrimary onClick={()=>this.handleImport()}>Import</ButtonPrimary>
      </div>
    )
  }
}

export default WalletModal;
