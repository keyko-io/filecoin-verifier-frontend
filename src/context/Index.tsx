import React from 'react'

export const Wallet = React.createContext({
    isLogged: false,
    isLoading: false,
    wallet: '',
    sign: async () => {},
    getAccounts: async () => {},
    balance: 0,
    message: ''
})