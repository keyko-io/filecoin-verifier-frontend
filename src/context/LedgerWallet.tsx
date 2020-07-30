import { mapSeries } from 'bluebird'
const TransportWebUSB = require("@ledgerhq/hw-transport-webusb")
const TransportU2F = require("@ledgerhq/hw-transport-u2f")
const FilecoinApp = require("@zondax/ledger-filecoin")
const signer = require("@zondax/filecoin-signing-tools/js")

export class LedgerWallet {

    ledgerBusy: any = false
    ledgerApp: any = false
    network: string = ''
    path: string = ''

    public loadWallet = async(network = 't') => {
        // network and path
        this.network = network
        const networkCode = network === 'f' ? 461 : 1
        this.path = `m/44'/${networkCode}'/0/0/`
        let transport
        try {
            transport = await TransportWebUSB.create();
        } catch (e) {
            // no usb
        }
        try {
            transport = await TransportU2F.create(10000);
        } catch (e) {
            // no U2F
        }
        if (transport) {
            this.ledgerApp = new FilecoinApp(transport);
        } else {
            console.log('device not found')
        }
    }

    public getAccounts = async (nStart = 0, nEnd = 5) => {

        // TODO: throwIfBusy(ledgerBusy)

        this.ledgerBusy = true
        const networkCode = this.network === 'f' ? 461 : 1
        const paths = []
        for (let i = nStart; i < nEnd; i += 1) {
          paths.push(`m/44'/${networkCode}'/0/0/${i}`)
        }
        const addresses = await mapSeries(paths, async path => {
          const { addrString } = this.handleErrors(
            await this.ledgerApp.getAddressAndPubKey(path)
          )
          return addrString
        })
        this.ledgerBusy = false

        return addresses
    }

    public sign = async (filecoinMessage:any, indexAccount:number) => {

        // TODO: throwIfBusy(ledgerBusy)

        this.ledgerBusy = true
        const serializedMessage = signer.transactionSerialize(
          filecoinMessage.toString()
        )
        const signedMessage = this.handleErrors(
          await this.ledgerApp.sign(this.path, Buffer.from(serializedMessage, 'hex'))
        )
        return JSON.stringify({
          Message: {
            From: signedMessage.message.from,
            GasLimit: signedMessage.message.gaslimit,
            GasPrice: signedMessage.message.gasprice,
            Method: signedMessage.message.method,
            Nonce: signedMessage.message.nonce,
            Params: signedMessage.message.params,
            To: signedMessage.message.to,
            Value: signedMessage.message.value,
          },
          Signature: {
            Data: signedMessage.signature.data,
            Type: signedMessage.signature.type,
          }
      })
    }

    private handleErrors = (response:any) => {
        if (
          response.error_message &&
          response.error_message.toLowerCase().includes('no errors')
        ) {
          return response
        }
        if (
          response.error_message &&
          response.error_message
            .toLowerCase()
            .includes('transporterror: invalild channel')
        ) {
          throw new Error(
            'Lost connection with Ledger. Please unplug and replug device.'
          )
        }
        throw new Error(response.error_message)
    }
}