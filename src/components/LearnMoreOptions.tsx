import React, { Component } from 'react';
// @ts-ignore
import { ButtonPrimary } from "slate-react-system";
import history from '../context/History'


class LearnMoreOptions extends Component {

    navigate = () => {
        window.open('https://docs.filecoin.io/store/filecoin-plus/', '_blank')
    }

    miners = () => {
        history.push({
            pathname: "/miners"
        })
    }

    checkDatacap = () => {
        window.open('https://verify.glif.io/', '_blank')
    }

    render() {
        return (
            <div className="learnmoreoptions">
                <div className="learnleft"><ButtonPrimary onClick={() => this.checkDatacap()}>Check Remaining DataCap</ButtonPrimary></div>
                <div className="learnright"><ButtonPrimary onClick={() => this.navigate()}>Learn More</ButtonPrimary></div>
            </div >
        )
    }
}

export default LearnMoreOptions;
