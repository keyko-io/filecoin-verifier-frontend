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

    public sign = async (filecoinMessage:any) => {

        // TODO: throwIfBusy(ledgerBusy)

        this.ledgerBusy = true
        const serializedMessage = signer.transactionSerialize(
          filecoinMessage.toString()
        )
        const { signature_compact } = this.handleErrors(
          await this.ledgerApp.sign(this.path, Buffer.from(serializedMessage, 'hex'))
        )
        return signature_compact.toString('base64')
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