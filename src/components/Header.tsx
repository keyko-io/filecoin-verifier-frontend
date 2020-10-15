import React, { Component } from 'react';
import Logo from '../logo.svg';
import history from '../context/History'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'



class Header extends Component {
    onClick = () => {
        history.push({
            pathname: "/"
        })
    }

    render() {
        return (
            <div className="header">
                <div className="headerback">
                    <FontAwesomeIcon icon={["fas", "arrow-left"]} /> 
                    <div className="backtitle">Back</div> 
                </div>
                <div className="headerlogo" onClick={() => this.onClick()}><img src={Logo} alt="Filecoin" /></div>
            </div>
        )
    }
}

export default Header;
