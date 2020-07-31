import React, { Component } from 'react';
import { Wallet } from './context/Index'
// @ts-ignore
import { Table, H1, H2, Input, ButtonPrimary, ButtonSecondary } from "slate-react-system";

type States = {
    verifiers: any[]
    address: string
    datacap: string
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
            datacap: '1000000000000000000000'
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
        const datacap = BigInt(this.state.datacap);
        await this.context.api.verifyClient(this.state.address, datacap, 2);
        this.setState({
            address: '',
            datacap: '1000000000000000000000'
        })
    }

    handleChange = (e:any) => {
        this.setState({ [e.target.name]: e.target.value } as any)
    }

    render(){
        return (
            <div>
                <H1>Verified clients</H1>
                <Table data={{rows: this.state.verifiers, columns: this.columns}}/>
                <ButtonSecondary onClick={()=>this.getList()}>Reload</ButtonSecondary>
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
                        <Input
                            description="Verifier datacap"
                            name="datacap"
                            value={this.state.datacap}
                            placeholder="1000000000000000000000"
                            onChange={this.handleChange}
                        />
                        <ButtonPrimary onClick={this.handleSubmit}>Verify</ButtonPrimary>
                    </form>
                </div>
            </div>
        )
    }
}
