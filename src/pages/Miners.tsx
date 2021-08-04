import React, { Component } from 'react';
// @ts-ignore
import { Input } from "slate-react-system";
import Welcome from '../components/Welcome'
import Header from '../components/Header';
import TableMiners from '../components/TableMiners';
import { Data } from '../context/Data/Index'

class Miners extends Component<{}> {

  public static contextType = Data

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

  navigate = () => {
    window.open('https://github.com/filecoin-project/notary-governance', '_blank')
  }

  handleChange = (e: any) => {
    this.setState({ [e.target.name]: e.target.value } as any, () => console.log(this.state))
    this.child.current.filter(e.target.value);
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
            {/* <div className="tableselects" style={this.context.github.githubLogged === false ? { zIndex: -1 } : {}}> */}
            <div className="tabletitle">
                <div className="title">Search Notary</div>
                <div className="formname">
                  <form>
                    <Input
                      name="search"
                      value={this.state.search}
                      placeholder="Search Notary"
                      onChange={this.handleChange}
                    />
                  </form>
                </div>
              </div>
            </div>
            <TableMiners ref={this.child} />
          </div>
        </div>
      </div>
    );
  }
}

export default Miners;