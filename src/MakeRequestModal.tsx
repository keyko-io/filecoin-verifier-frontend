import React, { Component } from 'react';
import { Wallet } from './context/Index'
import { config } from './config'
// @ts-ignore
import { dispatchCustomEvent, Input, ButtonPrimary, SelectMenu, LoaderSpinner } from "slate-react-system";

type States = {
    address: string
    datacap: string
    organization: string
    publicprofile: string
    useplan: string
    contact: string
    comments: string
    datacapExt: string
    submitLoading: boolean
    verifierName: string
    publicProfile: string
}

type ModalProps = {
    verifier: {
        id: string,
        name: string,
        use_case: string,
        location: string,
        website: string,
        total_datacap: number
        email: string
    }
}

class MakeRequestModal extends Component<ModalProps, States> {
    public static contextType = Wallet

    constructor(props: ModalProps) {
        super(props);
        this.state = {
            address: '',
            datacap: '1',
            organization: '',
            publicprofile: '',
            useplan: '',
            contact: '',
            comments: '',
            datacapExt: 'TiB',
            submitLoading: false,
            verifierName: this.props.verifier.name,
            publicProfile: this.props.verifier.website
        }
    }

    componentDidMount() {
    }

    handleSubmit = async (e: any) => {
        e.preventDefault()

        const emailrequest = await fetch(config.apiUri + '/api/v1/email/requestDatacap', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${config.apiToken}`
            },
            body: JSON.stringify({
                verifierEmail: this.props.verifier.email,
                verifierName: this.state.verifierName,
                name: this.state.organization,
                publicProfile:  this.props.verifier.website,
                useCase: this.state.useplan,
                contact: this.state.contact,
                address: this.state.address,
                datacap: this.state.datacap,
                datacapUnit: this.state.datacapExt,
                comments: this.state.comments,
                subject: "New Request of Datacap",
                datetimeRequested: ""
            })
        })
        const request = await emailrequest.json()
        if (request.success) {
            dispatchCustomEvent({ name: "delete-modal", detail: {} })
        }
        this.setState({ submitLoading: false })
    }

    handleChange = (e: any) => {
        this.setState({ [e.target.name]: e.target.value } as any)
    }

    render() {
        return (
            <div className="addmodal">
                <form>
                    <div className="title">Making Request</div>
                    <div className="twopanel">

                        <div>
                            <div className="inputholder">
                                <Input
                                    description="Organization or Personal Name"
                                    name="organization"
                                    value={this.state.organization}
                                    placeholder="Name of organization"
                                    onChange={this.handleChange}
                                />
                            </div>
                            <div className="inputholder">
                                <Input
                                    description="Public Profile of Organization"
                                    name="publicprofile"
                                    value={this.state.publicprofile}
                                    placeholder="XXXXXXXXXXX"
                                    onChange={this.handleChange}
                                />
                            </div>
                            <div className="inputholder">
                                <Input
                                    description="Intended Use Case / Allocation Plan"
                                    name="useplan"
                                    value={this.state.useplan}
                                    placeholder="Intended Use Case"
                                    onChange={this.handleChange}
                                />
                            </div>
                            <div className="inputholder">
                                <Input
                                    description="Contact Information"
                                    name="contact"
                                    value={this.state.contact}
                                    placeholder="Contact of Proposer"
                                    onChange={this.handleChange}
                                />
                            </div>
                        </div>


                        <div>
                            <div className="inputholder">
                                <Input
                                    description="Address"
                                    name="address"
                                    value={this.state.address}
                                    placeholder="XXXXXXXXXXX"
                                    onChange={this.handleChange}
                                />
                            </div>
                            <div className="datacapholder">
                                <div className="datacap">
                                    <Input
                                        description="Datacap Request"
                                        name="datacap"
                                        value={this.state.datacap}
                                        placeholder="1000000000000"
                                        onChange={this.handleChange}
                                    />
                                </div>
                                <div className="datacapext">
                                    <SelectMenu
                                        name="datacapExt"
                                        value={this.state.datacapExt}
                                        onChange={this.handleChange}
                                        options={config.datacapExtName}
                                    />
                                </div>
                            </div>
                            <div className="inputholder">
                                <Input
                                    description="Comments"
                                    name="comments"
                                    value={this.state.comments}
                                    placeholder="Additional comments"
                                    onChange={this.handleChange}
                                />
                            </div>
                        </div>

                    </div>
                    <div className="centerbutton">
                        <ButtonPrimary onClick={this.handleSubmit}>{this.state.submitLoading ? <LoaderSpinner /> : 'Send Request'}</ButtonPrimary>
                    </div>
                </form>
            </div>
        )
    }
}

export default MakeRequestModal;