import React, { Component } from 'react';
import Sent from './svg/sent.svg'
// @ts-ignore
import { ButtonPrimary, dispatchCustomEvent } from "slate-react-system";



type ConfirmModalProps = {
    error?: boolean
}

class ConfirmModal extends Component<ConfirmModalProps> {

    handleSubmit = async (e: any) => {
        dispatchCustomEvent({ name: "delete-modal", detail: {} })
    }

    constructor(props: ConfirmModalProps) {
        super(props);
    }

    render() {
        return (
            <>
                {this.props.error ?
                    <div className="errormodal">
                        <div className="title">Error</div>
                        <div className="description">There was an error on your request</div>
                    </div>
                    :
                    <div className="confirmmodal">
                        <div className="title">Request Sent!</div>
                        <div className="description">Your request has just been sent, you should hear back within a few days or so.</div>
                        <div className="img"><img src={Sent} alt={"sent message"} /></div>
                        <div className="button"><ButtonPrimary onClick={this.handleSubmit}>Return</ButtonPrimary> </div>
                    </div>}
            </>
        )
    }
}

export default ConfirmModal;
