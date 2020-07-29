const signer = require("@zondax/filecoin-signing-tools/js")

export class BurnerWallet {

    mnemonic: string = ''
    network: string = ''
    path: string = ''

    public loadWallet = async(network = 't') => {
        // network and path
        this.network = network
        const networkCode = network === 'f' ? 461 : 1
        this.path = `m/44'/${networkCode}'/0/0/`
        this.mnemonic = 'embody second thing treat element else coin craft movie clutch push quote sting more used dilemma dumb strong maid provide movie mercy report promote'
        // console.log(signer.generateMnemonic())
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

    public sign = async (filecoinMessage:any) => {
        const { private_hexstring } = signer.keyDerive(this.mnemonic, this.path+'0', '')
        const { signature } = signer.transactionSign(
          filecoinMessage.toString(),
          private_hexstring
        )
        return signature.data
    }

}