import React from 'react'
import { Wallet } from './Index'

interface WalletProviderStates {
    isLogged: boolean
    isLoading: boolean
    wallet: string
    sign(): Promise<any>
    getAccounts(): Promise<any>
    balance: number
    message: string
}

export default class WalletProvider extends React.Component<{}, WalletProviderStates> {
    loadLedger = async () => {
       console.log('load Ledger')
    }

    loadBurner = async () => {
        console.log('load Burner')
    }

    state = {
        isLogged: false,
        isLoading: false,
        wallet: '',
        sign: async () => {},
        getAccounts: async () => {},
        balance: 0,
        message: ''
    }

    async componentDidMount() {
        await this.init()
    }

    init = async () => {
        const presetWallet = localStorage.getItem('presetWallet')
        switch (presetWallet) {
            case 'Ledger':
               this.loadLedger()
                break
            case 'Burner':
                this.loadBurner()
                break
        }
    }

    render() {
        return (
            <Wallet.Provider value={this.state}>
                {this.props.children}
            </Wallet.Provider>
        )
    }
}