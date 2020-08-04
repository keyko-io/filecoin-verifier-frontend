import React, { Component } from 'react';
import { Wallet } from './context/Index'
// @ts-ignore
import { H1, Input, ButtonPrimary, LoaderSpinner } from "slate-react-system";

type States = {
    verifierAccountID: string
    datacap: string
    verifierAccountIDToApprove: string
    datacapToApprove: string
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
            datacap: '1000000000000000000000',
            verifierAccountIDToApprove: '',
            datacapToApprove: '1000000000000000000000',
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
            const datacap = BigInt(this.state.datacap)
            await this.context.api2.proposeVerifier(this.state.verifierAccountID, datacap, 2);
            this.setState({
                verifierAccountID: '',
                datacap: '1000000000000000000000',
                proposeLoading: false
            })
            this.context.dispatchNotification('Proposal submited.')
        } catch (e) {
            this.setState({ proposeLoading: false })
            this.context.dispatchNotification('Proposal failed. Try again later.')
        }
    }

    handleSubmitApprove = async (e:any) => {
        e.preventDefault()
        this.setState({ approveLoading: true })
        try {
            const datacapToApprove = BigInt(this.state.datacapToApprove)
            await this.context.api2.approveVerifier(this.state.verifierAccountIDToApprove, datacapToApprove, this.state.proposedAccountID, this.state.transactionID, 2);
            this.setState({
                verifierAccountIDToApprove: '',
                datacapToApprove: '1000000000000000000000',
                proposedAccountID: '',
                transactionID: 0,
                approveLoading: false
            })
            this.context.dispatchNotification('Approval submited!')
        } catch (e) {
            this.setState({ approveLoading: false })
            this.context.dispatchNotification('Approval failed. Try again later.')
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
                        <Input
                            description="Verifier Datacap"
                            name="datacap"
                            value={this.state.datacap}
                            placeholder="1000000000000000000000"
                            onChange={this.handleChange}
                        />
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
                        <Input
                            description="Verifier Datacap"
                            name="datacapToApprove"
                            value={this.state.datacapToApprove}
                            placeholder="1000000000000000000000"
                            onChange={this.handleChange}
                        />
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
