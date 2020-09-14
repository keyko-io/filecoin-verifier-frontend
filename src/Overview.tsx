import React, { Component } from 'react';
import { Wallet } from './context/Index';
import AddClientModal from './AddClientModal';
import AddVerifierModal from './AddVerifierModal';
// @ts-ignore
import { ButtonPrimary, dispatchCustomEvent } from "slate-react-system";

type OverviewStates = {
    tabs: string
    verifiers: any[]
    pendingverifiers: any[]
    clients: any[]
    approveLoading: boolean
    selectedTransactions: any[]
}

export default class Overview extends Component<{}, OverviewStates> {
    public static contextType = Wallet

    state = {
        selectedTransactions: [] as any[],
        approveLoading: false,
        tabs: '1',
        verifiers: [] as any[],
        pendingverifiers: [] as any[],
        clients: [] as any[],
    }

    componentDidMount() {
        this.loadData()
    }

    showPending = async () => {
        this.setState({tabs: "1"})
    }

    showApproved = async () => {
        this.setState({tabs: "2"})
    }

    addVerifiedClient = async () => {
        dispatchCustomEvent({ name: "create-modal", detail: {
            id: Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 5),
            modal: <AddClientModal/>
        }})
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

    proposeVerifier = async () => {
        dispatchCustomEvent({ name: "create-modal", detail: {
            id: Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 5),
            modal: <AddVerifierModal/>
        }})
    }

    handleSubmitApprove = async () => {
        this.setState({ approveLoading: true })
        try {
            for(let tx of this.state.pendingverifiers){
                if(this.state.selectedTransactions.includes(tx.id)){
                    const datacap = BigInt(tx.datacap)
                    await this.context.api.approveVerifier(tx.verifier, datacap, tx.signer, tx.id, this.context.walletIndex);
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

    loadData = async () => {
        const verifiers = await this.context.api.listVerifiers()
        const clients = await this.context.api.listVerifiedClients()
        // pending verififers
        let pendingTxs = await this.context.api.pendingRootTransactions()
        let pendingverifiers: any[] = []
        for(let txs in pendingTxs){
            pendingverifiers.push({
                id: txs,
                type: pendingTxs[txs].parsed.params.cap.toString() === '0' ? 'Revoke' : 'Add',
                verifier: pendingTxs[txs].parsed.params.verifier,
                datacap: pendingTxs[txs].parsed.params.cap.toString(),
                signer: pendingTxs[txs].signers[0]
            })
        }
        console.log(clients, verifiers, pendingverifiers)
        this.setState({
            clients,
            verifiers,
            pendingverifiers
        })
    }

    public render(){
        return (
            <div className="page">
                <div className="imageholder"></div>
                <div className="info">
                    <div className="textinfo">
                        <div className="textinfotext">
                            <h2>What is Filecoin Pro Registry?</h2>
                            Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.
                        </div>
                        <div className="textinfodata">
                            <div className="textinfodatablock">
                                <div className="data">60 PiB</div>
                                <div className="text">Datacap Granted</div>
                            </div>
                            <div className="textinfodatablock">
                                <div className="data">75k</div>
                                <div className="text">Community Members</div>
                            </div>
                            <div className="textinfodatablock">
                                <div className="data">24</div>
                                <div className="text">Pending verifiers</div>
                            </div>
                            <div className="textinfodatablock">
                                <div className="data">50</div>
                                <div className="text">Verified Verifiers</div>
                            </div>
                        </div>
                    </div>
                </div>
                {this.context.viewroot ?
                    <div className="main">
                        <div className="tabsholder">
                            <div className="tabs">
                                <div className={this.state.tabs === "1" ? "selected" : ""} onClick={()=>{this.showPending()}}>Pending verifiers ({this.state.pendingverifiers.length})</div>
                                <div className={this.state.tabs === "2" ? "selected" : ""} onClick={()=>{this.showApproved()}}>Approved Verifiers ({this.state.verifiers.length})</div>
                            </div>
                            <div className="tabssadd">
                                {this.state.tabs === "2" ? <ButtonPrimary onClick={()=>this.proposeVerifier()}>Propose verifier</ButtonPrimary> : null}
                                {this.state.tabs === "1" ? <ButtonPrimary onClick={()=>this.handleSubmitApprove()}>Accept selected</ButtonPrimary> : null}
                            </div>
                        </div>
                        { this.state.tabs === "2" ?
                            <div>

                                <table>
                                    <thead>
                                        <tr>
                                            <td>Verifier</td>
                                            <td>Datacap</td>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {this.state.verifiers.map((transaction:any, index:any) => 
                                            <tr key={index}>
                                                <td>{transaction.verifier}</td>
                                                <td>{transaction.datacap}</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                                {this.state.verifiers.length === 0 ? <div className="nodata">No verifiers yet</div> : null}
                            </div>:null
                        }
                        { this.state.tabs === "1" ?
                            <div>
                                
                                <table>
                                    <thead>
                                        <tr>
                                            <td>Type</td>
                                            <td>Verifier</td>
                                            <td>Datacap</td>
                                            <td>Proposed By</td>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {this.state.pendingverifiers.map((transaction:any, index:any) => 
                                            <tr
                                                key={index}
                                                onClick={()=>this.selectRow(transaction.id)}
                                                className={this.state.selectedTransactions.includes(transaction.id)?'selected':''}
                                            >
                                                <td>{transaction.type}</td>
                                                <td>{transaction.verifier}</td>
                                                <td>{transaction.datacap}</td>
                                                <td>{transaction.signer}</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                                {this.state.pendingverifiers.length === 0 ? <div className="nodata">No pending verifiers yet</div> : null}
                            </div>:null
                        }
                    </div>
                :
                    <div className="main">
                        <div className="tabsholder">
                            <div className="tabs">
                                <div className="selected">Verified clients ({this.state.clients.length})</div>
                            </div>
                            <div className="tabssadd">
                                <ButtonPrimary onClick={()=>this.addVerifiedClient()}>Add verified client</ButtonPrimary>
                            </div>
                        </div>
                            <div>
                                <table>
                                    <thead>
                                        <tr>
                                            <td>Client</td>
                                            <td>Datacap</td>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {this.state.clients.map((transaction:any, index:any) => 
                                            <tr
                                                key={index}
                                                // onClick={()=>this.selectRow(transaction.id)}
                                                /*className={this.state.selectedTransactions.includes(transaction.id)?'selected':''}*/
                                            >
                                                <td>{transaction.verified}</td>
                                                <td>{transaction.datacap}</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                                {this.state.verifiers.length === 0 ? <div className="nodata">No verified clients yet</div> : null}
                            </div>
                    </div>
                }
            </div>
        )
    }
}
