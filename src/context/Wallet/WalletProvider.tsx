import React from 'react'
import { Wallet } from './Index'
import { LedgerWallet } from './LedgerWallet'
import { BurnerWallet } from './BurnerWallet'
// @ts-ignore
import { dispatchCustomEvent } from "slate-react-system";
import { config } from '../../config';
import { withCookies, Cookies } from 'react-cookie'


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
    multisig: boolean
    multisigAddress: string
    multisigID: string
}

type Props = {
    cookies: Cookies
}

async function getActiveAccounts(api: any, accounts: any) {
    const accountsActive: any = {};
    await Promise.allSettled(
        accounts.map(
            (acc: any) => new Promise<any>(async (resolve, reject) => {
                try {
                    const key = await api.actorAddress(acc)
                    accountsActive[acc] = key
                    resolve(key)
                } catch (error) {
                    reject(error)
                }
            })
        )
    )
    return accountsActive
}

class WalletProvider extends React.Component<Props, WalletProviderStates> {
    setStateAsync(state: any) {
        return new Promise((resolve: any) => {
            this.setState(state, resolve)
        });
    }
    loadLedger = async (options: any = {}) => {
        try {
            const wallet = new LedgerWallet()
            await wallet.loadWallet(this.state.networkIndex)
            const accounts: any = await wallet.getAccounts()
            const accountsActive = await getActiveAccounts(wallet.api, accounts)
            const { cookies } = this.props;
            const walletCookie = cookies.get('wallet')
            let lastWallet
            let walletIndex = - 1
            if (walletCookie) {
                for (let index = 0; index < accounts.length; index++) {
                    if (accounts[index] === walletCookie) {
                        lastWallet = accounts[index]
                        walletIndex = index
                        break;
                    }
                }
            }
            let multisigInfo: any = {}
            let multisigID: string = ''
            if (options.multisig) {
                try {
                    if (options.multisigAddress.length > 20) {
                        multisigID = await wallet.api.actorAddress(options.multisigAddress)
                    } else {
                        multisigID = options.multisigAddress
                    }
                    multisigInfo = await wallet.api.multisigInfo(multisigID)
                    // select account if found
                    const multisigActors: any[] = []
                    for (let index = 0; index < multisigInfo.signers.length; index++) {
                        const actor = await wallet.api.actorKey(multisigInfo.signers[index])
                        multisigActors.push(actor)
                    }
                    const index = accounts.findIndex((account: any) => multisigActors.includes(account))
                    if (index !== -1) {
                        lastWallet = accounts[index]
                        walletIndex = index
                    } else {
                        this.state.dispatchNotification('Multisig address not found in wallet')
                        return false
                    }
                } catch (e: any) {
                    this.state.dispatchNotification('Multisig not found')
                    return false
                }
            }
            await this.setStateAsync({
                isLogged: true,
                isLoading: false,
                wallet: 'ledger',
                api: wallet.api,
                walletIndex: walletIndex !== -1 ? walletIndex : 0,
                sign: async (param1: any, param2: any) => {
                    try {
                        const ret = await wallet.sign(param1, param2)
                        return ret
                    } catch (e: any) {
                        this.state.dispatchNotification(e.toString())
                    }
                },
                getAccounts: async () => {
                    try {
                        const accounts = await wallet.getAccounts()
                        return accounts
                    } catch (e: any) {
                        this.state.dispatchNotification(e.toString())
                    }
                },
                activeAccount: lastWallet ? lastWallet : accounts[0],
                accounts,
                accountsActive,
                multisig: options.multisig ? true : false,
                multisigAddress: options.multisig ? options.multisigAddress : '',
                multisigID: multisigID
            })
            // this.loadGithub()
            return true
        } catch (e: any) {
            this.setState({
                isLogged: false,
                isLoading: false
            })
            this.state.dispatchNotification('Ledger ' + e.toString())
            return false
        }
    }

    loadBurner = async (options: any = {}) => {
        try {
            const wallet = new BurnerWallet()
            await wallet.loadWallet(this.state.networkIndex)
            const accounts: any[] = await wallet.getAccounts()
            const accountsActive = await getActiveAccounts(wallet.api, accounts)
            const { cookies } = this.props;
            const walletCookie = cookies.get('wallet')
            let lastWallet
            let walletIndex = - 1
            if (walletCookie) {
                for (let index = 0; index < accounts.length; index++) {
                    if (accounts[index] === walletCookie) {
                        lastWallet = accounts[index]
                        walletIndex = index
                        break;
                    }
                }
            }
            let multisigInfo: any = {}
            let multisigID: string = ''
            if (options.multisig) {
                try {
                    if (options.multisigAddress.length > 20) {
                        multisigID = await wallet.api.actorAddress(options.multisigAddress)
                    } else {
                        multisigID = options.multisigAddress
                    }
                    multisigInfo = await wallet.api.multisigInfo(multisigID)
                    // select account if found
                    const multisigActors: any[] = []
                    for (let index = 0; index < multisigInfo.signers.length; index++) {
                        const actor = await wallet.api.actorKey(multisigInfo.signers[index])
                        multisigActors.push(actor)
                    }
                    const index = accounts.findIndex((account) => multisigActors.includes(account))
                    if (index !== -1) {
                        lastWallet = accounts[index]
                        walletIndex = index
                    } else {
                        this.state.dispatchNotification('Multisig address not found in wallet')
                        return false
                    }
                } catch (e: any) {
                    this.state.dispatchNotification('Multisig not found')
                    return false
                }
            }
            this.setStateAsync({
                isLogged: true,
                isLoading: false,
                wallet: 'burner',
                api: wallet.api,
                sign: wallet.sign,
                getAccounts: wallet.getAccounts,
                walletIndex: walletIndex !== -1 ? walletIndex : 0,
                activeAccount: lastWallet ? lastWallet : accounts[0],
                accounts,
                accountsActive,
                multisig: options.multisig ? true : false,
                multisigAddress: options.multisig ? options.multisigAddress : '',
                multisigID: multisigID
            })
            return true
        } catch (e: any) {
            return false
        }
    }



    initNetworkIndex = () => {

        const activeIndex = config.lotusNodes
            .map((node: any, index: number) => { return { name: node.name, index: index } })
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
            try {
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
            } catch (error) {
                console.log(error)
            }
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
                const { cookies } = this.props;

                cookies.set('wallet', accounts[index], { path: '/' });
            } catch (e: any) {
                // console.log('select account', e)
            }
        },
        balance: 0,
        message: '',
        loadWallet: async (type: string, options: any = {}) => {
            this.setState({ isLoading: true })
            switch (type) {
                case 'Ledger':
                    const resLedger = await this.loadLedger(options)
                    return resLedger
                case 'Burner':
                    const resBurner = await this.loadBurner(options)
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
        },
        multisig: false,
        multisigAddress: '',
        multisigActor: '',
        multisigID: ''
    }

    render() {
        return (
            <Wallet.Provider value={this.state}>
                {this.props.children}
            </Wallet.Provider>
        )
    }
}

export default withCookies(WalletProvider)