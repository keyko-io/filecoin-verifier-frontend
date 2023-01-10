import React, { Component, memo } from 'react';
import { Data } from '../../context/Data/Index';
import { bytesToiB } from "../../utils/Filters"
// @ts-ignore
import RootKeyHolder from './RootKeyHolder';
import Notary from './Notary';
import { BeatLoader } from "react-spinners";
import "./Overview.scss"

type OverviewStates = {
    tabs: string
    dcGrantedLoading: boolean
    pendingNotariesLoading: boolean,
    approvedNotariesLoading: boolean
}

class Overview extends Component<{}, OverviewStates> {
    public static contextType = Data
    interval: any

    state = {
        tabs: '1',
        dcGrantedLoading: true,
        pendingNotariesLoading: true,
        approvedNotariesLoading: true
    }

    componentDidMount() {
        this.context.github.checkToken()
        this.loadData()
    }

    componentWillUnmount() {
        clearInterval(this.interval)
    }


    loadData = async () => {
        await this.context.refreshGithubData()
        await this.context.loadClients()
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
                                <div className="data">{
                                    !this.context.clientsAmount ?
                                        <div>
                                            <span className="zeroOpaque">0B</span>
                                            <BeatLoader size={15} color={"rgb(24,160,237)"} />
                                        </div>
                                        :
                                        bytesToiB(this.context.clientsAmount)}</div>
                                <div className="text">Datacap Granted</div>
                            </div>
                            <div className="textinfodatablock">
                                <div className="data">{
                                    this.context.isPendingRequestLoading ?
                                        <div>
                                            <span className="zeroOpaque">0</span>
                                            <BeatLoader size={15} color={"rgb(24,160,237)"} />
                                        </div>
                                        :
                                        this.context.verifierAndPendingRequests.length}</div>
                                <div className="text">Pending Notaries</div>
                            </div>
                            <div className="textinfodatablock">
                                <div className="data">{
                                    this.context.approvedNotariesLoading ?
                                        <div>
                                            <span className="zeroOpaque">0</span>
                                            <BeatLoader size={15} color={"rgb(24,160,237)"} />
                                        </div>
                                        :
                                        this.context.verified.length}</div>
                                <div className="text">Approved Notaries</div>
                            </div>
                        </div>
                    </div>
                </div>
                {this.context.viewroot ?
                    <RootKeyHolder searchString={this.context.searchString} />
                    :
                    <Notary
                        notaryProps={{
                            clients: this.context.clients,
                            searchString: this.context.searchString
                        }}
                    />
                }
            </div>
        )
    }
}

export default memo(Overview)
