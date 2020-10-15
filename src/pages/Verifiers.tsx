import React, { Component } from 'react';
// @ts-ignore
import { ButtonPrimary } from "slate-react-system";
import Welcome from '../components/Welcome'
import TableVerifiers from '../components/TableVerifiers';
import Header from '../components/Header';

class Verifiers extends Component<{}> {

  child: any

  constructor(props: {}) {
    super(props);
    this.child = React.createRef();
  }


  makeRequest = () => {
    this.child.current.contactVerifier();
  }

  render() {
    return (
      <div className="landing">
        <Header/>
        <div className="container">
          <Welcome
            title="Welcome to the Filecoin Plus Registry"
            description="A public request is all about Dash launched a hot deterministic wallet! Stellar is a burned exchange during lots of wash trade, so someone slept on the trusted fish. It proves many difficulty behind some cold wallet! Since IOTA counted few hot gas..."
          />
          <TableVerifiers ref={this.child} />
          <div className="started">
            <div className="doublebutton">
              <ButtonPrimary onClick={() => this.makeRequest()}>
                Make Request
              </ButtonPrimary>
              <ButtonPrimary>Learn More</ButtonPrimary>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Verifiers;
