import React, { Component } from 'react';
// @ts-ignore
import { ButtonPrimary, Input } from "slate-react-system";
import Welcome from '../components/Welcome'
import TableVerifiers from '../components/TableVerifiers';
import Header from '../components/Header';


class Verifiers extends Component<{}> {

  child: any

  state = {
    search: "",
  }

  constructor(props: {}) {
    super(props);
    this.child = React.createRef();
  }


  makeRequest = () => {
    this.child.current.contactVerifier();
  }

  handleChange = (e: any) => {
    this.setState({ [e.target.name]: e.target.value } as any)
    this.child.current.filter(e.target.value);
  }

  navigate = () => {
    window.open('https://github.com/filecoin-project/filecoin-plus-client-onboarding', '_blank')
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
            <div className="tableselects">
              <div className="tabletitle">
                <div className="title">Select Notary, Send Request</div>
                <div className="searchMakeReuestForm doublebutton">
                  <ButtonPrimary onClick={() => this.makeRequest()}> Make Request </ButtonPrimary>
                  <ButtonPrimary onClick={() => this.navigate()}>Learn More</ButtonPrimary>
                  <form>
                    <Input
                      name="search"
                      value={this.state.search}
                      placeholder="Search"
                      onChange={this.handleChange}
                    />
                  </form>
                </div>
              </div>
            </div>
            <TableVerifiers ref={this.child} search={this.state.search} />
            <div className="started buttonsverifiers">
              <div className="doublebutton">
                <ButtonPrimary onClick={() => this.makeRequest()}>
                  Make Request
                </ButtonPrimary>
                <ButtonPrimary onClick={() => this.navigate()}>Learn More</ButtonPrimary>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Verifiers;