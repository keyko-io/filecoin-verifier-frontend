import React, { Component } from 'react';
import { Wallet } from './context/Index'
// @ts-ignore
import { Table, H1, H2, Input, ButtonPrimary } from "slate-react-system";

type States = {
    verifierAccountID: string
    datacap: string
    verifierAccountIDToApprove: string
    datacapToApprove: string
    proposedAccountID: string
    transactionID: number
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
        }
    }

    componentDidMount() {

    }

    handleSubmit = async (e:any) => {
        e.preventDefault()
        const datacap = BigInt(this.state.datacap)
        await this.context.api2.proposeVerifier(this.state.verifierAccountID, datacap, 2);
        this.setState({
            verifierAccountID: '',
            datacap: '1000000000000000000000'
        })
    }

    handleSubmitApprove = async (e:any) => {
        e.preventDefault()
        const datacapToApprove = BigInt(this.state.datacapToApprove)
        await this.context.api2.approveVerifier(this.state.verifierAccountIDToApprove, datacapToApprove, this.state.proposedAccountID, this.state.transactionID, 2);
        this.setState({
            verifierAccountIDToApprove: '',
            datacapToApprove: '1000000000000000000000',
            proposedAccountID: '',
            transactionID: 0
        })
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
                        <ButtonPrimary onClick={this.handleSubmit}>Propose Verifier</ButtonPrimary>
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
                        <ButtonPrimary onClick={this.handleSubmitApprove}>Approve Verifier</ButtonPrimary>
                  </form>
                  </div>

            </div>
   
        )       
        
    }
}
