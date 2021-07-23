import React, { Component } from 'react';

import packageJson from '../../package.json'

class Footer extends Component {
    render() {
        return (
            <div className="footer">
                <p style={{"display":"none"}}>App version {packageJson.version}</p>
            </div >
        )
    }
}

export default Footer;
