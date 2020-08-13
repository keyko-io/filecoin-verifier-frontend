import React, { Component } from 'react';
import { Wallet } from './context/Index'
import { config } from './config'
// @ts-ignore
import { H1, Input, ButtonPrimary, ButtonSecondary, LoaderSpinner, SelectMenu, Table } from "slate-react-system";

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
    public static contextType = Wallet

    columns = [
        { key: "a", name: "Transaction ID" },
        { key: "b", name: "Method"},
        { key: "c", name: "Verifier ID" },
        { key: "d", name: "Datacap" },
        { key: "e", name: "Proposed By" }
    ]

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

        let pendingTxs = await this.context.api.pendingRootTransactions()

        let pendingTransactions: any[] = []
        for(let txs in pendingTxs){
            pendingTransactions.push([
                txs,
                pendingTxs.parsed.params.cap === 0 ? 'Revoke' : 'Add',
                pendingTxs[txs].parsed.params.verifier,
                pendingTxs.parsed.params.cap,
                pendingTxs[txs].signers
            ])
        }

        // Method "Revoke" if datacap==0
        /*
        let pendingTransactions = [
            ['1', 'Add', 't01007', '25000000000000', 't01001'],
            ['5', 'Add', 't01009', '4670000000000000', 't01001'], 
            ['9', 'Revoke','t01012', '0', 't01001']
        ]
        */
       // let pendingTransactions = await this.context.api.getPendingTransactions('t01002')
       
        let t:any = []
        for (let [id, method, ver, cap, by] of pendingTransactions) {
            t.push({a:id, b:method, c:ver, d:cap, e:by})
        }
        
        this.setState({transactions:t})
    }

    handleSubmit = async (e:any) => {
        e.preventDefault()
        this.setState({ proposeLoading: true })
        try {
            const datacap = parseFloat(this.state.datacap)
            const fullDatacap = BigInt(datacap * parseFloat(this.state.datacapExt))
            let messageID = await this.context.api.proposeVerifier(this.state.verifierAccountID, fullDatacap, this.context.walletIndex);
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
            let messageID = await this.context.api.proposeVerifier(this.state.revokedVerifierAccountID, fullDatacap, this.context.walletIndex);
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
                if(this.state.selectedTransactions.includes(tx.a)){
                    const datacap = BigInt(tx.d)
                    await this.context.api.approveVerifier(tx.c, datacap, tx.e, tx.a, this.context.walletIndex);
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
        console.log(e.target.name, e.target.value)
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
                  <H1>Propose Revoke Verifier</H1>
                  <form>
                        <Input
                            description="Verifier Account ID"
                            name="revokedVerifierAccountID"
                            value={this.state.revokedVerifierAccountID}
                            placeholder="xxxxxx"
                            onChange={this.handleChange}
                        />
                        <ButtonPrimary onClick={this.handleSubmitRevoke}>{this.state.approveLoading ? <LoaderSpinner /> : 'Propose Revoke Verifier'}</ButtonPrimary>
                  </form>
                </div>

                <div className="pendingApprove">
                    <H1>Proposals Pending to Approve</H1>
                    <table>
                        <thead>
                            <tr>
                                {this.columns.map((fieldKey:any, index:any) => 
                                    <td key={fieldKey.name}>{fieldKey.name}</td>
                                )}
                            </tr>
                        </thead>
                        <tbody>
                            {this.state.transactions.map((transaction:any, index:any) => 
                                <tr
                                    key={transaction.a}
                                    onClick={()=>this.selectRow(transaction.a)}
                                    className={this.state.selectedTransactions.includes(transaction.a)?'selected':''}
                                >
                                    {Object.keys(transaction).map((fieldKey:any, index:any) => 
                                        <td key={transaction[fieldKey]}>{transaction[fieldKey]}</td>
                                    )}
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
