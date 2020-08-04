import React from 'react'
import { Wallet } from './Index'
import { LedgerWallet } from './LedgerWallet'
import { BurnerWallet } from './BurnerWallet'
// @ts-ignore
import { dispatchCustomEvent } from "slate-react-system";

interface WalletProviderStates {
    isLogged: boolean
    isLoading: boolean
    wallet: string
    api: any
    sign: any
    getAccounts: any
    api2: any
    sign2: any
    getAccounts2: any
    balance: number
    message: string
    dispatchNotification: any
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
            isLogged: true,
            wallet: 'burner',
            api: wallet.api,
            sign: wallet.sign,
            getAccounts: wallet.getAccounts,
            api2: wallet.api2,
            sign2: wallet.sign2,
            getAccounts2: wallet.getAccounts2
        })
    }

    state = {
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
        message: '',
        dispatchNotification: (message: string) => {
            dispatchCustomEvent({ name: "create-notification", detail: {
                id: Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 5),
                description: message,
                dark: true,
                timeout: 5000
            }});
        }
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

    dispatchNotification = (message: string) => {
        dispatchCustomEvent({ name: "create-notification", detail: {
            id: Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 5),
            description: message,
            dark: true,
            timeout: 5000
        }});
    }

    render() {
        return (
            <Wallet.Provider value={this.state}>
                {this.props.children}
            </Wallet.Provider>
        )
    }
}