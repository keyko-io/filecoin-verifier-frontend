import React, { Component } from 'react';


class Welcome extends Component {

    render() {
        return (
            <div className="welcome">
                <div className="title">Welcome to the Filecoin Pro Registry</div>
                <div className="description">You may proceed in any of these pathways but you may not have access to all three. It all depends on whether you’ve been granted access to it by either the network, a rootkey holder, or an approved verifier respectively.</div>
            </div>
        )
    }
}

export default Welcome;
