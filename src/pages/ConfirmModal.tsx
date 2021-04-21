import React, { Component } from 'react';
import Sent from '../svg/sent.svg'
// @ts-ignore
import { ButtonPrimary, dispatchCustomEvent } from "slate-react-system";

type ConfirmModalProps = {
    error?: boolean,
    url?: string
}

class ConfirmModal extends Component<ConfirmModalProps> {

    handleSubmit = async (e: any) => {
        dispatchCustomEvent({ name: "delete-modal", detail: {} })
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
                        {this.props.url ?
                            <>
                                <div className="title">Request Sent!</div>
                                <div className="description">Your request has been sent. You can find the github issue
                                <a target="_blank" rel="noopener noreferrer" href={this.props.url}> here</a>
                                </div>
                                <div className="warn">Please subscribe to notifications for this Issue to be aware of updates. Notaries may request additional information on the Issue.</div>
                                <div className="img"><img src={Sent} alt={"sent message"} /></div>
                                <div className="button"><ButtonPrimary onClick={this.handleSubmit}>Return</ButtonPrimary> </div>
                            </> :
                            <>
                                <div className="title">Request Sent!</div>
                                <div className="description">Your request has just been sent, you should hear back within a few days or so.</div>
                                <div className="img"><img src={Sent} alt={"sent message"} /></div>
                                <div className="button"><ButtonPrimary onClick={this.handleSubmit}>Return</ButtonPrimary> </div>
                            </>}

                    </div>}
            </>
        )
    }
}

export default ConfirmModal;
