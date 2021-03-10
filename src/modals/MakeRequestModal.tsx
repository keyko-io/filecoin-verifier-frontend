import React, { Component } from 'react';
import { Data } from '../context/Data/Index'
import { config } from '../config'
// @ts-ignore
import { dispatchCustomEvent, Input, ButtonPrimary, SelectMenu, LoaderSpinner } from "slate-react-system";
import ConfirmModal from '../pages/ConfirmModal';
// @ts-ignore
import LoginGithub from 'react-login-github';
import { BurnerWallet } from '../context/Wallet/BurnerWallet';
import { bytesToiB } from '../utils/Filters';

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
    gitHubMethod: boolean,
    region: string,
    errorAddressMessage: string
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
        github_user: string,
    }
}

class MakeRequestModal extends Component<ModalProps, States> {
    public static contextType = Data

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
            gitHubMethod: true,
            region: 'North America',
            errorAddressMessage: ' '
        }
    }

    componentDidMount() {
    }

    handleSubmit = async (e: any) => {
        e.preventDefault()

        if (this.state.gitHubMethod) {
            const existingAddress = await this.checkAddress()
            existingAddress.exists === false || existingAddress.actor.length > 0 ?
                this.setState({
                    errorAddressMessage: existingAddress.exists === false ?
                        `The address does not exists on the network` :
                        `The address already has a ${bytesToiB(existingAddress.actor[0].datacap)} datacap allocation`
                })
                : this.handleGithubSubmit()
        }

        if (this.state.emailMethod) {
            this.handleEmailSubmit()
        }
    }

    checkAddress = async () => {
        if (!config.networks.includes('Mainnet')) {
            return { exists: true, actor: [] }
        }
        const wallet = new BurnerWallet()
        await wallet.loadWallet(this.context.wallet.networkIndex)
        let actorAddress
        try {
            actorAddress = await wallet.api.actorAddress(this.state.address)
        } catch (error) {
            return { exists: false }
        }
        const actor = await wallet.api.checkClient(actorAddress)
        return { exists: true, actor }
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
        const response = await this.context.createRequest({
            address: this.state.address,
            datacap: this.state.datacap + this.state.datacapExt,
            organization: this.state.organization,
            region: this.state.region,
            publicprofile: this.state.publicprofile,
            contact: this.state.contact,
            assignees: this.props.verifier.github_user,
            onboarding: true
        })
        if (response) {
            dispatchCustomEvent({
                name: "create-modal", detail: {
                    id: Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 5),
                    modal: <ConfirmModal url={response} />
                }
            })
        }
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
                    <div className="makerequest">
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
                        <div className="inputholder">
                            <Input
                                description="Filecoin Address"
                                name="address"
                                value={this.state.address}
                                placeholder="XXXXXXXXXXX"
                                onChange={this.handleChange}
                            />
                            <div className="errorAddress">{this.state.errorAddressMessage}</div>
                        </div>
                        <div className="datacapholder holdermessage">
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
                            <div className="regionlabel">Region (Where you, the Client, are based)</div>
                            <div className="datacapext">
                                <SelectMenu
                                    name="region"
                                    value={this.state.region}
                                    onChange={this.handleChange}
                                    options={config.regions}
                                />
                            </div>
                        </div>
                        <div className="methodselection">
                            <div className="methodlabel">Select the method to send your request</div>
                            <div className="methodtype">
                                <input
                                    type="radio"
                                    name="gitHubMethod"
                                    checked={this.state.gitHubMethod}
                                    onChange={this.handleChange}
                                /> Github - create issue
                                </div>
                            {this.props.verifier.private_request === "true" ?
                                <div className="methodtype">
                                    <input
                                        type="radio"
                                        name="emailMethod"
                                        checked={this.state.emailMethod}
                                        onChange={this.handleChange}
                                    /> Email - private request
                                </div>
                                : null
                            }
                        </div>

                    </div>
                    <div className="centerbutton">
                        <div id="sendbutton buttonrequest">
                            {this.context.github.githubLogged || this.state.emailMethod ?
                                <ButtonPrimary onClick={this.handleSubmit}>{this.state.submitLoading ? <LoaderSpinner /> : 'Send Request'}</ButtonPrimary>
                                : null
                            }
                        </div>
                    </div>
                </form>
                {!this.context.github.githubLogged && this.state.gitHubMethod ?

                    <div className="centerbutton">

                        <div id="githublogin" className="githubrequest">
                            <LoginGithub
                                redirectUri={config.oauthUri}
                                clientId={config.githubApp}
                                scope="repo"
                                onSuccess={(response: any) => {
                                    this.context.github.loginGithub(response.code, true)
                                }}
                                onFailure={(response: any) => {
                                    console.log('failure', response)
                                }}
                            />
                        </div>
                        <div className="loginwarn">Github sign in required</div>
                    </div>
                    : null
                }
            </div>
        )
    }
}

export default MakeRequestModal;