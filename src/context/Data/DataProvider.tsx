import React from 'react'
import { Data } from './Index'
import { config } from '../../config';
// @ts-ignore
import { IssueBody } from '../../utils/IssueBody'
import { datacapFilter, BtoiB } from '../../utils/Filters'
import BigNumber from 'bignumber.js'
const utils = require('@keyko-io/filecoin-verifier-tools/utils/issue-parser')
const parser = require('@keyko-io/filecoin-verifier-tools/utils/notary-issue-parser')

interface DataProviderStates {
    loadClientRequests: any
    clientRequests: any[]
    loadNotificationClientRequests: any
    notificationClientRequests: any[]
    loadVerifierRequests: any
    verifierRequests: any[]
    loadNotificationVerifierRequests: any
    notificationVerifierRequests: any[]
    viewroot: boolean
    switchview: any
    verified: any[]
    loadVerified: any,
    updateGithubVerified: any
    createRequest: any
    selectedNotaryRequests: any[]
    selectNotaryRequest: any
    clientsGithub: any
    loadClientsGithub: any
    loadClients: any
    clients: any[]
    clientsAmount: string,
    clientsAmountConverted: string
    loadPendingVerifiers: any
    pendingVerifiers: any[]
    search: any
    refreshGithubData: any
}

interface DataProviderProps {
    github: any
    wallet: any
    children: any
}

export default class DataProvider extends React.Component<DataProviderProps, DataProviderStates> {
    constructor(props: DataProviderProps) {
        super(props);
        this.state = {
            loadClientRequests: async () => {
                if (this.props.github.githubLogged === false) {
                    this.setState({ clientRequests: [] })
                    return
                }
                const user = await this.props.github.githubOcto.users.getAuthenticated();
                const rawIssues = await this.props.github.githubOcto.issues.listForRepo({
                    owner: config.onboardingOwner,
                    repo: config.onboardingClientRepo,
                    assignee: user.data.login,
                    state: 'open',
                    labels: 'state:Verifying'
                })
                const issues: any[] = []
                for (const rawIssue of rawIssues.data) {
                    const data = utils.parseIssue(rawIssue.body)
                    if (data.correct) {
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
            loadNotificationClientRequests: async () => {
                if(this.props.github.githubLogged === false){
                    this.setState({clientRequests: []})
                    return
                }
                const rawIssues = await this.props.github.githubOcto.issues.listForRepo({
                    owner: config.onboardingOwner,
                    repo: config.onboardingClientRepo,
                    state: 'open'
                })
                const issues: any[] = []
                for (const rawIssue of rawIssues.data) {
                    try {
                        const rawComments = await this.props.github.githubOcto.issues.listComments({
                            owner: config.onboardingOwner,
                            repo: config.onboardingClientRepo,
                            issue_number: rawIssue.number,
                        })
                        if(
                            rawComments.data.length > 0 && (
                                rawComments.data[rawComments.data.length-1].user.login.endsWith("[bot]") === false &&
                                rawComments.data[rawComments.data.length-1].user.login !== rawIssue.assignee.login
                            )
                        ){
                            issues.push({
                                number: rawIssue.number,
                                url: rawIssue.html_url
                            })
                        }
                    } catch (e) {
                        // console.log(e)
                    }
                }
                this.setState({
                    notificationClientRequests: issues
                })
            },
            notificationClientRequests: [],
            loadVerifierRequests: async () => {
                if (this.props.github.githubOctoGeneric.logged === false) {
                    await this.props.github.githubOctoGenericLogin()
                }
                const rawIssues = await this.props.github.githubOctoGeneric.octokit.issues.listForRepo({
                    owner: config.lotusNodes[this.props.wallet.networkIndex].notaryOwner,
                    repo: config.lotusNodes[this.props.wallet.networkIndex].notaryRepo,
                    state: 'open',
                    labels: 'status:Approved'
                })
                const issues: any[] = []
                for (const rawIssue of rawIssues.data) {
                    const data = parser.parseIssue(rawIssue.body, rawIssue.title)
                    if (data.correct) {

                        // get comments
                        const rawComments = await this.props.github.githubOctoGeneric.octokit.issues.listComments({
                            owner: config.lotusNodes[this.props.wallet.networkIndex].notaryOwner,
                            repo: config.lotusNodes[this.props.wallet.networkIndex].notaryRepo,
                            issue_number: rawIssue.number,
                        });
                        for (const rawComment of rawComments.data) {
                            const comment = parser.parseApproveComment(rawComment.body)
                            if (comment.approvedMessage && comment.correct) {
                                issues.push({
                                    number: rawIssue.number,
                                    url: rawIssue.html_url,
                                    address: comment.address,
                                    datacap: comment.datacap,
                                    data
                                })
                                break
                            }
                        }
                    }
                }
                this.setState({
                    verifierRequests: issues
                })
            },
            verifierRequests: [],
            loadNotificationVerifierRequests: async () => {
                if (this.props.github.githubOctoGeneric.logged === false) {
                    await this.props.github.githubOctoGenericLogin()
                }
                const rawIssues = await this.props.github.githubOctoGeneric.octokit.issues.listForRepo({
                    owner: config.lotusNodes[this.props.wallet.networkIndex].notaryOwner,
                    repo: config.lotusNodes[this.props.wallet.networkIndex].notaryRepo,
                    state: 'open'
                })
                const issues: any[] = []
                for (const rawIssue of rawIssues.data) {
                    try {
                        const rawComments = await this.props.github.githubOctoGeneric.octokit.issues.listComments({
                            owner: config.lotusNodes[this.props.wallet.networkIndex].notaryOwner,
                            repo: config.lotusNodes[this.props.wallet.networkIndex].notaryRepo,
                            issue_number: rawIssue.number,
                        })
                        if(
                            rawComments.data.length > 0 && (
                                rawComments.data[rawComments.data.length-1].user.login.endsWith("[bot]") === false &&
                                rawComments.data[rawComments.data.length-1].user.login !== rawIssue.assignee.login
                            )
                        ){
                            issues.push({
                                number: rawIssue.number,
                                url: rawIssue.html_url
                            })
                        }
                    } catch (e) {
                        // console.log(e)
                    }
                }
                this.setState({
                    notificationVerifierRequests: issues
                })
            },
            notificationVerifierRequests: [],
            viewroot: false,
            switchview: async () => {
                if (this.state.viewroot) {
                    this.setState({ viewroot: false })
                } else {
                    this.setState({ viewroot: true })
                }
            },
            verified: [],
            loadVerified: async () => {
                const approvedVerifiers = await this.props.wallet.api.listVerifiers()
                let verified = []
                for (const verifiedAddress of approvedVerifiers) {
                    const verifierAccount = await this.props.wallet.api.actorKey(verifiedAddress.verifier)
                    verified.push({
                        verifier: verifiedAddress.verifier,
                        verifierAccount,
                        datacap: verifiedAddress.datacap,
                        datacapConverted: BtoiB(new BigNumber(verifiedAddress.datacap)).toString()
                    })
                }
                this.setState({ verified })
            },
            loadClients: async () => {
                const clients = await this.props.wallet.api.listVerifiedClients()
                let clientsamount = new BigNumber(0)
                let clientsamountconverted = new BigNumber(0)
                for (const txs of clients) {
                    const amountBN = new BigNumber(txs.datacap)
                    clientsamount = amountBN.plus(clientsamount)
                    clientsamountconverted = BtoiB(amountBN).plus(clientsamountconverted)
                    txs['key'] = await this.props.wallet.api.actorKey(txs.verified)
                    txs['datacapConverted'] = BtoiB(amountBN).toString()
                    
                }
                this.setState({clients, clientsAmount: clientsamount.toString(), clientsAmountConverted: clientsamountconverted.toString()})
            },
            loadPendingVerifiers: async () => {
                // pending verififers
                let pendingTxs = await this.props.wallet.api.pendingRootTransactions()
                let pendingVerifiers: any[] = []
                for (let txs in pendingTxs) {
                    if (pendingTxs[txs].parsed.name !== 'addVerifier') {
                        continue
                    }
                    const verifierAccount = await this.props.wallet.api.actorKey(pendingTxs[txs].parsed.params.verifier)
                    const signerAccount = await this.props.wallet.api.actorKey(pendingTxs[txs].signers[0])
                    pendingVerifiers.push({
                        id: pendingTxs[txs].id,
                        type: pendingTxs[txs].parsed.params.cap.toString() === '0' ? 'Revoke' : 'Add',
                        verifier: pendingTxs[txs].parsed.params.verifier,
                        verifierAccount,
                        datacap: pendingTxs[txs].parsed.params.cap.toString(),
                        datacapConverted: BtoiB(new BigNumber(pendingTxs[txs].parsed.params.cap.toString())).toString(),
                        signer: pendingTxs[txs].signers[0],
                        signerAccount: signerAccount
                    })
                }
                this.setState({pendingVerifiers})
            },
            updateGithubVerified: async (requestNumber: any, messageID: string, address: string, datacap: any) => {
                await this.props.github.githubOcto.issues.removeAllLabels({
                    owner: config.onboardingOwner,
                    repo: config.onboardingClientRepo,
                    issue_number: requestNumber,
                })
                await this.props.github.githubOcto.issues.addLabels({
                    owner: config.onboardingOwner,
                    repo: config.onboardingClientRepo,
                    issue_number: requestNumber,
                    labels: ['state:Granted'],
                })

                let commentContent = `## Request Approved\nYour Datacap Allocation Request has been approved by the Notary\n#### Message sent to Filecoin Network\n>${messageID} \n#### Address \n> ${address}\n#### Datacap Allocated\n> ${datacapFilter(String(datacap))}`

                await this.props.github.githubOcto.issues.createComment({
                    owner: config.onboardingOwner,
                    repo: config.onboardingClientRepo,
                    issue_number: requestNumber,
                    body: commentContent,
                })

                await this.props.github.githubOcto.issues.update({
                    owner: config.onboardingOwner,
                    repo: config.onboardingClientRepo,
                    issue_number: requestNumber,
                    state: 'closed',
                })
            },
            createRequest: async (data: any) => {
                try {
                    const issue = await this.props.github.githubOcto.issues.create({
                        owner: config.onboardingOwner,
                        repo: config.onboardingClientRepo,
                        title: 'Client Allocation Request for: ' + data.organization,
                        assignees: data.assignees,
                        body: IssueBody(data)
                    });
                    if (issue.status === 201) {
                        // this.state.dispatchNotification('Request submited as #' + issue.data.number)
                        this.state.loadClientRequests()
                        return issue.data.html_url
                    } else {
                        // this.state.dispatchNotification('Something went wrong.')
                    }
                } catch (error) {
                    if(error.errors[0].field ==='assignees' && error.errors[0].code==='invalid'){
                        console.log('There was an error on assign, trying with user...')
                        const issue = await this.props.github.githubOcto.issues.create({
                            owner: config.onboardingOwner,
                            repo: config.onboardingClientRepo,
                            title: 'Client Allocation Request for: ' + data.organization,
                            assignees: config.defaultAssign,
                            body: IssueBody(data)
                        });
                        if (issue.status === 201) {
                            // this.state.dispatchNotification('Request submited as #' + issue.data.number)
                            this.state.loadClientRequests()
                            return issue.data.html_url
                        }
                    }
                }
            },
            selectedNotaryRequests: [] as any[],
            selectNotaryRequest: async (number: any) => {
                let selectedTxs = this.state.selectedNotaryRequests
                if (selectedTxs.includes(number)) {
                    selectedTxs = selectedTxs.filter((item: number) => item !== number)
                } else {
                    selectedTxs.push(number)
                }
                this.setState({ selectedNotaryRequests: selectedTxs })
            },
            clients: [],
            clientsAmount: '',
            clientsAmountConverted: '',
            pendingVerifiers: [],
            clientsGithub: {},
            loadClientsGithub: async () => {
                if (this.props.github.githubLogged === false) {
                    this.setState({ clientsGithub: [] })
                    return
                }
                const rawIssues = await this.props.github.githubOcto.issues.listForRepo({
                    owner: config.onboardingOwner,
                    repo: config.onboardingClientRepo,
                    state: 'closed',
                    labels: 'state:Granted'
                })
                const issues: any = {}
                for (const rawIssue of rawIssues.data) {
                    const data = utils.parseIssue(rawIssue.body)
                    try {
                        const address = await this.props.wallet.api.actorKey(data.address)
                        if (data.correct && address) {
                            issues[address] = {
                                number: rawIssue.number,
                                url: rawIssue.html_url,
                                data
                            }
                        }
                    } catch (e) {
                        // console.log(e)
                    }
                }
                this.setState({
                    clientsGithub: issues
                })
            },
            search: async (query: string) => {
                
                let results: any[] = []
                if (this.state.viewroot) {
                    
                    if (this.props.github.githubOctoGeneric.logged === false) {
                        await this.props.github.githubOctoGenericLogin()
                    }

                    results = await this.props.github.githubOctoGeneric.octokit.search.issuesAndPullRequests({
                        q: `${query} in:body is:issue repo:${config.lotusNodes[this.props.wallet.networkIndex].notaryOwner}/${config.lotusNodes[this.props.wallet.networkIndex].notaryRepo}`
                    })
                } else {
                    if (this.props.github.githubLogged === false) {
                        console.log('not logged')
                        return
                    }
                    results = await this.props.github.githubOcto.search.issuesAndPullRequests({
                        q: `${query} in:body is:issue repo:${config.onboardingOwner}/${config.onboardingClientRepo}`
                    })
                }
                console.log('results', results)
                return results
            },
            refreshGithubData: async () => {
                this.state.loadClientRequests()
                this.state.loadNotificationClientRequests()
                this.state.loadClientsGithub()
                this.state.loadVerifierRequests()
                this.state.loadNotificationVerifierRequests()
            }
        }
    }

    render() {
        return (
            <Data.Provider value={{
                ...this.state,
                github: this.props.github,
                wallet: this.props.wallet
            }}>
                {this.props.children}
            </Data.Provider>
        )
    }
}