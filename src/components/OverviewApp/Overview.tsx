import { Component, memo } from 'react';
import { Data } from '../../context/Data/Index';
import { bytesToiB } from "../../utils/Filters"
// @ts-ignore
import RootKeyHolder from './RootKeyHolder';
import Notary from './Notary';
import { BeatLoader } from "react-spinners";
import "./Overview.scss"

class Overview extends Component<{}> {
    public static contextType = Data

    state = {
        approvedNotariesLoading: false,
        approvedNotariesLength: null
    }

    async componentDidMount() {
        this.context.github.checkToken()

        this.context.loadClients()

        this.setState({ approvedNotariesLoading: true })
        const approvedNotariesLength = (await this.context.wallet.api.listVerifiers()).length
        this.setState({ approvedNotariesLoading: false, approvedNotariesLength })
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
                                    this.state.approvedNotariesLoading ?
                                        <div>
                                            <span className="zeroOpaque">0</span>
                                            <BeatLoader size={15} color={"rgb(24,160,237)"} />
                                        </div>
                                        : this.state.approvedNotariesLength

                                }</div>
                                <div className="text">Approved Notaries</div>
                            </div>
                        </div>
                    </div>
                </div>
                {this.context.viewroot ?
                    <RootKeyHolder />
                    :
                    <Notary
                        notaryProps={{
                            clients: this.context.clients,
                        }}
                    />
                }
            </div>
        )
    }
}

export default memo(Overview)
