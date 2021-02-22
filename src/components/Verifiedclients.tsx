import React, { Component } from 'react';
import { Data } from '../context/Data/Index'
import { config } from '../config'
import { anyToBytes } from '../utils/Filters'
// @ts-ignore
import { Table, H1, H2, Input, ButtonPrimary, ButtonSecondary, LoaderSpinner, SelectMenu } from "slate-react-system";

type States = {
    verifiers: any[]
    address: string
    datacap: string
    datacapExt: string,
    submitLoading: boolean
};

export default class Verifiedclients extends Component<{},States> {
    public static contextType = Data

    columns = [
        { key: "verified", name: "Verified client" },
        { key: "datacap", name: "Datacap" }
    ]

    constructor(props: {}) {
        super(props);
        this.state = {
            verifiers: [],
            address: '',
            datacap: '1',
            datacapExt: '1000000000000',
            submitLoading: false
        }
    }

    componentDidMount() {
        this.getList()
    }

    getList = async () => {
        const verifiers = await this.context.wallet.api.listVerifiedClients()
        this.setState({verifiers})
    }

    handleSubmit = async (e:any) => {
        e.preventDefault()
        this.setState({ submitLoading: true })
        try{
            const fullDatacap = anyToBytes(`${this.state.datacap}${this.state.datacapExt}`)
            let messageID = await this.context.wallet.api.verifyClient(this.state.address, BigInt(fullDatacap), this.context.wallet.walletIndex);
            this.setState({
                address: '',
                datacap: '1',
                datacapExt: '1000000000000',
                submitLoading: false
            })
            this.context.dispatchNotification('Verify Client Message sent with ID: ' + messageID)
        } catch (e) {
            this.setState({ submitLoading: false })
            this.context.dispatchNotification('Client verification failed: ' + e.message)
            console.log(e.stack)
        }
    }

    handleChange = (e:any) => {
        this.setState({ [e.target.name]: e.target.value } as any)
    }

    render(){
        return (
            <div>
                <H1>Verified clients</H1>
                <Table data={{rows: this.state.verifiers, columns: this.columns}}/>
                <ButtonSecondary onClick={()=>this.getList()}>Refresh</ButtonSecondary>
                <H2>Verify client</H2>
                <div>
                    <form>
                        <Input
                            description="Verified client address"
                            name="address"
                            value={this.state.address}
                            placeholder="xxxxxx"
                            onChange={this.handleChange}
                        />
                        <div className="datacapholder">
                            <div className="datacap">
                                <Input
                                    description="Verified client datacap"
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
                                    options={config.datacapExtOptions}
                                />
                            </div>
                        </div>
                        <ButtonPrimary onClick={this.handleSubmit}>{this.state.submitLoading ? <LoaderSpinner /> : 'Verify'}</ButtonPrimary>
                    </form>
                </div>
            </div>
        )
    }
}
