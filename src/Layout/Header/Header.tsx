import Logo from "../../svg/logo.svg"
import history from "../../context/History"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import "./Header.scss"
import DeprecationWarning from "../../components/DeprecationWarning/DeprecationWarning"

const Header = () => {
  const goHomePage = () => history.push({ pathname: "/" })
  const goBack = () => history.goBack()

  const addBorderBottom =
    history.location.pathname === "/client" ||
    history.location.pathname === "/info"
      ? {
          borderBottom: "1px solid #ebedf2",
          boxShadow: "0px 2px 10px 0px rgba(71,85,105,.1)",
        }
      : {}

  return (
    <div className="layoutHeader" style={addBorderBottom}>
      <div className="headerContent">
        {window.location.pathname.length === 1 ? null : (
          <div className="goBack" onClick={goBack}>
            <FontAwesomeIcon icon={["fas", "arrow-left"]} /> Back
          </div>
        )}
        <div className="logo" onClick={goHomePage}>
          <img src={Logo} alt="Filecoin" />
        </div>
      </div>
      <DeprecationWarning />
    </div>
  )
}

export default Header
