import { throws } from 'assert';
import React, { Component } from 'react';
// @ts-ignore
import { ButtonPrimary } from "slate-react-system";
import { datacapFilter } from "../utils/Filters"

type ModalProps = {
    clientRequests: any[],
    selectedClientRequests: any[],
    onClick: (target: any) => void;
    origin: string
}

type ModalState = {
    requestToShow: any[]
}

class WarnModalVerify extends Component<ModalProps, ModalState> {

    constructor(props: ModalProps) {
        super(props);
        this.state = {
            requestToShow: [] as any[]
        }
    }


    componentDidMount() {
        let requestToShow = []

        if (this.props.origin === 'Notary') {
            for (const request of this.props.clientRequests) {
                if (this.props.selectedClientRequests.includes(request.number)) {
                    requestToShow.push({
                        address: request.data.address,
                        datacap: request.data.datacap
                    })
                }
            }
        } else if (this.props.origin === 'Sign' || this.props.origin === 'Cancel') {
            for (const request of this.props.clientRequests) {
                if (this.props.selectedClientRequests.includes(request.id)) {
                    requestToShow.push({
                        address: request.verifier,
                        datacap: request.datacap
                    })
                }
            }
        } else {
            for (const request of this.props.clientRequests) {
                if (this.props.selectedClientRequests.includes(request.number)) {
                    requestToShow.push({
                        address: request.address,
                        datacap: request.datacap
                    })
                }
            }
        }

        this.setState({ requestToShow })
    }


    render() {
        return (
            <div className="warnmodalledger" style={this.state.requestToShow.length > 1 ? 
            { height: 180 + 20 * this.state.requestToShow.length, width : this.props.origin === 'Propose' ? 650: 450} 
            : {} }>
                {this.state.requestToShow.length === 1 ?
                    this.props.origin === 'Notary' ?
                        <div className="message">You are about to send a message to assign {this.state.requestToShow[0].datacap} datacap to the address {this.state.requestToShow[0].address}.
                    <p>Please check you ledger to accept  and send the message</p></div>
                        :
                        this.props.origin === 'Sign' ?
                            <div className="message">You are about to send a message to sign a transaction to approve the notary {this.state.requestToShow[0].address} with datacap {datacapFilter(this.state.requestToShow[0].datacap)}.
                            <p>Please check you ledger to accept  and send the message</p></div>
                            : this.props.origin === 'Cancel' ? 
                                <div className="message">You are about to send a message to cancel the transaction of the address {this.state.requestToShow[0].address} with datacap {datacapFilter(this.state.requestToShow[0].datacap)}.
                                <p>Please check you ledger to accept  and send the message</p></div>
                            :
                                <div className="message">You are about to send a message to propose the notary {this.state.requestToShow[0].address} with datacap {datacapFilter(this.state.requestToShow[0].datacap)}.
                                <p>Please check you ledger to accept  and send the message</p></div>
                    :
                    <>
                        {this.props.origin === 'Notary' ?
                            <div className="title">You are about to send a message to assign the following datacaps to the address. <p>Please check you ledger to accept  and send the message</p></div>
                            : this.props.origin === 'Sign' ?
                                <div className="title">You are about to send a message to sign the transactions of the following notaries with datacaps. <p>Please check you ledger to accept and send the message</p></div> 
                                : this.props.origin === 'Cancel' ? 
                                    <div className="title">You are about to send a message to cancel the following address with datacaps. <p>Please check you ledger to accept  and send the message</p></div>
                                    :
                                    <div className="title">You are about to send a message to propose the following notaries with datacaps. <p>Please check you ledger to accept  and send the message</p></div>
                        }
                        <ul className="list">
                            {this.state.requestToShow.map(request => <li>Address: {request.address} datacap {this.props.origin === 'Notary' ? request.datacap : datacapFilter(request.datacap)}</li>)}
                        </ul>
                    </>
                }
                <ButtonPrimary onClick={this.props.onClick}>Accept</ButtonPrimary>
            </div>
        )
    }
}

export default WarnModalVerify;