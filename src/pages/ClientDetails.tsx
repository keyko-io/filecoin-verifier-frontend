import React, { Component } from 'react';
// @ts-ignore
import WelcomeClient from '../components/WelcomeClient'
import Header from '../components/Header';
import { Data } from '../context/Data/Index'
import TableClientDetails from '../components/TableClientDetails';

class ClientDetails extends Component<{}> {

  public static contextType = Data

  child: any

  constructor(props: {}) {
    super(props);
    this.child = React.createRef();
  }

  render() {
    return (
      <div className="landing">
        <Header />
        <div className="container">
          <WelcomeClient />
          <div className="wrapperverifiers wrapperclients">
            <div className="tableselects" style={this.context.github.githubLogged === false ? { zIndex: -1 } : {}}>
            </div>
            <TableClientDetails />
          </div>
        </div>
      </div>
    );
  }
}

export default ClientDetails;