import React, { Component } from 'react';
// @ts-ignore
import { Table, H1, ButtonSecondary, dispatchCustomEvent } from "slate-react-system";
import Welcome from '../components/Welcome';
import PrivateVerifierModal from './PrivateVerifierModal';

export default class PrivateVerifiers extends Component {

    columns = [
        { key: "name", name: "Verifier" },
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
        selectedVerifier: [] as any[],
    }

    componentDidMount() {
        this.getList()
    }

    getList = async () => {

        const verifiers = require('../data/verifiers.json').verifiers;
        console.log(verifiers)
        this.setState({ verifiers })
        // this.state.verifiers = verifiers
        // console.log(this.state.verifiers)
    }

    selectRow = (name: string) => {
        console.log("selected " + name)
        this.state.selectedVerifier = []
        let selectedVer = this.state.selectedVerifier
        selectedVer.push(name)
        this.setState({ selectedTransactions: name })
        /*
        if(selectedVer.includes(name)){
            selectedVer = selectedVer.filter(item => item !== name)
        } else {
            selectedVer.push(name)
        }
        this.setState({selectedTransactions:name})
        */
    }

    contactVerifier = async () => {
        let selectedVerifier = this.state.selectedVerifier[0]
        let verifier = this.state.verifiers.filter((verifier: any, index: any, array: any) => verifier.name == selectedVerifier)[0] as any

        console.log("Verifier Name: " + verifier.name)

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
                        <table>
                            <thead>
                                <tr>
                                    <td>Verifier</td>
                                    <td>Location</td>
                                    <td>Email</td>
                                    <td>Address</td>
                                </tr>
                            </thead>
                            <tbody>
                                {this.state.verifiers.map((verifier: any, index: any) =>
                                    <tr
                                        key={index}
                                        onClick={() => this.selectRow(verifier.name)}
                                        className={this.state.selectedVerifier.includes(verifier.name) ? 'selected' : ''}
                                    >
                                        <td>{verifier.name}</td>
                                        <td>{verifier.location}</td>
                                        <td>{verifier.email}</td>
                                        <td>{verifier.address}</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    <div className="started">
                        <div className="siglebutton">
                            <ButtonSecondary onClick={() => this.contactVerifier()}>Contact Verifier</ButtonSecondary>
                        </div>
                    </div>
                    </div>
                </div>
        )
    }
}