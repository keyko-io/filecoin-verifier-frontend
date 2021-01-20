import React, { Component } from 'react';
import { Data } from '../context/Data/Index';
import { datacapFilter } from "../utils/Filters"
// @ts-ignore
import RootKeyHolder from './overview/RootKeyHolder';
import Notary from './overview/Notary';

type OverviewStates = {
    tabs: string
    pendingverifiers: any[]
    clientsamount: string
    clients: any[]
}

export default class Overview extends Component<{}, OverviewStates> {
    public static contextType = Data
    interval: any

    state = {
        tabs: '1',
        pendingverifiers: [] as any[],
        clientsamount: '',
        clients: [] as any[],
    }

    componentDidMount() {
        this.loadData()
        this.interval = setInterval(() => { this.loadData() }, 15000);
    }

    componentWillUnmount() {
        clearInterval(this.interval)
    }

    loadData = async () => {
        if (this.context.github.githubLogged) {
            this.context.loadClientsGithub()
            this.context.loadClientRequests()
        }
        this.context.loadVerified()
        const clients = await this.context.wallet.api.listVerifiedClients()
    
        // pending verifiers 
        let pendingTxs = await this.context.wallet.api.pendingRootTransactions()
        let pendingverifiers: any[] = []
        for (let txs in pendingTxs) {
            if(pendingTxs[txs].parsed.name !== 'addVerifier'){
                continue;
            }
            const verifierAccount = await this.context.wallet.api.actorKey(pendingTxs[txs].parsed.params.verifier)
            pendingverifiers.push({
                id: pendingTxs[txs].id,
                type: pendingTxs[txs].parsed.params.cap.toString() === '0' ? 'Revoke' : 'Add',
                verifier: pendingTxs[txs].parsed.params.verifier,
                verifierAccount,
                datacap: pendingTxs[txs].parsed.params.cap.toString(),
                signer: pendingTxs[txs].signers[0]
            })
        }
        let clientsamount = 0
        for (const txs of clients) {
            clientsamount = clientsamount + Number(txs.datacap)
            txs['key'] = await this.context.wallet.api.actorKey(txs.verified)
        }
        this.setState({
            clients,
            pendingverifiers,
            clientsamount: clientsamount.toString()
        })
    }

    public render() {
        return (
            <div className="page">
                <div className="info">
                    <div className="textinfo">
                        <div className="textinfotext">
                            <h2>Welcome to the Filecoin Plus App</h2>
                        </div>
                        <div className="textinfodata">
                            <div className="textinfodatablock">
                                <div className="data">{datacapFilter(this.state.clientsamount)}</div>
                                <div className="text">Datacap Granted</div>
                            </div>
                            <div className="textinfodatablock">
                                <div className="data">{this.state.pendingverifiers.length}</div>
                                <div className="text">Pending Notaries</div>
                            </div>
                            <div className="textinfodatablock">
                                <div className="data">{this.context.verified.length}</div>
                                <div className="text">Approved Notaries</div>
                            </div>
                        </div>
                    </div>
                </div>
                {this.context.viewroot ?
                    <RootKeyHolder
                        pendingverifiers={this.state.pendingverifiers}
                    />
                    :
                    <Notary
                        clients={this.state.clients}
                    />
                }
            </div>
        )
    }
}
