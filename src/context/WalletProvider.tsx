import React from 'react'
import { Wallet } from './Index'
import { LedgerWallet } from './LedgerWallet'
import { BurnerWallet } from './BurnerWallet'

interface WalletProviderStates {
    isLogged: boolean
    isLoading: boolean
    wallet: string
    sign: any
    getAccounts: any
    balance: number
    message: string
}

export default class WalletProvider extends React.Component<{}, WalletProviderStates> {
    loadLedger = async () => {
        const wallet = new LedgerWallet()
        await wallet.loadWallet()
        this.setState({
            wallet: 'ledger',
            sign: wallet.sign,
            getAccounts: wallet.getAccounts
        })
    }

    loadBurner = async () => {
        const wallet = new BurnerWallet()
        await wallet.loadWallet()
        this.setState({
            wallet: 'burner',
            sign: wallet.sign,
            getAccounts: wallet.getAccounts
        })
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
        this.loadBurner()
    }

    render() {
        return (
            <Wallet.Provider value={this.state}>
                {this.props.children}
            </Wallet.Provider>
        )
    }
}