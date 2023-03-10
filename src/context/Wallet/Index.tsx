import React from 'react'
import { LoadWalletOptionsType } from '../contextType'


export const Wallet = React.createContext({
    isLogged: false,
    isLoading: false,
    wallet: '',
    api: {},
    walletIndex: 0,
    networkIndex: 0,
    accounts: [],
    accountsActive: {},
    activeAccount: '',
    balance: 0,
    message: '',
    multisig: false,
    multisigAddress: '',
    multisigID: '',
    sign: async () => { },
    getAccounts: async (nStart?: number) => { },
    importSeed: async (seedphrase: string) => { },
    selectNetwork: async (network: number) => { },
    selectAccount: async (index: number) => { },
    loadWallet: async (type: string, options?: LoadWalletOptionsType) => { return false },
    dispatchNotification: (message: string) => { }
})