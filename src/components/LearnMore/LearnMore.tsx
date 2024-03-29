import { useLocation } from 'react-router-dom';
// @ts-ignore
import { ButtonPrimary } from "slate-react-system";
import "./LearnMore.scss"
import history from "../../context/History";

const LearnMore = () => {
    let { pathname } = useLocation();

    const checkDatacap = () => {
        window.open('https://verify.glif.io/', '_blank')
    }

    const goTo = (params: string) => {
        history.push({
            pathname: `/${params}`
        })
    }

    const navigate = () => {
        window.open('https://docs.filecoin.io/store/filecoin-plus/', '_blank')
    }

    return (
        <div className="learnmore" style={{display : "flex", justifyContent : "space-around"}}>
            {pathname !== "/" ?
                <ButtonPrimary onClick={checkDatacap}>Check Remaining DataCap</ButtonPrimary>
                : <ButtonPrimary  onClick={() => goTo("logs")}>See the logs</ButtonPrimary>}
            <ButtonPrimary  onClick={navigate}>Learn More</ButtonPrimary>
            <ButtonPrimary onClick={() => goTo("status")}>Status Page</ButtonPrimary>
            <ButtonPrimary  onClick={() => goTo("info")}>Sentry Metrics</ButtonPrimary>
        </div >
    )

}

export default LearnMore;
