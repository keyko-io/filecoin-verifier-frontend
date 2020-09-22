import React, { Component } from 'react';
import { Wallet } from './context/Index'
import { config } from './config'
// @ts-ignore
import { dispatchCustomEvent, H3, Input, ButtonPrimary, SelectMenu, LoaderSpinner } from "slate-react-system";

type States = {
    address: string
    datacap: string
    datacapExt: string
    submitLoading: boolean
};

class AddClientModal extends Component<{}, States> {
    public static contextType = Wallet

    constructor(props: {}) {
        super(props);
        this.state = {
            address: '',
            datacap: '1',
            datacapExt: '1000000000000',
            submitLoading: false
        }
    }

    componentDidMount () {

    }

    handleSubmit = async (e:any) => {
        e.preventDefault()
        this.setState({ submitLoading: true })
        try{
            const datacap = parseFloat(this.state.datacap)
            const fullDatacap = BigInt(datacap * parseFloat(this.state.datacapExt))
            let address = this.state.address
            if(address.length < 12){
                address = await this.context.api.actorKey(address)
            }
            let messageID = await this.context.api.verifyClient(address, fullDatacap, this.context.walletIndex);
            this.setState({
                address: '',
                datacap: '1',
                datacapExt: '1000000000000',
                submitLoading: false
            })
            this.context.dispatchNotification('Verify Client Message sent with ID: ' + messageID)
            dispatchCustomEvent({ name: "delete-modal", detail: {} })
        } catch (e) {
            this.setState({ submitLoading: false })
            this.context.dispatchNotification('Client verification failed: ' + e.message)
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
        <H3>Add Verified client</H3>
        <div>
            <form>
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
                </div>
                <ButtonPrimary onClick={this.handleSubmit}>{this.state.submitLoading ? <LoaderSpinner /> : 'Add client'}</ButtonPrimary>
            </form>
        </div>
      </div>
    )
  }
}

export default AddClientModal;
