import React, { Component } from 'react';
import { Data } from '../context/Data/Index'
import { config } from '../config'
// @ts-ignore
import { dispatchCustomEvent, H3, Input, ButtonPrimary, SelectMenu, LoaderSpinner } from "slate-react-system";

type States = {
    proposeLoading: boolean
    datacap: string
    datacapExt: string
    verifierAccountID: string
};

class AddVerifierModal extends Component<{}, States> {
    public static contextType = Data

    constructor(props: {}) {
        super(props);
        this.state = {
            proposeLoading: false,
            datacap: '1',
            datacapExt: '1000000000000',
            verifierAccountID: ''
        }
    }

    componentDidMount () {

    }

    handleSubmit = async (e:any) => {
        e.preventDefault()
        this.setState({ proposeLoading: true })
        try {
            const datacap = parseFloat(this.state.datacap)
            const fullDatacap = BigInt(datacap * parseFloat(this.state.datacapExt))
            let verifierAccountID = this.state.verifierAccountID
            if(verifierAccountID.length < 12){
                verifierAccountID = await this.context.wallet.api.actorKey(verifierAccountID)
            }
            let messageID = await this.context.wallet.api.proposeVerifier(verifierAccountID, fullDatacap, this.context.wallet.walletIndex);
            this.setState({
                verifierAccountID: '',
                datacap: '1',
                datacapExt: '1000000000000',
                proposeLoading: false
            })
            this.context.dispatchNotification('Propose Message sent with ID: ' + messageID)
            dispatchCustomEvent({ name: "delete-modal", detail: {} })
        } catch (e) {
            this.setState({ proposeLoading: false })
            this.context.dispatchNotification('Proposal failed: ' + e.message)
            console.log(e.stack)
            dispatchCustomEvent({ name: "delete-modal", detail: {} })
        }
    }


    handleChange = (e:any) => {
        this.setState({ [e.target.name]: e.target.value } as any)
    }

  render() {
    return (
        <div className="addmodal">
            <H3>Add verifier</H3>
            <form>
                <div className="inputholder">
                    <Input
                        description="Notary Account ID"
                        name="verifierAccountID"
                        value={this.state.verifierAccountID}
                        placeholder="xxxxxx"
                        onChange={this.handleChange}
                    />
                </div>
                <div className="datacapholder">
                    <div className="datacap">
                        <Input
                            description="Notary datacap"
                            name="datacap"
                            value={this.state.datacap}
                            placeholder="1"
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
                </div>
                <ButtonPrimary onClick={this.handleSubmit}>{this.state.proposeLoading ? <LoaderSpinner /> : 'Propose Notary'}</ButtonPrimary>
            </form>
        </div>
    )
  }
}

export default AddVerifierModal;
