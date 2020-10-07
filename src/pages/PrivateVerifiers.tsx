import React, { Component } from 'react';
// @ts-ignore
import { Table, CheckBox, ButtonSecondary, dispatchCustomEvent } from "slate-react-system";
import Welcome from '../components/Welcome';
import PrivateVerifierModal from './PrivateVerifierModal';

export default class PrivateVerifiers extends Component {

    columns = [
        { key: "name", name: "Verifier", type: "FILE_LINK" },
        { key: "location", name: "Location" },
        { key: "website", name: "website" },
        { key: "email", name: "email" },
        { key: "address", name: "Address" },
        { key: "total_datacap", name: "Total Datacap" },
        { key: "email_request", name: "Available on email," },
        { key: "github_request", name: "Available on github" },
        { key: "github_user", name: "Github user" },
        { key: "github_repo", name: "Github repo" }
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
        const verifiers = require('../data/verifiers.json').verifiers;
        this.setState({ verifiers })
    }


    updateChecks = (e: any) => {
        let checks = [] as any[]
        this.state.checks.forEach((ele, i) => {
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
                modal: <PrivateVerifierModal />
            }
        })
    }

    public render() {
        return (
            <div className="verifiers">
                <div className="container">
                    <Welcome />
                    <div className="tableverifiers">
                        <div className="checks">
                            {this.state.verifiers.map((_, i) => {
                                return (<CheckBox
                                    name={i}
                                    key={i}
                                    value={this.state.checks[i]}
                                    onChange={this.updateChecks}
                                />)
                            })}
                        </div>
                        <div className="data">
                            <Table
                                data={{
                                    columns: this.columns,
                                    rows: this.state.verifiers,
                                }}
                                name="verifiers"
                            />
                        </div>
                    </div>
                    <div className="started">
                        <div className="siglebutton">
                            <ButtonSecondary
                                onClick={() => this.contactVerifier()}>
                                Contact Verifier
                            </ButtonSecondary>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}