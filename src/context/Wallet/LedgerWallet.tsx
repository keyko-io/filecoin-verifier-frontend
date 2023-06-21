import { mapSeries } from 'bluebird'

import { config } from '../../config'
// @ts-ignore
import TransportWebUSB from '@ledgerhq/hw-transport-webusb'
// @ts-ignore
import FilecoinApp from "@zondax/ledger-filecoin"
import signer from "@zondax/filecoin-signing-tools/js"
import { VerifyAPI } from '@keyko-io/filecoin-verifier-tools'
import { ConfigLotusNode } from '../contextType'
export class LedgerWallet {

  ledgerBusy: boolean = false
  ledgerApp: any = false
  api: any
  lotusNode: ConfigLotusNode
  networkIndex: number = 0

  public loadWallet = async (networkIndex: number) => {
    this.networkIndex = networkIndex
    this.lotusNode = config.lotusNodes[networkIndex]
    this.api = new VerifyAPI(
      VerifyAPI.browserProvider(this.lotusNode.url
        , {
          token: async () => {
            return this.lotusNode.token
          }
        }
      )
      , { sign: this.sign, getAccounts: this.getAccounts }
      , this.lotusNode.name !== "Mainnet" // if node != Mainnet => testnet = true
    )


    let transport
    try {
      transport = await TransportWebUSB.create();
    } catch (e: any) {
      console.log('TransportWebUSB error', e)
    }
    if (transport) {
      try {
        this.ledgerApp = new FilecoinApp(transport);
        const version = await this.ledgerApp.getVersion()
        if (version.device_locked) {
          throw new Error('Ledger locked.')
        }
        if (version.test_mode) {
          throw new Error('Filecoin app in test mode.')
        }
        if (version.minor < 18) {
          throw new Error('Please update Filecoin app on Ledger.')
        }
        if (version.minor < 18 && version.patch < 2) {
          throw new Error('Please update Filecoin app on Ledger.')
        }
      } catch (e: any) {
        throw new Error(e.message)
      }
    } else {
      console.log('device not found')
    }
  }

  public selectNetwork = async (nodeIndex: any) => {
    this.lotusNode = config.lotusNodes[nodeIndex]
    this.loadWallet(this.networkIndex)
    return this
  }

  public getAccounts = async (nStart = 0) => {
    const paths = []

    for (let i = nStart; i < config.numberOfWalletAccounts; i += 1) {
      paths.push(`m/44'/${this.lotusNode.code}'/0'/0/${i}`)
    }

    const accounts = await mapSeries(paths, async path => {
      const returnLoad = await this.ledgerApp.getAddressAndPubKey(path)
      const { addrString } = this.handleErrors(returnLoad)
      return addrString
    })

    return accounts
  }

  public sign = async (filecoinMessage: any, indexAccount: number) => {
   const serializedMessage = signer.transactionSerialize(
      filecoinMessage
    )
    const signedMessage = this.handleErrors(
      await this.ledgerApp.sign(`m/44'/${this.lotusNode.code}'/0'/0/${indexAccount}`, Buffer.from(serializedMessage, 'hex'))
    )

    return await this.generateSignedMessage(filecoinMessage, signedMessage)
  }

  /**
   *  async signRemoveDataCap(path, message) {
      return this.signGeneric(path, message, INS.SIGN_DATA_CAP);
    }
    lotus command is: lfp  sign-remove-data-cap-proposal  t1ualijplj5aaaogymjce4subwj2rfyiqcpragbjy t1uwc7jhbu6nh5il2j6wjvjgjx5n624c3iummknwa 100

   */
  public signRemoveDataCap = async (message: any, indexAccount: number) => {
    // debugger
    // const serializedMessage = signer.transactionSerialize(
    //   message
    // )
    // const signedMessage = this.handleErrors(
      
      const signedMessage = await this.ledgerApp.signRemoveDataCap(`m/44'/${this.lotusNode.code}'/0'/0/${indexAccount}`, message)
    // )
    console.log("signedMessage",signedMessage)
    return signedMessage
    // return await this.generateSignedMessage(filecoinMessage, signedMessage)
  }


  private generateSignedMessage = async (filecoinMessage: any, signedMessage: any) => {

    return JSON.stringify({
      Message: {
        From: filecoinMessage.from,
        GasLimit: filecoinMessage.gaslimit,
        GasFeeCap: filecoinMessage.gasfeecap,
        GasPremium: filecoinMessage.gaspremium,
        Method: filecoinMessage.method,
        Nonce: filecoinMessage.nonce,
        Params: Buffer.from(filecoinMessage.params, "hex").toString(
          "base64"
        ),
        To: filecoinMessage.to,
        Value: filecoinMessage.value,
      },
      Signature: {
        Data: signedMessage.signature_compact.toString('base64'),
        Type: 1
        //Type: signedMessage.signature.type,
      },
    });


  }

  private handleErrors = (response: any) => {
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