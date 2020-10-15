import React, { Component } from 'react';
import Logo from '../logo.svg';

class Header extends Component {

    render() {
        return (
            <div className="header">
                <div className="headerback"></div>
                <div className="headerlogo"><img src={Logo} alt="Filecoin" /></div>
            </div>
        )
    }
}

export default Header;
