import React, { Component } from 'react';
import Logo from '../svg/github-logo.png';

type WelcomeClientProps = {
    client: string,
    user: string
    address: string,
    datacap: string
}


class WelcomeClient extends Component<WelcomeClientProps> {

    constructor(props: WelcomeClientProps) {
        super(props);
    }

    render() {
        return (
            <div className="welcome welcomedetail">
                <div className="overview">
                    <p className="name">Overview -</p>
                    <p className="clientname">{this.props.client}</p>
                </div>
                <div className="githubinfo">
                    <div className="githubuser">
                        <p className="usertitle">Github user</p>
                        <p className="username">{this.props.user}</p>
                    </div>
                    <div className="githubprofile">
                        <a href={`https://github.com/${this.props.user}/`} target="blank">
                            <img src={Logo} alt="githublogo" />
                            <p>Github profile</p></a>
                    </div>
                </div>
                <div className="request">
                    <p className="requesttitle">Request data</p>
                    <p className="requestdata">
                        <p className="field">Client</p> <p>{this.props.client}</p>
                        <p className="field">Address</p> <p>{this.props.address}</p>
                        <p className="field">Datacap</p> <p>{this.props.datacap}</p>
                    </p>
                </div>
            </div>
        )
    }
}

export default WelcomeClient;
