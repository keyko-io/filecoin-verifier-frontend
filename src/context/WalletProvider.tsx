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
    walletIndex: number
    networkIndex: number
    activeAccount: string
    importSeed: any
    selectNetwork: any
    balance: number
    message: string
    dispatchNotification: any
}

export default class WalletProvider extends React.Component<{}, WalletProviderStates> {
    loadLedger = async () => {
        const wallet = new LedgerWallet()
        await wallet.loadWallet()
        const accounts: any[] = await wallet.getAccounts()
        this.setState({
            wallet: 'ledger',
            sign: wallet.sign,
            getAccounts: wallet.getAccounts,
            activeAccount: accounts[0]
        })
    }

    loadBurner = async () => {
        const wallet = new BurnerWallet()
        await wallet.loadWallet(this.state.networkIndex)
        const accounts: any[] = await wallet.getAccounts()
        this.setState({
            isLogged: true,
            wallet: 'burner',
            api: wallet.api,
            sign: wallet.sign,
            getAccounts: wallet.getAccounts,
            activeAccount: accounts[0],
            importSeed: wallet.importSeed
        })
    }

    state = {
        isLogged: false,
        isLoading: false,
        wallet: '',
        api: {},
        sign: async () => {},
        getAccounts: async () => {},
        walletIndex: 0,
        importSeed: async (seedphrase: string) => {},
        networkIndex: 0,
        activeAccount: '',
        balance: 0,
        message: '',
        dispatchNotification: (message: string) => {
            dispatchCustomEvent({ name: "create-notification", detail: {
                id: Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 5),
                description: message,
                dark: true,
                timeout: 5000
            }});
        },
        selectAccount: async (index: number) => {
            const accounts: any = await this.state.getAccounts()
            this.setState({
                walletIndex: index,
                activeAccount: accounts[index]
            })
        },
        selectNetwork: async (networkIndex: number) => {
            this.setState({ networkIndex }, async()=>{
                const wallet = new BurnerWallet()
                await wallet.loadWallet(networkIndex)
                const accounts: any[] = await wallet.getAccounts()
                this.setState({
                    isLogged: true,
                    wallet: 'burner',
                    api: wallet.api,
                    sign: wallet.sign,
                    getAccounts: wallet.getAccounts,
                    activeAccount: accounts[this.state.walletIndex],
                    importSeed: wallet.importSeed
                })
            })
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

    render() {
        return (
            <Wallet.Provider value={this.state}>
                {this.props.children}
            </Wallet.Provider>
        )
    }
}