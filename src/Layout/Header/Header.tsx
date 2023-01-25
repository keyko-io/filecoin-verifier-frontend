import Logo from '../../svg/logo.svg';
import history from "../../context/History"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import "./Header.scss"


const Header = () => {
    const goHomePage = () => history.push({ pathname: "/" })
    const goBack = () => history.goBack()

    const addBorderBottom = history.location.pathname === "/client" ? { borderBottom: "1.5px solid #0090ff" } : {}

    return (
        <div className="layoutHeader" style={addBorderBottom} >
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
