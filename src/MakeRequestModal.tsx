import React, { Component } from 'react';
import { Wallet } from './context/Index'
import { config } from './config'
// @ts-ignore
import { dispatchCustomEvent, Input, ButtonPrimary, SelectMenu, LoaderSpinner, CheckBox } from "slate-react-system";
import ConfirmModal from './pages/ConfirmModal';
// @ts-ignore
import LoginGithub from 'react-login-github';

type States = {
    address: string
    datacap: string
    organization: string
    publicprofile: string
    contact: string
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
        private_request: string,
        github_user: string
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
            contact: '',
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

    handleSubmit = async (e: any) => {
        e.preventDefault()
        if (this.state.gitHubMethod) {
            this.handleGithubSubmit()
        }
        if (this.state.emailMethod) {
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
                    contact: this.state.contact,
                    address: this.state.address,
                    datacap: this.state.datacap,
                    datacapUnit: this.state.datacapExt,
                    subject: "New Request of Datacap",
                    datetimeRequested: ""
                })
            })
            const request = await emailrequest.json()
            if (request.success) {
                dispatchCustomEvent({
                    name: "create-modal", detail: {
                        id: Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 5),
                        modal: <ConfirmModal />
                    }
                })
            }
            this.setState({ submitLoading: false })
        } catch (error) {
            console.log("ERROR: " + error)
            dispatchCustomEvent({
                name: "create-modal", detail: {
                    id: Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 5),
                    modal: <ConfirmModal error={true} />
                }
            })
        }

    }

    handleGithubSubmit = async () => {
        this.setState({ submitLoading: true })
        this.context.createRequest({
            address: this.state.address,
            datacap: this.state.datacap + this.state.datacapExt,
            organization: this.state.organization,
            publicprofile: this.state.publicprofile,
            contact: this.state.contact,
            assignees: [this.props.verifier.github_user],
            onboarding: true
        })
        dispatchCustomEvent({ name: "delete-modal", detail: {} })
        this.setState({ submitLoading: false })
    }

    handleChange = (e: any) => {
        if (e.target.name === 'gitHubMethod') {
            this.setState({ emailMethod: false })
        }
        if (e.target.name === 'emailMethod') {
            this.setState({ gitHubMethod: false })
        }
        this.setState({ [e.target.name]: e.target.value } as any)
    }

    render() {
        return (
            <div className="addmodal">
                <form>
                    <div className="title">Datacap Allocation Request</div>
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
                                    description="Website / Social Media"
                                    name="publicprofile"
                                    value={this.state.publicprofile}
                                    placeholder="XXXXXXXXXXX"
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
                            <div className="methodselection">
                                <div className="methodlabel">Select the method to send your request</div>
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
                <div id="githublogin">
                    <LoginGithub
                        clientId={config.githubApp}
                        scope="repo"
                        onSuccess={(response: any) => {
                            this.context.loginGithub(response.code, true)
                        }}
                        onFailure={(response: any) => {
                            console.log('failure', response)
                        }}
                    />
                </div>
            </div>
        )
    }
}

export default MakeRequestModal;