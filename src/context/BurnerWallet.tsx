const signer = require("@keyko-io/filecoin-signing-tools/js")
const VerifyAPIWithWallet = require('filecoin-verifier-tools/api/apiWallet')
const { LotusRPC } = require('@filecoin-shipyard/lotus-client-rpc')
const { BrowserProvider: Provider } = require('@filecoin-shipyard/lotus-client-provider-browser')
const { testnet } = require('@filecoin-shipyard/lotus-client-schema')

export class BurnerWallet {

    mnemonic: string = 'exit mystery juice city argue breeze film learn orange dynamic marine diary antenna road couple surge marine assume loop thought leader liquid rotate believe'
    mnemonic2: string = 'robot matrix ribbon husband feature attitude noise imitate matrix shaft resist cliff lab now gold menu grocery truth deliver camp about stand consider number'
    network: string = ''
    path: string = "m/44'/1'/1/0/"
    token: string = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJBbGxvdyI6WyJyZWFkIiwid3JpdGUiLCJzaWduIiwiYWRtaW4iXX0.0VuB8dEF2Z_oZcyrsohYFFJjPthJrN4eG_LpS8IkDBA%'
    endpointUrl: string = 'ws://localhost:1234/rpc/v0'
    client: any
    api: any
    client2: any
    api2: any

    public loadWallet = async(network = 't') => {
        // network and path
        this.network = network
        // const networkCode = network === 'f' ? 461 : 1
        //this.path = `m/44'/${networkCode}'/0/0/`
        //this.mnemonic = 'embody second thing treat element else coin craft movie clutch push quote sting more used dilemma dumb strong maid provide movie mercy report promote'
        // console.log(signer.generateMnemonic())

        //this.path = "m/44'/1'/1/0/2"
        // this.path = "m/44'/1'/1/0/"
        const provider = new Provider(this.endpointUrl, {
            token: async () => {
                return this.token
            }
        })
        this.client = new LotusRPC(provider, { schema: testnet.fullNode })
        this.api = new VerifyAPIWithWallet(this.client, {sign: this.sign, getAccounts: this.getAccounts})

        const provider2 = new Provider(this.endpointUrl, {
            token: async () => {
                return this.token
            }
        })
        this.client2 = new LotusRPC(provider2, { schema: testnet.fullNode })
        this.api2 = new VerifyAPIWithWallet(this.client2, {sign: this.sign2, getAccounts: this.getAccounts2})
    }

    public getAccounts = async (nStart = 0, nEnd = 5) => {
        const accounts = []
        for (let i = nStart; i < nEnd; i += 1) {
            accounts.push(
                signer.keyDerive(this.mnemonic, `${this.path}${i}`, '').address
            )
        }
        return accounts
    }

    public getAccounts2 = async (nStart = 0, nEnd = 5) => {
        const accounts = []
        for (let i = nStart; i < nEnd; i += 1) {
            accounts.push(
                signer.keyDerive(this.mnemonic2, `${this.path}${i}`, '').address
            )
        }
        return accounts
    }

    public sign = async (filecoinMessage:any, indexAccount:number) => {

        //const { private_hexstring } = signer.keyDerive(this.mnemonic, this.path+'0', '')
        const private_hexstring = signer.keyDerive(this.mnemonic, this.path + indexAccount as string, '').private_hexstring

        const signedMessage = signer.transactionSign(
          filecoinMessage,
          private_hexstring
        )
        return JSON.stringify({
            Message: {
              From: signedMessage.message.from,
              GasLimit: signedMessage.message.gaslimit,
              GasPrice: signedMessage.message.gasprice,
              Method: signedMessage.message.method,
              Nonce: signedMessage.message.nonce,
             // Params: signedMessage.message.params,
             Params: Buffer.from(signedMessage.message.params, "hex").toString("base64"),
              To: signedMessage.message.to,
              Value: signedMessage.message.value,
            },
            Signature: {
              Data: signedMessage.signature.data,
              Type: signedMessage.signature.type,
            }
        })
    }

    public sign2 = async (filecoinMessage:any, indexAccount:number) => {
        const private_hexstring = signer.keyDerive(this.mnemonic2, this.path + indexAccount as string, '').private_hexstring
        const signedMessage = signer.transactionSign(
          filecoinMessage,
          private_hexstring
        )
        return JSON.stringify({
            Message: {
              From: signedMessage.message.from,
              GasLimit: signedMessage.message.gaslimit,
              GasPrice: signedMessage.message.gasprice,
              Method: signedMessage.message.method,
              Nonce: signedMessage.message.nonce,
             // Params: signedMessage.message.params,
             Params: Buffer.from(signedMessage.message.params, "hex").toString("base64"),
              To: signedMessage.message.to,
              Value: signedMessage.message.value,
            },
            Signature: {
              Data: signedMessage.signature.data,
              Type: signedMessage.signature.type,
            }
        })
    }

}