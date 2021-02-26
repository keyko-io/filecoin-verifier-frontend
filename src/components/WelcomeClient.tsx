import React, { Component } from 'react';
import Logo from '../svg/github-logo.png';

class WelcomeClient extends Component {

    render() {
        return (
            <div className="welcome welcomedetail">
                <div className="overview">
                    <p className="name">Overview -</p>
                    <p className="clientname">Client Name</p>
                </div>
                <div className="githubinfo">
                    <div className="githubuser">
                        <p className="usertitle">Github user</p>
                        <p className="username">ialberquilla</p>
                    </div>
                    <div className="githubprofile">
                        <img src={Logo} alt="githublogo" />
                        <p>Github profile</p>
                    </div>
                </div>
                <div className="request">
                    <p className="requesttitle">Request data</p>
                    <p className="requestdata">
                        <p className="field">Client</p> <p>ialberquilla</p>
                        <p className="field">Address</p> <p>t1pzzebu25kgtwgsnoucduhejtu3nl4ckvqs6g6wy</p>
                        <p className="field">Datacap</p> <p>1Tb</p>
                    </p>
                </div>
            </div>
        )
    }
}

export default WelcomeClient;
