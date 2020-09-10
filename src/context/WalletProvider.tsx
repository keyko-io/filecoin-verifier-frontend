import React from 'react'
import { Wallet } from './Index'
import { LedgerWallet } from './LedgerWallet'
import { BurnerWallet } from './BurnerWallet'
// @ts-ignore
import { dispatchCustomEvent } from "slate-react-system";

interface WalletProviderStates {
    isLogged: boolean
    isLoading: boolean
    viewroot: boolean
    switchview: any
    wallet: string
    api: any
    sign: any
    getAccounts: any
    walletIndex: number
    networkIndex: number
    accounts: any[]
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
        await wallet.loadWallet(this.state.networkIndex)
        const accounts: any[] = await wallet.getAccounts()
        this.setState({
            isLogged: true,
            isLoading: false,
            wallet: 'ledger',
            api: wallet.api,
            sign: wallet.sign,
            getAccounts: wallet.getAccounts,
            activeAccount: accounts[0],
            accounts
        })
    }

    loadBurner = async () => {
        const wallet = new BurnerWallet()
        await wallet.loadWallet(this.state.networkIndex)
        const accounts: any[] = await wallet.getAccounts()
        this.setState({
            isLogged: true,
            isLoading: false,
            wallet: 'burner',
            api: wallet.api,
            sign: wallet.sign,
            getAccounts: wallet.getAccounts,
            activeAccount: accounts[0],
            accounts
        })
    }

    state = {
        isLogged: false,
        isLoading: false,
        viewroot: false,
        switchview: async () => {
            if(this.state.viewroot){
                this.setState({ viewroot: false })
            } else {
                this.setState({ viewroot: true })
            }
        },
        wallet: '',
        api: {},
        sign: async () => {},
        getAccounts: async () => {},
        walletIndex: 0,
        importSeed: async (seedphrase: string) => {
            const wallet = new BurnerWallet()
            await wallet.loadWallet(this.state.networkIndex)
            await wallet.importSeed(seedphrase)
            const accounts: any[] = await wallet.getAccounts()
            this.setState({
                isLogged: true,
                wallet: 'burner',
                api: wallet.api,
                sign: wallet.sign,
                getAccounts: wallet.getAccounts,
                activeAccount: accounts[this.state.walletIndex],
                accounts
            })
        },
        networkIndex: 0,
        activeAccount: '',
        accounts: [],
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
                    accounts
                })
            })
        },
        loadWallet: async (type:string) => {
            this.setState({isLoading:true})
            switch (type) {
                case 'Ledger':
                   this.loadLedger()
                    break
                case 'Burner':
                    this.loadBurner()
                    break
            }
        }
    }

    async componentDidMount() {

    }

    render() {
        return (
            <Wallet.Provider value={this.state}>
                {this.props.children}
            </Wallet.Provider>
        )
    }
}