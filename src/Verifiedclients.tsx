import React, { Component } from 'react';
import { Wallet } from './context/Index'
import { config } from './config'
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
    public static contextType = Wallet

    columns = [
        { key: "a", name: "Verifier" },
        { key: "b", name: "Datacap" }
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
        let listverifiers = await this.context.api.listVerifiedClients()
        let ver:any = []
        for (let [k,v] of listverifiers) {
            ver.push({a:k, b:v.toString(10)})
        }
        this.setState({verifiers:ver})
    }



    handleSubmit = async (e:any) => {
        e.preventDefault()
        this.setState({ submitLoading: true })
        try{
            const datacap = parseFloat(this.state.datacap)
            const fullDatacap = BigInt(datacap * parseFloat(this.state.datacapExt))
            let messageID = await this.context.api.verifyClient(this.state.address, fullDatacap, this.context.walletIndex);
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
                            description="Verifier address"
                            name="address"
                            value={this.state.address}
                            placeholder="xxxxxx"
                            onChange={this.handleChange}
                        />
                        <div className="datacapholder">
                            <div className="datacap">
                                <Input
                                    description="Verifier datacap"
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
                        <ButtonPrimary onClick={this.handleSubmit}>{this.state.submitLoading ? <LoaderSpinner /> : 'Verify'}</ButtonPrimary>
                    </form>
                </div>
            </div>
        )
    }
}
