import React, { Component } from 'react';
// @ts-ignore
import Welcome from '../components/Welcome'
import Header from '../components/Header';
import TableMiners from '../components/TableMiners';
import { Data } from '../context/Data/Index'

class Miners extends Component<{}> {

  public static contextType = Data

  child: any

  constructor(props: {}) {
    super(props);
    this.child = React.createRef();
  }


  makeRequest = () => {
    this.child.current.contactVerifier();
  }

  navigate = () => {
    window.open('https://github.com/filecoin-project/notary-governance', '_blank')
  }

  render() {
    return (
      <div className="landing">
        <Header />
        <div className="container">
          <Welcome
            title="Welcome to the Filecoin Plus Registry"
            description="A public request is all about Dash launched a hot deterministic wallet! Stellar is a burned exchange during lots of wash trade, so someone slept on the trusted fish. It proves many difficulty behind some cold wallet! Since IOTA counted few hot gas..."
          />
          <div className="wrapperverifiers">
            <div className="tableselects" style={this.context.github.githubLogged === false ? { zIndex: -1 } : {}}>
            </div>
            <TableMiners ref={this.child} />
          </div>
        </div>
      </div>
    );
  }
}

export default Miners;