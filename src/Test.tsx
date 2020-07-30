import React, { Component } from 'react';
import { Wallet } from './context/Index'

const VerifyAPIWithWallet = require('filecoin-verifier-tools/api/apiWallet')
const { LotusRPC } = require('@filecoin-shipyard/lotus-client-rpc')
const { BrowserProvider: Provider } = require('@filecoin-shipyard/lotus-client-provider-browser')
const { testnet } = require('@filecoin-shipyard/lotus-client-schema')
const signer = require("@keyko-io/filecoin-signing-tools/js")

export default class Test extends Component {
    public static contextType = Wallet

    componentDidMount() {

    }

    getAccounts = async () => {
        const accounts = await this.context.getAccounts()
        console.log(accounts)
    }

    sign = async () => {
        const signature = await this.context.sign({
            // object
        })
        console.log(signature)
    }

    startApi = async () => {

        let endpointUrl = "ws://localhost:1234/rpc/v0"
        let token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJBbGxvdyI6WyJyZWFkIiwid3JpdGUiLCJzaWduIiwiYWRtaW4iXX0.NXToq-xe93xdQpSeAlJrNseq4-EMA_wqhxhmyMG1h18" 

        const provider = new Provider(endpointUrl, {
            token: async () => {
                return token
            }
        })
        
        const client = new LotusRPC(provider, { schema: testnet.fullNode })

        console.log(this.context)
 
        const api = new VerifyAPIWithWallet(client, this.context)

        //const api = new VerifyAPIWithWallet(VerifyAPIWithWallet.browserProvider(endpointUrl, token), this.context)



        let verifiers = await api.listVerifiers()
    
        let ver = ""
        for (let [k,v] of verifiers) {
            ver += `** ${k}: ${v.toString(10)}`
           
        }

        console.log("ver: " + ver)

        let address = "t1ejxune6bmm6qqpcsxydk43ylashnxmmrqwjaila"

        const mnemonic = 'exit mystery juice city argue breeze film learn orange dynamic marine diary antenna road couple surge marine assume loop thought leader liquid rotate believe'
        let key = signer.keyDerive(mnemonic, "m/44'/1'/1/0/2", "")


        await api.verifyClient(address, 1000000000000000000000, key)    

    }

    public render(){
        return (
            <div>
                <button onClick={()=>this.getAccounts()}>getAccount to console</button>
                <button onClick={()=>this.sign()}>sign to console</button>
                <button onClick={()=>this.startApi()}>Print Verifiers</button>
            </div>
        )
    }
}
