import React, { Component } from 'react';
import { Wallet } from '../context/Index'
import { config } from '../config'
// @ts-ignore
import { dispatchCustomEvent, H3, Input, ButtonPrimary, SelectMenu, LoaderSpinner } from "slate-react-system";

type States = {
    name: string,
    address: string
    datacap: string
    datacapExt: string,
    publicProfile: string,
    use: string,
    contact: string,
    comments: string,
    submitLoading: boolean
};

class PrivateVerifierModal extends Component<{}, States> {
    public static contextType = Wallet

    constructor(props: {}) {
        super(props);
        this.state = {
            name: '',
            address: '',
            datacap: '1',
            datacapExt: '1000000000000',
            publicProfile: '',
            use: '',
            contact: '',
            comments: '',
            submitLoading: false
        }
    }

    componentDidMount() {

    }

    handleSubmit = async (e: any) => {
        e.preventDefault()
        this.setState({ submitLoading: true })
        try {
            //const datacap = parseFloat(this.state.datacap)
            //const fullDatacap = BigInt(datacap * parseFloat(this.state.datacapExt))
            //let address = this.state.address
            /*
            if(address.length < 12){
                address = await this.context.api.actorKey(address)
            }*/

            // Contact Verifier
            /*
                If the verifier is available via email, compose html with the info provided and send the email to the verifier
                If the verifier is available via github, compose a markdown with the info provided and create a new issue in the repo of the verifier.
                    For this, the app will use a generic github user as "filecoin-verifier-app". 
                    The verifier must configure his private repo with the proper permissions for this user

            */

            this.setState({
                name: '',
                address: '',
                datacap: '1',
                datacapExt: '1000000000000',
                publicProfile: '',
                use: '',
                contact: '',
                comments: '',
                submitLoading: false
            })
            this.context.dispatchNotification('Datacap requested to verifier ')
            dispatchCustomEvent({ name: "delete-modal", detail: {} })
        } catch (e) {
            this.setState({ submitLoading: false })
            this.context.dispatchNotification('Request Datacap failed: ' + e.message)
            console.log(e.stack)
            dispatchCustomEvent({ name: "delete-modal", detail: {} })
        }
    }

    handleChange = (e: any) => {
        this.setState({ [e.target.name]: e.target.value } as any)
    }


    render() {
        return (
            <div className="addmodal">
                <H3>Request Datacap </H3>
                <div>
                    <form>
                        <div className="inputholder">
                            <Input
                                description="Organization or Personal Name"
                                name="name"
                                value={this.state.name}
                                placeholder="xxxxxx"
                                onChange={this.handleChange}
                            />
                        </div>
                        <div className="inputholder">
                            <Input
                                description="Client address"
                                name="address"
                                value={this.state.address}
                                placeholder="xxxxxx"
                                onChange={this.handleChange}
                            />
                        </div>
                        <div className="datacapholder">
                            <div className="datacap">
                                <Input
                                    description="Client datacap"
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
                                    options={config.datacapExt}
                                />
                            </div>
                            <div className="inputholder">
                                <Input
                                    description="Public Profiles of Organization"
                                    name="publicProfile"
                                    value={this.state.publicProfile}
                                    placeholder="xxxxxx"
                                    onChange={this.handleChange}
                                />
                            </div>
                            <div className="inputholder">
                                <Input
                                    description="Intended use case"
                                    name="use"
                                    value={this.state.use}
                                    placeholder="xxxxxx"
                                    onChange={this.handleChange}
                                />
                            </div>
                            <div className="inputholder">
                                <Input
                                    description="Contact Information"
                                    name="contact"
                                    value={this.state.contact}
                                    placeholder="xxxxxx"
                                    onChange={this.handleChange}
                                />
                            </div>
                            <div className="inputholder">
                                <Input
                                    description="Comments"
                                    name="comments"
                                    value={this.state.comments}
                                    placeholder="xxxxxx"
                                    onChange={this.handleChange}
                                />
                            </div>
                        </div>
                        <ButtonPrimary onClick={this.handleSubmit}>{this.state.submitLoading ? <LoaderSpinner /> : 'Request Datacap'}</ButtonPrimary>
                    </form>
                </div>
            </div>
        )
    }
}

export default PrivateVerifierModal;
