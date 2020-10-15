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

    goBack = () => {
        history.goBack()
    }


    render() {
        return (
            <div className="header">
                {window.location.pathname.length === 1 ? null :
                    < div className="headerback" onClick={() => this.goBack()}>
                        <FontAwesomeIcon icon={["fas", "arrow-left"]} /> Back
                    </div>
                }
                <div className="headerlogo" onClick={() => this.onClick()}><img src={Logo} alt="Filecoin" /></div>
            </div >
        )
    }
}

export default Header;
