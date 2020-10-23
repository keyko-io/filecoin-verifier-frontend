import React from 'react'
import { Wallet } from './Index'
import { LedgerWallet } from './LedgerWallet'
import { BurnerWallet } from './BurnerWallet'
// @ts-ignore
import { dispatchCustomEvent } from "slate-react-system";
import { Octokit } from '@octokit/rest'
import { IssueBody, IssueVerifierBody } from '../IssueBody'
import { config } from '../config';
const utils = require('@keyko-io/filecoin-verifier-tools/utils/issue-parser')

interface WalletProviderStates {
    isLogged: boolean
    isLoading: boolean
    githubLogged: boolean
    githubOcto: any
    loginGithub: any
    initGithubOcto: any
    loadClientRequests: any
    clientRequests: any[]
    loadVerifierRequests: any
    verifierRequests: any[]
    createRequest: any
    clientsGithub: any
    loadClientsGithub: any
    viewroot: boolean
    switchview: any
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
    verified: any[]
    loadVerified: any,
    balance: number
    message: string
    dispatchNotification: any
}

async function getActiveAccounts  (api: any, accounts: any) {
    const accountsActive: any = {};
    for(const acc of accounts){
        try {
            const key = await api.actorAddress(acc)
            accountsActive[acc] = key
        } catch (e) {

        }
    }
    return accountsActive
}

export default class WalletProvider extends React.Component<{}, WalletProviderStates> {
    setStateAsync(state:any) {
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
            this.loadGithub()
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
        this.loadGithub()
        return true
    }

    state = {
        isLogged: false,
        isLoading: false,
        githubLogged: false,
        githubOcto: {} as any,
        loginGithub: async (code:string) => {
            try {
                const authrequest = await fetch(config.apiUri+'/api/v1/github', {
                    method: 'POST',
                    headers: {
                      'Accept': 'application/json',
                      'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                      code
                    })
                })
                const authjson = await authrequest.json()
                localStorage.setItem('githubToken', authjson.data.access_token)
                this.state.initGithubOcto(authjson.data.access_token)
            } catch (e) {
                this.state.dispatchNotification('Failed to login. Try again later.')
            }
        },
        initGithubOcto: async (token:string) => {
            const octokit = new Octokit({
                auth: token
            })
            this.setState({
                githubLogged: true,
                githubOcto: octokit
            }, ()=>{
                this.state.loadClientRequests()
                this.state.loadClientsGithub()
                this.state.loadVerified()
                this.state.loadVerifierRequests()
            })
        },
        loadClientRequests: async () => {
            const rawIssues = await this.state.githubOcto.issues.listForRepo({
              owner: 'keyko-io',
              repo: 'filecoin-clients-onboarding'
            })
            const issues: any[] = []
            for(const rawIssue of rawIssues.data){
                const data = utils.parseIssue(rawIssue.body)
                if(data.correct){
                    issues.push({
                        number: rawIssue.number,
                        url: rawIssue.html_url,
                        data
                    })
                }
            }
            this.setState({
                clientRequests: issues
            })
        },
        clientRequests: [],
        loadVerifierRequests: async () => {
            const rawIssues = await this.state.githubOcto.issues.listForRepo({
              owner: 'keyko-io',
              repo: 'filecoin-notaries-onboarding'
            })
            const issues: any[] = []
            for(const rawIssue of rawIssues.data){
                const data = utils.parseIssue(rawIssue.body)
                if(data.correct){
                    issues.push({
                        number: rawIssue.number,
                        url: rawIssue.html_url,
                        data
                    })
                }
            }
            this.setState({
                verifierRequests: issues
            })
        },
        verifierRequests: [],
        createRequest: async (data:any) => {
            try {
                const issue = await this.state.githubOcto.issues.create({
                    owner: 'keyko-io',
                    repo: 'filecoin-clients-onboarding',
                    title: 'Data Cap Request for: '+data.organization,
                    body: IssueBody(data)
                });
                if(issue.status === 201){
                    this.state.dispatchNotification('Request submited as #'+issue.data.number)
                    this.state.loadClientRequests()
                }else{
                    this.state.dispatchNotification('Something went wrong.')
                }
            } catch (error) {
                this.state.dispatchNotification(error.toString())
            }
        },
        clientsGithub: {},
        loadClientsGithub: async () => {
            const rawIssues = await this.state.githubOcto.issues.listForRepo({
                owner: 'keyko-io',
                repo: 'filecoin-clients-onboarding',
                state: 'closed',
                labels: 'state:Granted'
              })
            const issues: any = {}
            for(const rawIssue of rawIssues.data){
                const data = utils.parseIssue(rawIssue.body)
                try {
                    const address = await this.state.api.actorKey(data.address)
                    if(data.correct && address){
                        issues[address]= {
                            number: rawIssue.number,
                            url: rawIssue.html_url,
                            data
                        }
                    }
                } catch(e) {
                    // console.log(e)
                }
            }
            this.setState({
                clientsGithub: issues
            })
        },
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
        networkIndex: 0,
        verified: [],
        loadVerified: async () => {
            const approvedVerifiers = await this.state.api.listVerifiers()
            let verified = []
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
        accountsActive: {},
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
                    return this.loadLedger()
                case 'Burner':
                    return this.loadBurner()
            }
        }
    }

    loadGithub () {
        const githubToken = localStorage.getItem('githubToken')!
        if(githubToken && this.state.isLogged){
            this.state.initGithubOcto(githubToken)
        }
    }

    async componentDidMount() {
        this.loadGithub()
    }

    render() {
        return (
            <Wallet.Provider value={this.state}>
                {this.props.children}
            </Wallet.Provider>
        )
    }
}