import React from 'react'

export const Wallet = React.createContext({
    isLogged: false,
    isLoading: false,
    wallet: '',
    api: {},
    sign: async () => {},
    getAccounts: async () => {},
    api2: {},
    sign2: async () => {},
    getAccounts2: async () => {},
    balance: 0,
    message: ''
})