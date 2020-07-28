import React from 'react'
import { Wallet } from './Index'
import { LedgerWallet } from './LedgerWallet'
import { BurnerWallet } from './BurnerWallet'

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
        console.log('load leger start')
        const wallet = new LedgerWallet()
        console.log('load Ledger', wallet.loadWallet())
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
        // TODO: remove
        this.loadLedger()
    }

    render() {
        return (
            <Wallet.Provider value={this.state}>
                {this.props.children}
            </Wallet.Provider>
        )
    }
}