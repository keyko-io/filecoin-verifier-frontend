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
    message: string
}

class WarnModalVerify extends Component<ModalProps, ModalState> {

    constructor(props: ModalProps) {
        super(props);
        this.state = {
            requestToShow: [] as any[],
            message: ""
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
            this.setState({ message: "You are about to send a message to assign datacap to the following adresses" })
        } else if (this.props.origin === 'Sign' || this.props.origin === 'Cancel') {
            for (const request of this.props.clientRequests) {
                if (this.props.selectedClientRequests.includes(request.id)) {
                    requestToShow.push({
                        address: request.verifier,
                        datacap: request.datacap
                    })
                }
            }
            this.setState({
                message: this.props.origin === 'Sign' ?
                    "You are about to send a message to sign a transaction to approve datacap to the following adresses"
                    :
                    "You are about to send a message to cancel the transaction to the following adresses"
            })
        } else {
            for (const request of this.props.clientRequests) {
                if (this.props.selectedClientRequests.includes(request.number)) {
                    requestToShow.push({
                        address: request.address,
                        datacap: request.datacap
                    })
                }
            }
            this.setState({ message: "You are about to send a message to propose the following notaries with datacaps" })
        }

        this.setState({ requestToShow })
    }


    render() {
        return (
            <div className="warnmodalledger" style={
                { height: 220 + 30 * this.state.requestToShow.length }}>
                <div className="message">
                    {this.state.message}
                    <p>Please, check your ledger, after accepting this notification, to sign and send the message</p>
                </div>
                <table>
                    <thead>
                        <tr>
                            <td>Address</td>
                            <td>Datacap</td>
                        </tr>
                    </thead>
                    <tbody>
                        {this.state.requestToShow.map((request: any, index: any) =>
                            <tr key={index}>
                                <td>{request.address}</td>
                                <td>{request.datacap}</td>
                            </tr>
                        )}
                    </tbody>
                </table>
                <ButtonPrimary onClick={this.props.onClick}>Accept</ButtonPrimary>
            </div>
        )
    }
}

export default WarnModalVerify;