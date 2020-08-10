import React from 'react'

export const Wallet = React.createContext({
    isLogged: false,
    isLoading: false,
    wallet: '',
    api: {},
    sign: async () => {},
    getAccounts: async () => {},
    walletIndex: 0,
    activeAccount: '',
    importSeed: async (seedphrase: string) => {},
    balance: 0,
    message: '',
    dispatchNotification: (message: string) => {}
})