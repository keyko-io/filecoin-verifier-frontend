import React, { Component } from 'react';
import { Wallet } from './context/Index'
// @ts-ignore
import { Table } from "slate-react-system";

export default class Verifiedclients extends Component {
    public static contextType = Wallet

    client: any
    api: any
    columns = [
        { key: "a", name: "Verifier" },
        { key: "b", name: "Datacap" },
        { key: "d", name: "status" },
    ]

    state = {
        verifiers: [],
    }

    componentDidMount() {
        this.startApi()
    }

    startApi = async () => {
        let verifiers = await this.context.api.listVerifiers()
        console.log('verifiers', verifiers)
        let verifiers2 = await this.context.api2.listVerifiers()
        console.log('verifiers2', verifiers2)
        let ver:any = []
        for (let [k,v] of verifiers) {
            ver.push({a:k, b:v.toString(10)})
        }
        this.setState({verifiers:ver})
        /*
        console.log("ver: " + ver)

        let address = "t1i7a6kphm5qottfgz4d3ei6ge4ciziaqdpcqkzdy"
        await api.verifyClient(address, 1000000000000000000000, 2)
        */
    }

    public render(){
        return (
            <div>
                <Table data={{rows: this.state.verifiers, columns: this.columns}}/>
            </div>
        )
    }
}
