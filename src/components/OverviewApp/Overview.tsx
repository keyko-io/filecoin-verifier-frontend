import { useContext, useEffect, useState } from 'react';
import { Data } from '../../context/Data/Index';
import { bytesToiB } from "../../utils/Filters"
// @ts-ignore
import RootKeyHolder from './RootKeyHolder';
import Notary from './Notary';
import { BeatLoader } from "react-spinners";
import "./Overview.scss"
import { ApprovedVerifiers } from '../../type';

const Overview = () => {
    const context = useContext(Data)

    const [approvedNotariesLoading, setApprovedNotariesLoading] = useState(false)
    const [approvedNotariesLength, setApprovedNotariesLength] = useState<number | null>(null)

    useEffect(() => {
        context.loadClients()

        setApprovedNotariesLoading(true)

        context.wallet.api.listVerifiers().then((data: ApprovedVerifiers[]) => {
            setApprovedNotariesLength(data.length)
            setApprovedNotariesLoading(false)
        })
    }, [])

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
                                !context.clientsAmount ?
                                    <div>
                                        <span className="zeroOpaque">0B</span>
                                        <BeatLoader size={15} color={"rgb(24,160,237)"} />
                                    </div>
                                    :
                                    bytesToiB(Number(context.clientsAmount))}</div>
                            <div className="text">Datacap Granted</div>
                        </div>
                        <div className="textinfodatablock">
                            <div className="data">{
                                context.isPendingRequestLoading ?
                                    <div>
                                        <span className="zeroOpaque">0</span>
                                        <BeatLoader size={15} color={"rgb(24,160,237)"} />
                                    </div>
                                    :
                                    context.verifierAndPendingRequests.length}</div>
                            <div className="text">Pending Notaries</div>
                        </div>
                        <div className="textinfodatablock">
                            <div className="data">{
                                approvedNotariesLoading ?
                                    <div>
                                        <span className="zeroOpaque">0</span>
                                        <BeatLoader size={15} color={"rgb(24,160,237)"} />
                                    </div>
                                    : approvedNotariesLength

                            }</div>
                            <div className="text">Approved Notaries</div>
                        </div>
                    </div>
                </div>
            </div>
            {context.viewroot ?
                <RootKeyHolder />
                :
                <Notary
                    notaryProps={{
                        clients: context.clients,
                    }}
                />
            }
        </div>
    )
}

export default Overview
