import React, { Component } from 'react';
// @ts-ignore
import { ButtonPrimary } from "slate-react-system";

type ModalProps = {
    clientRequests: any[],
    selectedClientRequests: any[],
    onClick: (target: any) => void;
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
        for (const request of this.props.clientRequests) {
            if (this.props.selectedClientRequests.includes(request.number)) {
                requestToShow.push({
                    address: request.data.address,
                    datacap: request.data.datacap
                })
            }
        }
        this.setState({ requestToShow })
    }


    render() {
        return (
            <div className="warnmodalledger" style={this.state.requestToShow.length > 1 ? {height: 150 + 20 * this.state.requestToShow.length} : {}}>
                {this.state.requestToShow.length === 1 ?
                    <div className="message">You are about to send a message to assign {this.state.requestToShow[0].datacap} datacap to the address {this.state.requestToShow[0].address}.
                    Please check you ledger to accept  and send the message</div>
                    :
                    <>
                        <div className="title">You are about to send a message to assign the following datacaps to the address</div>
                        <ul className="list">
                            {this.state.requestToShow.map(request => <li>Address: {request.address} {request.datacap} datacap</li>)}
                        </ul>
                    </>
                }
                <ButtonPrimary onClick={this.props.onClick}>Accept</ButtonPrimary>
            </div>
        )
    }
}

export default WarnModalVerify;