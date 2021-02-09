import React, { Component } from 'react';
import Automatic from '../svg/automatic-modal.png';
import General from '../svg/general-modal.png';
import history from '../context/History'
// @ts-ignore
import { dispatchCustomEvent } from "slate-react-system";


class VerificationOptionsModal extends Component<{}> {

    constructor(props: {}) {
        super(props);
    }

    componentDidMount() {

    }

    onClick = (e: any) => {
        if (e.currentTarget.id === 'automatic') {
            window.open('https://verify.glif.io/', '_blank')
        } else if (e.currentTarget.id === 'general') {
            history.push({
                pathname: "/verifiers"
            })
        }
        dispatchCustomEvent({ name: "delete-modal", detail: {} })
    }

    render() {
        return (
            <div className="verificationoptions">
                <div className="methods">Select a Verification Method</div>
                <div className="buttoncard" id={"automatic"} onClick={(e) => this.onClick(e)} >
                    <div className="image"><img src={Automatic.toString()} alt={"automatic"}></img></div>
                    <div className="intro">
                        <div className="title">Automatic <p>Verification</p></div>
                    </div>
                    <div className="description">Get a small amount of DataCap automatically to start developing!</div>
                </div>
                <div className="buttoncard" id={"general"} onClick={(e) => this.onClick(e)}>
                    <div className="image"><img src={General.toString()} alt={"general"}></img></div>
                    <div className="intro">
                        <div className="title">General <p>Verification</p></div>
                    </div>
                    <div className="description">Request a larger DataCap allocation from a Notary in your region!</div>
                </div>
            </div>
        )
    }
}

export default VerificationOptionsModal;