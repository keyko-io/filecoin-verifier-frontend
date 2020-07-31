import React, { Component } from 'react';
import { Wallet } from './context/Index'
// @ts-ignore
import { Table, TableContent, TableColumn } from "slate-react-system";

const VerifyAPIWithWallet = require('filecoin-verifier-tools/api/apiWallet')
const { LotusRPC } = require('@filecoin-shipyard/lotus-client-rpc')
const { BrowserProvider: Provider } = require('@filecoin-shipyard/lotus-client-provider-browser')
const { testnet } = require('@filecoin-shipyard/lotus-client-schema')

export default class Verifiedclients extends Component {
    public static contextType = Wallet

    client: any
    api: any
    columns = [
        { key: "a", name: "verifier" },
        { key: "b", name: "address" },
        { key: "d", name: "status" },
    ]

    state = {
        verifiers: [
            /*
            {
                id: 1,
                a: "col 1 row 1",
                b: "col 1 row 2",
                c: "col 1 row 3",
                d: "col 1 row 4",
            }
            */
        ],
    }

    componentDidMount() {
        this.startApi()
    }

    startApi = async () => {

        let endpointUrl = "ws://localhost:1234/rpc/v0"
        let token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJBbGxvdyI6WyJyZWFkIiwid3JpdGUiLCJzaWduIiwiYWRtaW4iXX0.NXToq-xe93xdQpSeAlJrNseq4-EMA_wqhxhmyMG1h18" 

        const provider = new Provider(endpointUrl, {
            token: async () => {
                return token
            }
        })
        
        this.client = new LotusRPC(provider, { schema: testnet.fullNode })
        this.api = new VerifyAPIWithWallet(this.client, this.context)
        //const api = new VerifyAPIWithWallet(VerifyAPIWithWallet.browserProvider(endpointUrl, token), this.context)

        let verifiers = await this.api.listVerifiers()
    
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
