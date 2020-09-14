import { mapSeries } from 'bluebird'

import { config } from '../config'
// @ts-ignore
import TransportWebUSB from '@ledgerhq/hw-transport-webusb'
// @ts-ignore
import FilecoinApp from "@zondax/ledger-filecoin"
const signer = require("@zondax/filecoin-signing-tools")
const VerifyAPI = require('@keyko-io/filecoin-verifier-tools/api/api')

export class LedgerWallet {

    ledgerBusy: boolean = false
    ledgerApp: any = false
    api: any
    lotusNode: any
    networkIndex: number = 0

    public loadWallet = async(networkIndex: number) => {
      this.networkIndex = networkIndex
      this.lotusNode = config.lotusNodes[networkIndex]
      this.api= new VerifyAPI(VerifyAPI.browserProvider(this.lotusNode.url, {
        token: async () => {
            return this.lotusNode.token
        }     
      }))
      let transport
      try {
          transport = await TransportWebUSB.create();
      } catch (e) {
          console.log('TransportWebUSB error', e)
      }
      if (transport) {
          try {
              this.ledgerApp = new FilecoinApp(transport);
          } catch (e) {
              console.log('FilecoinApp error', e)
          }
      } else {
          console.log('device not found')
      }
    }

    public selectNetwork = async(nodeIndex: any) => {
      this.lotusNode = config.lotusNodes[nodeIndex]
      this.loadWallet(this.networkIndex)
      return this
    }

    public getAccounts = async (nStart = 0, nEnd = 5) => {
        const paths = []
        for (let i = nStart; i < nEnd; i += 1) {
          paths.push(`m/44'/${this.lotusNode.code}'/0/0/${i}`)
        }
        const accounts = await mapSeries(paths, async path => {
            const returnLoad = await this.ledgerApp.getAddressAndPubKey(path)
            const { addrString } = this.handleErrors(returnLoad)
            return addrString
        })
        return accounts
    }

    public sign = async (filecoinMessage:any, indexAccount:number) => {
        const serializedMessage = signer.transactionSerialize(
          filecoinMessage.toString()
        )
        const signedMessage = this.handleErrors(
          await this.ledgerApp.sign(`m/44'/${this.lotusNode.code}'/1/0/${indexAccount}`, Buffer.from(serializedMessage, 'hex'))
        )
        return signedMessage.toString('base64')
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