import { config } from '../../config'

const signer = require("@zondax/filecoin-signing-tools/js")
const VerifyAPI = require('@keyko-io/filecoin-verifier-tools/api/api')

export class BurnerWallet {

    // Notary: 
    mnemonic: string = 'exit mystery juice city argue breeze film learn orange dynamic marine diary antenna road couple surge marine assume loop thought leader liquid rotate believe'
    //RKH
    // mnemonic: string = 'robot matrix ribbon husband feature attitude noise imitate matrix shaft resist cliff lab now gold menu grocery truth deliver camp about stand consider number'
    client: any
    api: any
    lotusNode: any
    networkIndex: number = 0

    public loadWallet = async (networkIndex: number) => {
        this.networkIndex = networkIndex
        this.lotusNode = config.lotusNodes[networkIndex]
        this.api = new VerifyAPI(
            VerifyAPI.browserProvider(
                this.lotusNode.url
                // , {
                //     token: async () => {
                //         return this.lotusNode.token
                //     }
                // }
                )
            , { sign: this.sign, getAccounts: this.getAccounts }
            , this.lotusNode.name !== "Mainnet" // if node != Mainnet => testnet = true
        )
    }

    public importSeed = async (seedphrase: string) => {
        this.mnemonic = seedphrase
        return this
    }

    public selectNetwork = async (nodeIndex: any) => {
        this.lotusNode = config.lotusNodes[nodeIndex]
        this.loadWallet(this.networkIndex)
        return this
    }

    public getAccounts = async (nStart = 0, nEnd = 15) => {
        const accounts = []
        for (let i = nStart; i < nEnd; i += 1) {
            accounts.push(
                signer.keyDerive(this.mnemonic, `m/44'/${this.lotusNode.code}'/0/0/${i}`, '').address
            )
        }
        return accounts
    }

    public sign = async (filecoinMessage: any, indexAccount: number) => {
        const private_hexstring = signer.keyDerive(this.mnemonic, `m/44'/${this.lotusNode.code}'/0/0/${indexAccount}`, '').private_hexstring
        return signer.transactionSignLotus(
            filecoinMessage,
            private_hexstring
        )
    }
}