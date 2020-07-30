const signer = require("@keyko-io/filecoin-signing-tools/js")

export class BurnerWallet {

    mnemonic: string = ''
    network: string = ''
    path: string = ''

    public loadWallet = async(network = 't') => {
        // network and path
        this.network = network
        const networkCode = network === 'f' ? 461 : 1
        //this.path = `m/44'/${networkCode}'/0/0/`
        //this.mnemonic = 'embody second thing treat element else coin craft movie clutch push quote sting more used dilemma dumb strong maid provide movie mercy report promote'
        // console.log(signer.generateMnemonic())

        this.path = "m/44'/1'/1/0/2"
        this.mnemonic = 'exit mystery juice city argue breeze film learn orange dynamic marine diary antenna road couple surge marine assume loop thought leader liquid rotate believe'  
      
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

        //const { private_hexstring } = signer.keyDerive(this.mnemonic, this.path+'0', '')
        const private_hexstring = signer.keyDerive(this.mnemonic, this.path, '').private_hexstring

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