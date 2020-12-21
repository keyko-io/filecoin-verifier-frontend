import React, { Component } from 'react';
// @ts-ignore
import { dispatchCustomEvent } from "slate-react-system";
import MinersInfoModal from '../modals/MinersInfoModal';
import { config } from '../config'
import { Data } from '../context/Data/Index'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import parse from 'html-react-parser';



export default class TableVerifiers extends Component {
    public static contextType = Data

    columns = [
        { key: "name", name: "Notary Name", type: "FILE_LINK", width: "98px" },
        { key: "use_case", name: "Use Case" },
        { key: "location", name: "Location" },
        { key: "website", name: "website" },
        { key: "max_datacap_allocation", name: "Max Datacap Allocation" },
        { key: "private_request", name: "Available for Private Request" }
    ]

    state = {
        selectedVerifier: 0,
        checks: [],
        miners: '',
    }

    componentDidMount() {
        this.loadData()
        this.context.loadMiners()
    }

    loadData = async () => {
        this.getList()
        let initialChecks = [] as any[]
        this.setState({ checks: initialChecks })
    }

    getList = async () => {
        const miners = await this.context.loadMiners()
        console.log(miners.data)
        this.setState({ miners: miners.data })
    }

    updateChecks = (e: any) => {
        let checks = [] as any[]
        this.state.checks.forEach((_, i) => {
            checks.push(Number(e.target.name) === i ?
                e.target.value :
                false)
        })
        this.setState({ checks: checks })
        this.setState({ selectedVerifier: Number(e.target.name) })
    }

    showMinerInfo = (e: any) => {
        const miner: any = this.context.miners[Number(e.currentTarget.id)]
        console.log(miner)
        dispatchCustomEvent({
            name: "create-modal", detail: {
                id: Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 5),
                modal: <MinersInfoModal message={miner.body} />
            }
        })
    }


    public render() {
        return (
            <div className="verifiers">
                <div className="tableverifiers">
                    {this.state.miners !== '' ?
                        <div>
                            {parse(this.state.miners)}
                        </div>
                        : <div className="nodata">There are not available notaries yet</div>}
                </div>
            </div>
        )
    }
}