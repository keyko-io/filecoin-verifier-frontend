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
        {this.state.page === '' ?
          <div className="wizzardfirst">
            <div className="wizzardElement" onClick={()=>this.setState({page:'small'})}>
              <div className="number">&lt; 1Tib</div>
              <div className="title">Requesting datacap (less then 1T of data)</div>
              <div className="description">Description explaining whole concept and additionaly confirming on datacap sizes</div>
            </div>
            <div className="wizzardElement" onClick={()=>this.setState({page:'medium'})}>
              <div className="number">&lt; 1Pib</div>
              <div className="title">Requesting datacap (more then 1T of data)</div>
              <div className="description">Description explaining whole concept and additionaly confirming on datacap sizes</div>
            </div>
            <div className="wizzardElement" onClick={()=>this.setState({page:'big'})}>
              <div className="number">1Pib +</div>
              <div className="title">Institution request (1P+ of data)</div>
              <div className="description">Description explaining whole concept and additionaly confirming on datacap sizes</div>
            </div>
          </div>
        :null}
        {this.state.page === 'small' ?
          <div>You are requesting datacap (less then 1T of data)</div>
        :null}
        {this.state.page === 'medium' ?
          <div>You are requesting datacap (more then 1T of data)</div>
        :null}
        {this.state.page === 'big' ?
          <div>Your are equesting datacap (1P+ of data)</div>
        :null}
      </div>
    );
  }
}

export default App;
