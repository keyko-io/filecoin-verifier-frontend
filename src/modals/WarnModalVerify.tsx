import React, { Component } from 'react';
// @ts-ignore
import { ButtonPrimary } from "slate-react-system";
import { anyToBytes } from "../utils/Filters"

type ModalProps = {
    clientRequests: any[],
    selectedClientRequests: any[],
    onClick: (target: any) => void;
    origin: string,
    largeAddress?: boolean
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
                        address: this.props.largeAddress ? request.address : request.data.address,
                        datacap: request.data.datacap ? request.data.datacap : request.datacap
                    })
                }
            }
            this.setState({ message: "You are about to send a message to assign DataCap to the following addresses:" })
        } else if (this.props.origin === 'ProposeSign' || this.props.origin === 'Cancel') {
            for (const request of this.props.clientRequests) {
                if (this.props.selectedClientRequests.includes(request.id)) {
                    requestToShow.push({
                        address: request.addresses,
                        datacap: request.datacaps.map((datacap: any) => anyToBytes(datacap) === 0 ? 'Notary will be removed' : datacap)
                    })
                }
            }
            this.setState({
                message: this.props.origin === 'ProposeSign' ?
                    "You are about to send a message to sign the following Notaries and associated DataCaps:"
                    :
                    "You are about to send a message to cancel the transaction to the following adresses"
            })
        }

        this.setState({ requestToShow })
    }

    renderArray(arrayValues: any[]) {
        return (<>
            {arrayValues.map((value: any, i: any) => <div key={i} className="elemvalue">{value}</div >)}
        </>)
    }


    render() {
        return (
            <div className="warnmodalledger" style={
                { height: 220 + 30 * this.state.requestToShow.length }}>
                <div >
                    {this.state.message}
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
                                <td>{typeof (request.address) === 'object' ? this.renderArray(request.address) : request.address}</td>
                                <td>{typeof (request.datacap) === 'object' ? this.renderArray(request.datacap) : request.datacap}</td>
                            </tr>
                        )}
                    </tbody>
                </table>
                <div className="ledgermessage">Please check your Ledger to sign and send the message.
                    <div> <ButtonPrimary onClick={this.props.onClick}>Accept</ButtonPrimary></div>
                </div>
            </div>
        )
    }
}

export default WarnModalVerify;