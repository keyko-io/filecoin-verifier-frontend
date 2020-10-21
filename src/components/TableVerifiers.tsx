import React, { Component } from 'react';
// @ts-ignore
import { Table, CheckBox, dispatchCustomEvent } from "slate-react-system";
import MakeRequestModal from '../MakeRequestModal';
import { config } from '../config'

import jsonVerifiers from '../data/verifiers.json';
import jsonvVerifiersProd from '../data/verifiers-prod.json';

export default class TableVerifiers extends Component {

    columns = [
        { key: "name", name: "Notary Name", type: "FILE_LINK", width: "98px" },
        { key: "use_case", name: "Use Case" },
        { key: "location", name: "Location" },
        { key: "website", name: "website" },
        { key: "max_datacap_allocation", name: "Max Datacap Allocation" },
        { key: "private_request", name: "Available for Private Request" }
    ]

    state = {
        verifiers: [],
        selectedVerifier: 0,
        checks: []
    }

    componentDidMount() {
        this.loadData()
    }

    loadData = async () => {
        await this.getList()
        let initialChecks = [] as any[]
        this.state.verifiers.forEach((_) => {
            initialChecks.push(false)
        })
        this.setState({ checks: initialChecks })
    }

    getList = async () => {

        let verifiers
        if (config.verifiers === 'DEV') {
            verifiers = jsonVerifiers.notaries
        } else {
            verifiers = jsonvVerifiersProd.notaries
        }
        this.setState({ verifiers })
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

    contactVerifier = async () => {
        let verifier: any = this.state.verifiers[this.state.selectedVerifier]
        dispatchCustomEvent({
            name: "create-modal", detail: {
                id: Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 5),
                modal: <MakeRequestModal verifier={verifier} />
            }
        })
    }

    public render() {
        return (
            <div className="verifiers">
                <div className="tableverifiers">
                    {this.state.verifiers.length > 0 ?
                        <table>
                            <thead>
                                <tr>
                                    <td></td>
                                    <td>Notary Name</td>
                                    <td>Use case</td>
                                    <td>Location</td>
                                    <td>Website</td>
                                    <td>Max Datacap Allocation</td>
                                    <td>Private Requests</td>
                                </tr>
                            </thead>
                            <tbody>
                                {
                                    this.state.verifiers.map((verifier: any, i) =>
                                        <tr>
                                            <td>
                                                <input type="checkbox" key={i} name={String(i)}
                                                    checked={this.state.checks[i]}
                                                    onChange={(e) => this.updateChecks(e)}
                                                />
                                            </td>
                                            <td>{verifier.name}</td>
                                            <td>{verifier.use_case.map((useCase: any) =>
                                                <p style={{ padding: 3 }}>{useCase}</p>
                                            )}</td>
                                            <td>{verifier.location}</td>
                                            <td>{verifier.website}</td>
                                            <td>{verifier.max_datacap_allocation}</td>
                                            <td>{verifier.private_request}</td>
                                        </tr>
                                    )
                                }
                            </tbody>
                        </table>
                        : <div className="nodata">There are not available notaries yet</div>}
                </div>
            </div>
        )
    }
}