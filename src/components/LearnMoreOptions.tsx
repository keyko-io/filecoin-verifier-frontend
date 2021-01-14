import React, { Component } from 'react';
// @ts-ignore
import { ButtonPrimary } from "slate-react-system";
import history from '../context/History'


class LearnMoreOptions extends Component {

    navigate = () => {
        window.open('https://github.com/filecoin-project/filecoin-plus-client-onboarding', '_blank')
    }

    miners = () => {
        history.push({
            pathname: "/miners"
          })
    }

    render() {
        return (
            <div className="learnmoreoptions">
                <div className="learnleft"><ButtonPrimary>Check Datacap</ButtonPrimary></div>
                <div className="learncenter"><ButtonPrimary onClick={() => this.navigate()}>Learn More</ButtonPrimary></div>
                <div className="learnright"><ButtonPrimary onClick={() => this.miners()}>Miners</ButtonPrimary></div>
            </div >
        )
    }
}

export default LearnMoreOptions;
