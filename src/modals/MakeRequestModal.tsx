import React, { Component } from 'react';
import { Data } from '../context/Data/Index'
import { config } from '../config'
// @ts-ignore
import { dispatchCustomEvent, Input, ButtonPrimary, SelectMenu } from "slate-react-system";
import ConfirmModal from '../pages/ConfirmModal';
import { anyToBytes } from "../utils/Filters"
// @ts-ignore
import LoginGithub from 'react-login-github';
import { BurnerWallet } from '../context/Wallet/BurnerWallet';
import history from "../context/History"
import { CircularProgress } from "@material-ui/core";
import { Notary } from '../pages/Verifiers';

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
    errorAddressMessage: string,
    redirect: boolean
}

type ModalProps = {
    verifier: Notary
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
            errorAddressMessage: ' ',
            redirect: false
        }
    }

    componentDidMount() {
        this.context.github.checkToken()
    }

    handleRedirection = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault()

        dispatchCustomEvent({ name: "delete-modal", detail: {} })

        history.push({
            pathname: "/ldn-application",
            state: {
                address: this.state.address,
                region: this.state.region,
                website: this.state.publicprofile,
                organization: this.state.organization
            }
        })
    }

    handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault()

        if ((parseInt(this.state.datacap) > 1024 && this.state.datacapExt === "TiB")) {

            this.setState({ redirect: true })

            return;
        }


        if (this.state.gitHubMethod) {
            this.handleGithubSubmit()
        }

        if (this.state.emailMethod) {
            this.handleEmailSubmit()
        }
    }

    checkAddress = async () => {
        if (!config.validateAddress) {
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
        let response = ''
        const datacap = anyToBytes(this.state.datacap + this.state.datacapExt)
        if (datacap > config.largeClientRequest) {
            response = await this.context.createRequest({
                address: this.state.address,
                datacap: this.state.datacap + this.state.datacapExt,
                organization: this.state.organization,
                region: this.state.region,
                publicprofile: this.state.publicprofile,
                contact: this.state.contact,
                assigness: config.lotusNodes[this.context.wallet.networkIndex].largeClientRequestAssign,
                onboarding: true,
                // notary_name: this.props.verifier.name,
                // docs_url: this.props.verifier.docs_url
            })
        } else {
            response = await this.context.createRequest({
                address: this.state.address,
                datacap: this.state.datacap + this.state.datacapExt,
                organization: this.state.organization,
                region: this.state.region,
                publicprofile: this.state.publicprofile,
                contact: this.state.contact,
                assignees: this.props.verifier.github_user,
                onboarding: true,
                notary_name: this.props.verifier.name,
                docs_url: this.props.verifier.docs_url
            })
        }
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

    handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
            <div className="addmodal requestmodal" style={this.props.verifier.docs_url ? {} : { height: 680 }}>
                <form>
                    <div className="title">Datacap Allocation Request</div>
                    {this.state.redirect && <div
                        style={{ fontSize: "18px", padding: "40px 60px", zIndex: "10", position: "absolute", top: "0", left: "0", background: "white", color: "black", width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column" }}
                    >
                        <div style={{ lineHeight: "1.3" }}>Direct notary allocations are in the 0-1024 TiB range. To request more DataCap, please apply for a large dataset instead. Click here to apply.</div>
                        <button onClick={this.handleRedirection} style={{ marginTop: "40px", fontSize: "18px", background: "#0090ff", padding: "12px 32px", borderRadius: "6px", border: "none", color: "white", cursor: "pointer" }}>continue</button>
                    </div>}
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
                                    options={config.datacapExtName.slice(0, 5)}
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
                            <div className="methodlabel"></div>
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
                        {this.props.verifier.docs_url ?
                            <div className="docsmessage">Before submitting your request, please make sure to check out the
                                guidelines and criteria to accept Datacap request for <a href={this.props.verifier.docs_url} target="_blank" rel="noopener noreferrer">{this.props.verifier.name}</a></div>
                            :
                            null}
                    </div>
                    <div className="centerbutton buttondiv" style={this.props.verifier.docs_url ? {} : { paddingTop: 0, marginTop: 0 }}>
                        <div id="sendbutton">
                            {this.context.github.githubLogged || this.state.emailMethod ?
                                <ButtonPrimary onClick={this.handleSubmit}>{this.state.submitLoading ? <CircularProgress size={16} style={{ color: "white" }} /> : 'Send Request'}</ButtonPrimary>
                                : null
                            }
                        </div>
                    </div>
                </form >
                {!this.context.github.githubLogged && this.state.gitHubMethod ?

                    <div className="centerbutton">

                        <div id="githublogin" className="githubrequest">
                            <LoginGithub
                                redirectUri={config.oauthUri}
                                clientId={config.githubApp}
                                scope="repo"
                                onSuccess={(response: { code: string }) => {
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
            </div >
        )
    }
}

export default MakeRequestModal;