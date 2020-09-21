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
    verified: any[]
    loadVerified: any,
    balance: number
    message: string
    dispatchNotification: any
}

export default class WalletProvider extends React.Component<{}, WalletProviderStates> {
    loadLedger = async () => {
        try {
            const wallet = new LedgerWallet()
            await wallet.loadWallet(this.state.networkIndex)
            const accounts: any[] = await wallet.getAccounts()
            this.setState({
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
                accounts
            })
        } catch (e) {
            this.setState({
                isLogged: false,
                isLoading: false
            })
            this.state.dispatchNotification('Ledger ' + e.toString())
        }
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
        api: {} as any,
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
        verified: [],
        loadVerified: async () => {
            const approvedVerifiers = await this.state.api.listVerifiers()
            const verified = []
            for(const verifiedAddress of approvedVerifiers){
                const verifierAccount = await this.state.api.actorKey(verifiedAddress.verifier)
                verified.push({
                    verifier: verifiedAddress.verifier,
                    verifierAccount,
                    datacap: verifiedAddress.datacap
                })
            }
            this.setState({verified})
        },
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
        selectNetwork: async (networkIndex: number) => {
            this.setState({ networkIndex }, async()=>{
                switch (this.state.wallet) {
                    case 'ledger':
                        this.loadLedger()
                        break
                    case 'burner':
                        this.loadBurner()
                        break
                }
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