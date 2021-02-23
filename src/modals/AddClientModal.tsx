import React, { Component } from 'react';
import { Data } from '../context/Data/Index'
import { config } from '../config'
import { anyToBytes } from "../utils/Filters"
// @ts-ignore
import { dispatchCustomEvent, H4, Input, ButtonPrimary, SelectMenu, LoaderSpinner } from "slate-react-system";

type States = {
    address: string
    datacap: string
    datacapExt: string
    submitLoading: boolean
    issueNumber: string,
    units: string
};

type ModalProps = {
    newDatacap?: boolean,
    clientRequest?: any[],
    requestNumber?: any
    selected?: any[]
}

class AddClientModal extends Component<ModalProps, States> {
    public static contextType = Data

    constructor(props: {}) {
        super(props);
        this.state = {
            address: '',
            datacap: '1',
            datacapExt: '1099511627776', // 1 TiB
            submitLoading: false,
            issueNumber: '',
            units: 'TiB'
        }
    }

    componentDidMount() {
        if (this.props.clientRequest && this.props.selected) {
            const requestSelected = this.props.selected || ''
            const request = this.props.clientRequest.find(element => element.number == requestSelected);
            this.setState({
                issueNumber: request.number,
                address: request.data.address
            })

        }
    }

    handleSubmit = async (e: any) => {
        e.preventDefault()
        this.setState({ submitLoading: true })

        try {
            const dataCapIssue = this.state.datacap + this.state.units
            const fullDatacap = anyToBytes(dataCapIssue)

            console.log("datacap: " + this.state.datacap)
            console.log("fullDatacap: " + fullDatacap)

            let messageID
            if(this.context.wallet.multisig){
                messageID =await this.context.wallet.api.multisigVerifyClient(this.context.wallet.multisigAddress, this.state.address, BigInt(fullDatacap), this.context.wallet.walletIndex)
            } else {
                messageID = await this.context.wallet.api.verifyClient(this.state.address, BigInt(fullDatacap), this.context.wallet.walletIndex)
            }
           
            if (this.props.newDatacap) {
                this.context.updateGithubVerified(this.state.issueNumber, messageID, this.state.address, dataCapIssue)
            }

            this.setState({
                address: '',
                datacap: '1',
                datacapExt: '1099511627776', // 1 TiB
                submitLoading: false
            })
            this.context.wallet.dispatchNotification('Verify Client Message sent with ID: ' + messageID)
            dispatchCustomEvent({ name: "delete-modal", detail: {} })
            this.setState({ submitLoading: false })
        } catch (e) {
            this.setState({ submitLoading: false })
            this.context.wallet.dispatchNotification('Client verification failed: ' + e.message)
            console.log(e.stack)
            dispatchCustomEvent({ name: "delete-modal", detail: {} })

        }
    }


    findUnits = (value: string) => {
        const element = config.datacapExt.find(ele => ele.value === value)
        return element?.name
    }

    handleChange = (e: any) => {
        this.setState({ [e.target.name]: e.target.value } as any)
        if (e.target.name === "datacapExt") {
            this.setState({ units: this.findUnits(e.target.value) || "" })
        }
    }



    render() {
        return (
            <div className="addmodal">
                <form>
                    {this.props.newDatacap ? <H4>Set new Datacap</H4> : <H4>Approve Private Request</H4>}
                    <div>
                        <div>
                            <div className="inputholder">
                                <Input
                                    description="Address"
                                    name="address"
                                    value={this.state.address}
                                    placeholder="XXXXXXXXXXX"
                                    onChange={this.handleChange}
                                    readOnly={this.props.clientRequest ? true : false}
                                />
                            </div>
                            <div className="datacapholder">
                                <div className="datacap">
                                    <Input
                                        description="Datacap Request"
                                        name="datacap"
                                        value={this.state.datacap}
                                        placeholder="1099511627776"
                                        onChange={this.handleChange}
                                    />
                                </div>
                                <div className="datacapext">
                                    <SelectMenu
                                        name="datacapExt"
                                        value={this.state.datacapExt}
                                        onChange={this.handleChange}
                                        options={config.datacapExt}
                                    />
                                </div>
                            </div>
                        </div>

                    </div>
                    <div className="ledgermessage">You are about to send a message to assign DataCap to this address.
                        <p>Please check your Ledger to sign and send the message.</p>
                    </div>
                    <div className="centerbutton buttonverify">
                        <ButtonPrimary onClick={this.handleSubmit}>{this.state.submitLoading ? <LoaderSpinner /> : 'Send Request'}</ButtonPrimary>
                    </div>
                </form>
            </div>
        )
    }
}

export default AddClientModal;