import React from 'react';
import Logo from '../../svg/logo.svg';
import history from "../../context/History"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import "./Header.scss"


const Header = () => {
    const goHomePage = () => history.push({ pathname: "/" })
    const goBack = () => history.goBack()

    return (
        <div className="layoutHeader" >
            {
                window.location.pathname.length === 1 ? null :
                    < div className="goBack" onClick={goBack}>
                        <FontAwesomeIcon icon={["fas", "arrow-left"]} /> Back
                    </div>
            }
            < div onClick={goHomePage}> <img src={Logo} alt="Filecoin" /></div >
        </div >
    )
}

export default Header;
