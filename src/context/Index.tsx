import React from 'react'

export const Wallet = React.createContext({
    isLogged: false,
    isLoading: false,
    viewroot: false,
    switchview: async () => {},
    wallet: '',
    api: {},
    sign: async () => {},
    getAccounts: async () => {},
    walletIndex: 0,
    networkIndex: 0,
    activeAccount: '',
    accounts: [],
    accountsActive: {},
    verified: [],
    loadVerified: async () => {},
    importSeed: async (seedphrase: string) => {},
    selectNetwork: async (network: any) => {},
    selectAccount: async (account: any) => {},
    balance: 0,
    message: '',
    dispatchNotification: (message: string) => {}
})