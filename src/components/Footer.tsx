import React, { Component } from 'react';

import packageJson from '../../package.json'

class Footer extends Component {
    render() {
        return (
            <div className="footer">
                App version {packageJson.version}
            </div >
        )
    }
}

export default Footer;
