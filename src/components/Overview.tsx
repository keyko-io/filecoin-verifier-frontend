import React, { Component } from 'react';
import { Data } from '../context/Data/Index';
import { datacapFilter } from "../utils/Filters"
// @ts-ignore
import RootKeyHolder from './overview/RootKeyHolder';
import Notary from './overview/Notary';

type OverviewStates = {
    tabs: string
}

export default class Overview extends Component<{}, OverviewStates> {
    public static contextType = Data
    interval: any

    state = {
        tabs: '1'
    }

    componentDidMount() {
        this.loadData()
        this.interval = setInterval(() => { this.loadData() }, 5 * 60 * 1000);
    }

    componentWillUnmount() {
        clearInterval(this.interval)
    }

    loadData = async () => {
        this.context.refreshGithubData()
        this.context.loadVerified()
        this.context.loadClients()
        this.context.loadVerifierAndPendingRequests()
    }

    public render() {
        return (
            <div className="page">
                <div className="info">
                    <div className="textinfo">
                        <div className="textinfotext">
                            <h2>Welcome to the Filecoin Plus App</h2>
                            <div className="description">Filecoin Plus is a layer of social trust on top of the Filecoin Network to help incentivize the storage of real data.</div>
                        </div>
                        <div className="textinfodata">
                            <div className="textinfodatablock">
                                <div className="data">{datacapFilter(this.context.clientsAmountConverted)}</div>
                                <div className="text">Datacap Granted</div>
                            </div>
                            <div className="textinfodatablock">
                                <div className="data">{this.context.verifierAndPendingRequests.length}</div>
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
                    <RootKeyHolder/>
                    :
                    <Notary
                        clients={this.context.clients}
                    />
                }
            </div>
        )
    }
}
