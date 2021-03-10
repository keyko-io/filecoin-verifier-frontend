import React, { Component } from 'react';
// @ts-ignore
import WelcomeClient from '../components/WelcomeClient'
import Header from '../components/Header';
import { Data } from '../context/Data/Index'
import TableClientDetails from '../components/TableClientDetails';
import history from '../context/History'

type ClientDetailsStates = {
  name: string
  user: string
  address: string
  datacap: string
}


class ClientDetails extends Component<{}, ClientDetailsStates> {

  public static contextType = Data

  child: any

  constructor(props: {}) {
    super(props);
    this.child = React.createRef();
    this.state = {
      name: "",
      user: "",
      address: "",
      datacap: ""
    }
  }

  componentDidMount() {
    const params = history.location.state as any
    const name = params.client
    const user = params.user
    const address = params.address
    const datacap = params.datacap


    this.setState({ name, user, address, datacap })
  }

  render() {
    return (
      <div className="landing">
        <Header />
        <div className="container">
          <WelcomeClient client={this.state.name} user={this.state.user} address={this.state.address} datacap={this.state.datacap} />
          <div className="wrapperverifiers wrapperclients">
            <div className="tableselects" style={this.context.github.githubLogged === false ? { zIndex: -1 } : {}}>
            </div>
            <TableClientDetails user={this.state.user} />
          </div>
        </div>
      </div>
    );
  }
}

export default ClientDetails;