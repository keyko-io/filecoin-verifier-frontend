import React from 'react';
import { useLocation } from 'react-router-dom';
// @ts-ignore
import { ButtonPrimary } from "slate-react-system";
import "./LearnMore.scss"

const LearnMore = () => {
    let { pathname } = useLocation();

    const checkDatacap = () => {
        window.open('https://verify.glif.io/', '_blank')
    }

    const navigate = () => {
        window.open('https://docs.filecoin.io/store/filecoin-plus/', '_blank')
    }

    return (
        <div className="learnmore">
            {pathname !== "/" && <ButtonPrimary style={{ marginRight: "30px" }} onClick={checkDatacap}>Check Remaining DataCap</ButtonPrimary>}
            <ButtonPrimary style={{ marginLeft: pathname === "/" ? "" : "30px" }} onClick={navigate}>Learn More</ButtonPrimary>
        </div >
    )

}

export default LearnMore;
