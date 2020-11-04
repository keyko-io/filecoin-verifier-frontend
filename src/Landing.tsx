import React, { Component } from 'react';
import { library } from '@fortawesome/fontawesome-svg-core'
import { fab } from '@fortawesome/free-brands-svg-icons'
import { far } from '@fortawesome/free-regular-svg-icons'
import { fas } from '@fortawesome/free-solid-svg-icons'
import { Wallet } from './context/Index'
// @ts-ignore
import { ButtonPrimary } from "slate-react-system"

library.add(fab, far, fas)

type States = {
  page: string
}

class App extends Component<{},States> {
  public static contextType = Wallet

  constructor(props: {}) {
    super(props)
    this.state = {
      page: ''
    }
  }

  componentDidMount () {

  }

  render() {
    return (
      <div>
        <div className="walletpicker">
          <ButtonPrimary onClick={()=>this.context.loadWallet('Burner')}>Load Browser wallet</ButtonPrimary>
          <ButtonPrimary onClick={()=>this.context.loadWallet('Ledger')}>Load Ledger wallet</ButtonPrimary>
        </div>
      </div>
    );
  }
}

export default App;
