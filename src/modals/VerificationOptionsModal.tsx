import React, { Component } from 'react';
import history from '../context/History'
// @ts-ignore
import { dispatchCustomEvent } from "slate-react-system";


class VerificationOptionsModal extends Component<{}> {

    onClick = (e: any) => {
        if (e.currentTarget.id === 'automatic') {
            window.open('https://verify.glif.io/', '_blank')
        } else if (e.currentTarget.id === 'general') {
            history.push({
                pathname: "/verifiers"
            })
        }
        else if (e.currentTarget.id === 'ldn') {
            history.push({
                pathname: "/ldn-application"
            })
        }
        dispatchCustomEvent({ name: "delete-modal", detail: {} })
    }

    render() {
        return (
            <div className="verificationoptions">
                <div className="methods">Select a Verification Method</div>
                <div className="buttoncard" id={"automatic"} onClick={(e) => this.onClick(e)} >
                    <div className="intro">
                        <div className="title">Automatic Verification</div>
                    </div>
                    <div className="description">Get a small amount of DataCap automatically to start developing!</div>
                </div>
                <div className="buttoncard" id={"general"} onClick={(e) => this.onClick(e)}>
                    <div className="intro">
                        <div className="title">General Verification</div>
                    </div>
                    <div className="description">Request a larger DataCap allocation from a Notary in your region!</div>
                </div>
                <div className="buttoncard" id={"ldn"} onClick={(e) => this.onClick(e)}>
                    <div className="intro">
                        <div className="title">Large Dataset Application</div>
                    </div>
                    <div className="description">Open an application for datasets greater than 50TiB of DataCap</div>
                </div>
            </div>
        )
    }
}

export default VerificationOptionsModal;