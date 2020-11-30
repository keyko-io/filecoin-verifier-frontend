import React, { Component } from 'react';
import { Data } from '../context/Data/Index'
import { config } from '../config'
// @ts-ignore
import { H1, Input, ButtonPrimary, ButtonSecondary, LoaderSpinner, SelectMenu } from "slate-react-system";

type States = {
    verifierAccountID: string
    datacap: string
    datacapExt: string
    verifierAccountIDToApprove: string
    revokedVerifierAccountID: string
    datacapToApprove: string
    datacapExtToApprove: string
    proposedAccountID: string
    transactionID: number
    approveLoading: boolean
    proposeLoading: boolean
    transactions: any[]
    selectedTransactions: any[]
};

export default class Rootkey  extends Component<{},States> {
    public static contextType = Data

    constructor(props: {}) {
        super(props);
        this.state = {
            verifierAccountID: '',
            revokedVerifierAccountID: '',
            datacap: '1',
            datacapExt: '1000000000000',
            verifierAccountIDToApprove: '',
            datacapToApprove: '1',
            datacapExtToApprove: '1000000000000',
            proposedAccountID: '',
            transactionID: 0,
            approveLoading: false,
            proposeLoading: false,
            transactions: [],
            selectedTransactions: []
        }
    }

    componentDidMount() {
        this.getList()
    }

    getList = async () => {
        let pendingTxs = await this.context.wallet.api.pendingRootTransactions()
        let transactions: any[] = []
        for(let txs in pendingTxs){
            if (!pendingTxs[txs].parsed || pendingTxs[txs].parsed.name !== 'addVerifier') {
                continue
            }
            transactions.push({
                id: pendingTxs[txs].id,
                type: pendingTxs[txs].parsed.params.cap.toString() === '0' ? 'Revoke' : 'Add',
                verifier: pendingTxs[txs].parsed.params.verifier,
                cap: pendingTxs[txs].parsed.params.cap.toString(),
                signer: pendingTxs[txs].signers[0]
            })
        }
        this.setState({transactions})
    }

    handleSubmit = async (e:any) => {
        e.preventDefault()
        this.setState({ proposeLoading: true })
        try {
            const datacap = parseFloat(this.state.datacap)
            const fullDatacap = BigInt(datacap * parseFloat(this.state.datacapExt))
            let messageID = await this.context.wallet.api.proposeVerifier(this.state.verifierAccountID, fullDatacap, this.context.wallet.walletIndex);
            this.setState({
                verifierAccountID: '',
                datacap: '1',
                datacapExt: '1000000000000',
                proposeLoading: false
            })
            this.context.dispatchNotification('Propose Message sent with ID: ' + messageID)
        } catch (e) {
            this.setState({ proposeLoading: false })
            this.context.dispatchNotification('Proposal failed: ' + e.message)
            console.log(e.stack)
        }
    }

    handleSubmitRevoke = async (e:any) => {
        e.preventDefault()
        this.setState({ proposeLoading: true })
        try {
            const fullDatacap = BigInt(0)
            let messageID = await this.context.wallet.api.proposeVerifier(this.state.revokedVerifierAccountID, fullDatacap, this.context.wallet.walletIndex);
            this.setState({
                revokedVerifierAccountID: '',
                proposeLoading: false
            })
            this.context.dispatchNotification('Revoke Message sent with ID: ' + messageID)
        } catch (e) {
            this.setState({ proposeLoading: false })
            this.context.dispatchNotification('Revoke Proposal failed: ' + e.message)
            console.log(e.stack)
        }
    }

    handleSubmitApprove = async (e:any) => {
        e.preventDefault()
        this.setState({ approveLoading: true })
        try {
            for(const tx of this.state.transactions){
                if(this.state.selectedTransactions.includes(tx.id)){
                    const datacap = BigInt(tx.cap)
                    await this.context.wallet.api.approveVerifier(tx.verifier, datacap, tx.signer, tx.id, this.context.wallet.walletIndex);
                }
            }
            this.setState({ selectedTransactions:[], approveLoading: false })
            this.context.dispatchNotification('Transactions confirmed')
        } catch (e) {
            this.setState({ approveLoading: false })
            this.context.dispatchNotification('Approval failed: ' + e.message)
            console.log('error', e.stack)
        }
    }

    handleChange = (e:any) => {
        this.setState({ [e.target.name]: e.target.value } as any)
    }

    selectRow = (transactionId: string) => {
        let selectedTxs = this.state.selectedTransactions
        if(selectedTxs.includes(transactionId)){
            selectedTxs = selectedTxs.filter(item => item !== transactionId)
        } else {
            selectedTxs.push(transactionId)
        }
        this.setState({selectedTransactions:selectedTxs})
    }

    public render(){
        return (
            <div>
                <div>
                  <H1>Propose New Verifier</H1>

                  <form>
                        <Input
                            description="Notary Account ID"
                            name="verifierAccountID"
                            value={this.state.verifierAccountID}
                            placeholder="xxxxxx"
                            onChange={this.handleChange}
                        />
                        <div className="datacapholder">
                            <div className="datacap">
                                <Input
                                    description="Notary datacap"
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
                        <ButtonPrimary onClick={this.handleSubmit}>{this.state.approveLoading ? <LoaderSpinner /> : 'Propose Notary'}</ButtonPrimary>
                  </form>
                </div>


                <div>
                  <H1>Propose Revoke Verifier</H1>
                  <form>
                        <Input
                            description="Notary Account ID"
                            name="revokedVerifierAccountID"
                            value={this.state.revokedVerifierAccountID}
                            placeholder="xxxxxx"
                            onChange={this.handleChange}
                        />
                        <ButtonPrimary onClick={this.handleSubmitRevoke}>{this.state.approveLoading ? <LoaderSpinner /> : 'Propose Revoke Notary'}</ButtonPrimary>
                  </form>
                </div>

                <div className="pendingApprove">
                    <H1>Proposals Pending to Approve</H1>
                    <table>
                        <thead>
                            <tr>
                                <td>Transaction ID</td>
                                <td>Method</td>
                                <td>Verifier ID</td>
                                <td>Datacap</td>
                                <td>Proposed By</td>
                            </tr>
                        </thead>
                        <tbody>
                            {this.state.transactions.map((transaction:any, index:any) => 
                                <tr
                                    key={transaction.id}
                                    onClick={()=>this.selectRow(transaction.id)}
                                    className={this.state.selectedTransactions.includes(transaction.id)?'selected':''}
                                >
                                    <td>{transaction.id}</td>
                                    <td>{transaction.type}</td>
                                    <td>{transaction.verifier}</td>
                                    <td>{transaction.cap}</td>
                                    <td>{transaction.signer}</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                    <ButtonSecondary onClick={()=>this.getList()}>Refresh</ButtonSecondary>
                    <ButtonPrimary onClick={this.handleSubmitApprove}>{this.state.approveLoading ? <LoaderSpinner /> : 'Approve'}</ButtonPrimary>
                </div>
            </div>
        )
    }
}
