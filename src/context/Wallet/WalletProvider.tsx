import React from 'react'
import { Wallet } from './Index'
import { LedgerWallet } from './LedgerWallet'
import { BurnerWallet } from './BurnerWallet'
// @ts-ignore
import { dispatchCustomEvent } from "slate-react-system";
import { config } from '../../config';

interface WalletProviderStates {
    isLogged: boolean
    isLoading: boolean
    wallet: string
    api: any
    sign: any
    getAccounts: any
    walletIndex: number
    networkIndex: number
    accounts: any[]
    accountsActive: any
    activeAccount: string
    importSeed: any
    selectNetwork: any
    selectAccount: any
    balance: number
    message: string
    loadWallet: any
    dispatchNotification: any
}

async function getActiveAccounts(api: any, accounts: any) {
    const accountsActive: any = {};
    for (const acc of accounts) {
        try {
            const key = await api.actorAddress(acc)
            accountsActive[acc] = key
        } catch (e) {

        }
    }
    return accountsActive
}

export default class WalletProvider extends React.Component<{}, WalletProviderStates> {
    setStateAsync(state: any) {
        return new Promise((resolve) => {
            this.setState(state, resolve)
        });
    }
    loadLedger = async () => {
        try {
            const wallet = new LedgerWallet()
            await wallet.loadWallet(this.state.networkIndex)
            const accounts: any[] = await wallet.getAccounts()
            const accountsActive = await getActiveAccounts(wallet.api, accounts)
            await this.setStateAsync({
                isLogged: true,
                isLoading: false,
                wallet: 'ledger',
                api: wallet.api,
                sign: async (param1: any, param2: any) => {
                    try {
                        const ret = await wallet.sign(param1, param2)
                        return ret
                    } catch (e) {
                        this.state.dispatchNotification(e.toString())
                    }
                },
                getAccounts: async () => {
                    try {
                        const accounts = await wallet.getAccounts()
                        return accounts
                    } catch (e) {
                        this.state.dispatchNotification(e.toString())
                    }
                },
                activeAccount: accounts[0],
                accounts,
                accountsActive
            })
            // this.loadGithub()
            return true
        } catch (e) {
            this.setState({
                isLogged: false,
                isLoading: false
            })
            this.state.dispatchNotification('Ledger ' + e.toString())
            return false
        }
    }

    loadBurner = async () => {
        try {
            const wallet = new BurnerWallet()
            await wallet.loadWallet(this.state.networkIndex)
            const accounts: any[] = await wallet.getAccounts()
            const accountsActive = await getActiveAccounts(wallet.api, accounts)
            this.setStateAsync({
                isLogged: true,
                isLoading: false,
                wallet: 'burner',
                api: wallet.api,
                sign: wallet.sign,
                getAccounts: wallet.getAccounts,
                activeAccount: accounts[0],
                accounts,
                accountsActive
            })
            return true
            // this.loadGithub()
        } catch (e) {
            return false
        }
    }



    initNetworkIndex = () => {

    const activeIndex= config.lotusNodes
        .map((node: any, index: number) => {return {name: node.name, index:index}})
        .filter((node: any, index: number) => config.networks.includes(node.name))
       
    return activeIndex[0].index
    }

    state = {
        isLogged: false,
        isLoading: false,
        wallet: '',
        api: {} as any,
        sign: async () => { },
        getAccounts: async () => { },
        walletIndex: 0,
        networkIndex: this.initNetworkIndex(),
        accounts: [],
        accountsActive: {},
        activeAccount: '',
        importSeed: async (seedphrase: string) => {
            const wallet = new BurnerWallet()
            await wallet.loadWallet(this.state.networkIndex)
            await wallet.importSeed(seedphrase)
            const accounts: any[] = await wallet.getAccounts()
            const accountsActive = await getActiveAccounts(wallet.api, accounts)
            this.setState({
                isLogged: true,
                wallet: 'burner',
                api: wallet.api,
                sign: wallet.sign,
                getAccounts: wallet.getAccounts,
                activeAccount: accounts[this.state.walletIndex],
                accounts,
                accountsActive
            })
        },
        selectNetwork: async (networkIndex: number) => {
            this.setState({ networkIndex }, async () => {
                switch (this.state.wallet) {
                    case 'ledger':
                        return this.loadLedger()
                    case 'burner':
                        return this.loadBurner()
                }
            })
        },
        selectAccount: async (index: number) => {
            try {
                const accounts: any = await this.state.getAccounts()
                this.setState({
                    walletIndex: index,
                    activeAccount: accounts[index]
                })
            } catch (e) {
                // console.log('select account', e)
            }
        },
        balance: 0,
        message: '',
        loadWallet: async (type: string) => {
            this.setState({ isLoading: true })
            switch (type) {
                case 'Ledger':
                    const resLedger = await this.loadLedger()
                    return resLedger
                case 'Burner':
                    const resBurner = await this.loadBurner()
                    return resBurner
                default:
                    return false
            }
        },
        dispatchNotification: (message: string) => {
            dispatchCustomEvent({
                name: "create-notification", detail: {
                    id: Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 5),
                    description: message,
                    dark: true,
                    timeout: 5000
                }
            });
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