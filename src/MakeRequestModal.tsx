import React, { Component } from 'react';
import { Wallet } from './context/Index'
import { config } from './config'
// @ts-ignore
import { dispatchCustomEvent, Input, ButtonPrimary, SelectMenu, LoaderSpinner, CheckBox } from "slate-react-system";

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
    emailMethod: boolean,
    gitHubMethod: boolean
}

type ModalProps = {
    verifier: {
        id: string,
        name: string,
        use_case: string,
        location: string,
        website: string,
        total_datacap: number,
        email: string,
        private_request: string
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
            publicProfile: this.props.verifier.website,
            emailMethod: false,
            gitHubMethod: false
        }
    }

    componentDidMount() {
    }

    handleSubmit = async (e:any) => {
        e.preventDefault()
        if(this.state.gitHubMethod){
            this.handleGithubSubmit()
        }
        if(this.state.emailMethod){
            this.handleEmailSubmit()
        }
    }

    handleEmailSubmit = async () => {
        try {
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
                publicProfile: this.state.publicprofile,
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
    }catch(error) {
        // HANDLE ERROR
        console.log("ERROR: " + error)
    }

    }

    handleGithubSubmit = async () => {
        this.setState({ submitLoading: true })
        this.context.createRequest({
            address: this.state.address,
            datacap: this.state.datacap + this.state.datacapExt,
            organization: this.state.organization,
            publicprofile: this.state.publicprofile,
            useplan: this.state.useplan,
            contact: this.state.contact,
            comments: this.state.comments
        })
        dispatchCustomEvent({ name: "delete-modal", detail: {} })
        this.setState({ submitLoading: false })
    }

    handleChange = (e: any) => {
        if(e.target.name === 'gitHubMethod'){
            this.setState({emailMethod: false})
        }
        if(e.target.name === 'emailMethod'){
            this.setState({gitHubMethod: false})
        }
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
                            <div className="methodselection">
                                <div className="methodlabel"> Select the method to send your request</div>
                                {this.props.verifier.private_request === "true" ? 
                                <CheckBox
                                    name="emailMethod"
                                    value={this.state.emailMethod}
                                    onChange={this.handleChange}
                                >Email - send message</CheckBox>
                                : null
                            }
                                <CheckBox
                                    name="gitHubMethod"
                                    value={this.state.gitHubMethod}
                                    onChange={this.handleChange}
                                >Github - create issue </CheckBox>
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