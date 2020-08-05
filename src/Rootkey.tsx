import React, { Component } from 'react';
import { Wallet } from './context/Index'
import { config } from './config'
// @ts-ignore
import { H1, Input, ButtonPrimary, LoaderSpinner, SelectMenu } from "slate-react-system";

type States = {
    verifierAccountID: string
    datacap: string
    datacapExt: string
    verifierAccountIDToApprove: string
    datacapToApprove: string
    datacapExtToApprove: string
    proposedAccountID: string
    transactionID: number
    approveLoading: boolean
    proposeLoading: boolean
};

export default class Rootkey  extends Component<{},States> {
    public static contextType = Wallet

    constructor(props: {}) {
        super(props);
        this.state = {
            verifierAccountID: '',
            datacap: '1',
            datacapExt: '1000000000000',
            verifierAccountIDToApprove: '',
            datacapToApprove: '1',
            datacapExtToApprove: '1000000000000',
            proposedAccountID: '',
            transactionID: 0,
            approveLoading: false,
            proposeLoading: false
        }
    }

    componentDidMount() {

    }

    handleSubmit = async (e:any) => {
        e.preventDefault()
        this.setState({ proposeLoading: true })
        try {
            const datacap = parseFloat(this.state.datacap)
            const fullDatacap = BigInt(datacap * parseFloat(this.state.datacapExt))
            await this.context.api2.proposeVerifier(this.state.verifierAccountID, fullDatacap, 2);
            this.setState({
                verifierAccountID: '',
                datacap: '1',
                datacapExt: '1000000000000',
                proposeLoading: false
            })
            this.context.dispatchNotification('Proposal submited.')
        } catch (e) {
            this.setState({ proposeLoading: false })
            this.context.dispatchNotification('Proposal failed: ' + e.message)
            console.log(e.stack)
        }
    }

    handleSubmitApprove = async (e:any) => {
        e.preventDefault()
        this.setState({ approveLoading: true })
        try {
            const datacap = parseFloat(this.state.datacapToApprove)
            const fullDatacap = BigInt(datacap * parseFloat(this.state.datacapExtToApprove))
            await this.context.api2.approveVerifier(this.state.verifierAccountIDToApprove, fullDatacap, this.state.proposedAccountID, this.state.transactionID, 2);
            this.setState({
                verifierAccountIDToApprove: '',
                datacapToApprove: '1',
                datacapExtToApprove: '1000000000000',
                proposedAccountID: '',
                transactionID: 0,
                approveLoading: false
            })
            this.context.dispatchNotification('Approval submited!')
        } catch (e) {
            this.setState({ approveLoading: false })
            this.context.dispatchNotification('Approval failed: ' + e.message)
            console.log(e.stack)
        }
    }

    handleChange = (e:any) => {
        console.log(e.target.name, e.target.value)
        this.setState({ [e.target.name]: e.target.value } as any)
    }

    public render(){
        return (
            <div>
                <div>
                  <H1>Propose Verifier</H1>

                  <form>
                        <Input
                            description="Verifier Account ID"
                            name="verifierAccountID"
                            value={this.state.verifierAccountID}
                            placeholder="xxxxxx"
                            onChange={this.handleChange}
                        />
                        <div className="datacapholder">
                            <div className="datacap">
                                <Input
                                    description="Verifier datacap"
                                    name="datacap"
                                    value={this.state.datacap}
                                    placeholder="1"
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
                        <ButtonPrimary onClick={this.handleSubmit}>{this.state.approveLoading ? <LoaderSpinner /> : 'Propose Verifier'}</ButtonPrimary>
                  </form>
                  </div>

                  <div>
                  <H1>Approve Verifier</H1>

                  <form>
                        <Input
                            description="Verifier Account ID"
                            name="verifierAccountIDToApprove"
                            value={this.state.verifierAccountIDToApprove}
                            placeholder="xxxxxx"
                            onChange={this.handleChange}
                        />
                        <div className="datacapholder">
                            <div className="datacap">
                                <Input
                                    description="Verifier datacap"
                                    name="datacapToApprove"
                                    value={this.state.datacapToApprove}
                                    placeholder="1"
                                    onChange={this.handleChange}
                                />
                            </div>
                            <div className="datacapext">
                                <SelectMenu
                                    name="datacapExtToApprove"
                                    value={this.state.datacapExtToApprove}
                                    onChange={this.handleChange}
                                    options={config.datacapExt}
                                />
                            </div>
                        </div>
                         <Input
                            description="Proposed By"
                            name="proposedAccountID"
                            value={this.state.proposedAccountID}
                            placeholder="xxxxxx"
                            onChange={this.handleChange}
                        />
                        <Input
                            description="TransactionID"
                            name="transactionID"
                            value={this.state.transactionID}
                            placeholder="xxxxxx"
                            onChange={this.handleChange}
                        />
                        <ButtonPrimary onClick={this.handleSubmitApprove}>{this.state.approveLoading ? <LoaderSpinner /> : 'Approve Verifier'}</ButtonPrimary>
                  </form>
                  </div>

            </div>
   
        )       
        
    }
}
