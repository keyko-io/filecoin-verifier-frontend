import React from 'react'
import { Data } from './Index'
import { config } from '../../config';
// @ts-ignore
import { IssueBody } from '../../utils/IssueBody'
import BigNumber from 'bignumber.js'
import { tableSort, tableSortLargeRequest, tableSortPublicRequest} from '../../utils/SortFilter';
import { v4 as uuidv4 } from 'uuid';
import { bytesToiB } from "../../utils/Filters"
import * as Sentry from "@sentry/react";
const utils = require('@keyko-io/filecoin-verifier-tools/utils/issue-parser')
const largeutils = require('@keyko-io/filecoin-verifier-tools/utils/large-issue-parser')
const parser = require('@keyko-io/filecoin-verifier-tools/utils/notary-issue-parser')

interface DataProviderStates {
    loadClientRequests: any
    clientRequests: any[]
    largeClientRequests: any[]
    loadNotificationClientRequests: any
    notificationClientRequests: any[]
    loadVerifierAndPendingRequests: any
    verifierAndPendingRequests: any[]
    loadNotificationVerifierRequests: any
    notificationVerifierRequests: any[]
    viewroot: boolean
    switchview: any
    verified: any[]
    loadVerified: any,
    updateGithubVerified: any
    updateGithubVerifiedLarge: any
    createRequest: any
    selectedNotaryRequests: any[]
    selectNotaryRequest: any
    clientsGithub: any
    loadClientsGithub: any
    loadClients: any
    sortClients: any
    sortLargeRequests: any
    sortPublicRequests: any
    sortVerified: any
    sortNotaryRequests: any
    assignToIssue: any
    clients: any[]
    clientsAmount: string
    search: any
    searchString: string
    refreshGithubData: any
    searchUserIssues: any,
    logToSentry: any
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
            logToSentry: (category: string, message: string, level: "info" | "error", data: any) => {
                let breadCrumb = {
                    category,
                    message,
                    level: level == "info" ? Sentry.Severity.Info : Sentry.Severity.Error,
                    data
                }
                Sentry.addBreadcrumb(breadCrumb);
                Sentry.captureMessage(breadCrumb.message)
            },
            loadClientRequests: async () => {
                if (this.props.github.githubLogged === false) {
                    this.setState({ clientRequests: [], largeClientRequests: [] })
                    return
                }
                const user = await this.props.github.githubOcto.users.getAuthenticated();
                const rawIssues = await this.props.github.githubOcto.issues.listForRepo({
                    owner: config.onboardingOwner,
                    repo: config.onboardingClientRepo,
                    assignee: '*',
                    state: 'open',
                    per_page: 100,
                    labels: 'state:Verifying'
                })
                const issues: any[] = []
                let pendingLarge: any[] = []
                if (this.props.wallet.multisigID) {
                    const pendingLargeTxs = await this.props.wallet.api.pendingTransactions(this.props.wallet.multisigID)
                    pendingLarge = await Promise.all(pendingLargeTxs.map(async (tx: any) => {
                        const address = await this.props.wallet.api.actorKey(tx.parsed.params.address)
                        return {
                            address,
                            tx
                        }
                    }))
                }
                for (const rawIssue of rawIssues.data) {
                    const data = utils.parseIssue(rawIssue.body)
                    if (data.correct && rawIssue.assignees.find((a: any) => a.login === user.data.login) !== undefined) {
                        issues.push({
                            number: rawIssue.number,
                            url: rawIssue.html_url,
                            owner: rawIssue.user.login,
                            data
                        })
                    }
                }
                const rawLargeIssues = await this.props.github.githubOcto.issues.listForRepo({
                    owner: config.onboardingLargeOwner,
                    repo: config.onboardingLargeClientRepo,
                    assignee: '*',
                    state: 'open',
                    labels: 'bot:readyToSign'
                })
                const largeissues: any[] = []
                for (const rawLargeIssue of rawLargeIssues.data) {
                    const data = largeutils.parseIssue(rawLargeIssue.body)
                    if (data.correct) {
                        try {
                            const rawLargeClientComments = await this.props.github.githubOcto.issues.listComments({
                                owner: config.onboardingLargeOwner,
                                repo: config.onboardingLargeClientRepo,
                                issue_number: rawLargeIssue.number,
                                per_page: 100
                            })
                            const comments = rawLargeClientComments.data.filter((comment: any) => {
                                const commentParsed = largeutils.parseReleaseRequest(comment.body)
                                return commentParsed.multisigMessage && commentParsed.correct && comment.performed_via_github_app == null
                            }
                            ).map((comment: any) => largeutils.parseReleaseRequest(comment.body))

                            const comment = comments[comments.length - 1]
                            const pendingLargeTxs = await this.props.wallet.api.pendingTransactions(comment.notaryAddress)
                            const txs = pendingLargeTxs.filter((pending: any) => pending.parsed.params.address === comment.clientAddress)
                            if (comment && comment.multisigMessage && comment.correct) {
                                let largeRequest: any = {
                                    issue_number: rawLargeIssue.number,
                                    issue_Url: rawLargeIssue.html_url,
                                    address: comment.clientAddress.trim(),
                                    multisig: comment.notaryAddress,
                                    datacap: comment.allocationDatacap,
                                    url: rawLargeIssue.html_url,
                                    number: rawLargeIssue.number,
                                    mine: rawLargeIssue.assignees.find((a: any) => a.login === user.data.login) !== undefined,
                                    approvals: txs.length > 0 ? txs[0].signers.length : 0,
                                    tx: txs.length > 0 ? txs[0] : null,
                                    data
                                }
                                largeissues.push(largeRequest)
                            }
                        } catch (e) {
                            console.log('error', e)
                        }
                    }
                }
                this.setState({
                    clientRequests: issues, largeClientRequests: largeissues
                })
            },
            searchUserIssues: async (user: string) => {
                await this.props.github.githubOctoGenericLogin()
                const rawIssues = await this.props.github.githubOcto.search.issuesAndPullRequests({
                    q: `type:issue+user:${user}+repo:${config.onboardingOwner}/${config.onboardingClientRepo}`
                })
                const issues: any[] = []
                for (const rawIssue of rawIssues.data.items) {
                    const data = utils.parseIssue(rawIssue.body)
                    if (data.correct) {
                        issues.push({
                            number: rawIssue.number,
                            url: rawIssue.html_url,
                            owner: rawIssue.user.login,
                            created_at: rawIssue.created_at,
                            state: rawIssue.state,
                            labels: rawIssue.labels,
                            data
                        })
                    }
                }
                return issues
            },
            clientRequests: [],
            largeClientRequests: [],
            loadNotificationClientRequests: async () => {
                if (this.props.github.githubLogged === false) {
                    this.setState({ clientRequests: [], largeClientRequests: [] })
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
                        if (
                            rawComments.data.length > 0 && (
                                rawComments.data[rawComments.data.length - 1].user.login.endsWith("[bot]") === false &&
                                rawComments.data[rawComments.data.length - 1].user.login !== rawIssue.assignee.login
                            )
                        ) {
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
            loadVerifierAndPendingRequests: async () => {
                if (this.props.github.githubOctoGeneric.logged === false) {
                    await this.props.github.githubOctoGenericLogin()
                }
                const issues: any[] = []
                let rawIssues: any[] = []
                // Get list of issues with label “Approve” (proposed=false) or “StartSignOnchain” (proposed=true).
                const SignOnChain = await this.props.github.githubOctoGeneric.octokit.issues.listForRepo({
                    owner: config.lotusNodes[this.props.wallet.networkIndex].notaryOwner,
                    repo: config.lotusNodes[this.props.wallet.networkIndex].notaryRepo,
                    state: 'open',
                    labels: ['status:StartSignOnchain']
                })
                rawIssues = rawIssues.concat(SignOnChain.data)
                const dataApproved = await this.props.github.githubOctoGeneric.octokit.issues.listForRepo({
                    owner: config.lotusNodes[this.props.wallet.networkIndex].notaryOwner,
                    repo: config.lotusNodes[this.props.wallet.networkIndex].notaryRepo,
                    state: 'open',
                    labels: ['status:Approved']
                })
                rawIssues = rawIssues.concat(dataApproved.data)
                // Get list of pending Transactions
                let pendingTxs = await this.props.wallet.api.pendingRootTransactions()

                let verifierAndPendingRequests: any[] = []
                let promArr = []
                for (let txs in pendingTxs) {
                    if (pendingTxs[txs].parsed.name !== 'addVerifier' && pendingTxs[txs].parsed.name !== 'removeVerifier') {
                        continue
                    }
                    promArr.push(new Promise<any>(async (resolve) => {


                        const verifierAddress = await this.props.wallet.api.actorKey(
                            pendingTxs[txs].parsed.name === 'removeVerifier' ?
                                pendingTxs[txs].parsed.params
                                :
                                pendingTxs[txs].parsed.params.verifier

                        )

                        const signerAddress = await this.props.wallet.api.actorKey(pendingTxs[txs].signers[0])
                        verifierAndPendingRequests.push({
                            id: pendingTxs[txs].id,
                            type: pendingTxs[txs].parsed.name === 'removeVerifier' ? 'Revoke' : pendingTxs[txs]?.parsed?.params?.cap?.toString() === '0' ? 'Revoke' : 'Add',
                            verifier: pendingTxs[txs].parsed.name === 'removeVerifier' ? pendingTxs[txs].parsed.params : pendingTxs[txs].parsed.params.verifier,
                            verifierAddress: verifierAddress,
                            datacap: pendingTxs[txs].parsed.name === 'removeVerifier' ? 0 : pendingTxs[txs].parsed.params.cap,
                            signer: pendingTxs[txs].signers[0],
                            signerAddress: signerAddress
                        })
                        resolve(verifierAndPendingRequests)
                    })
                    )
                }

                const promRes = await Promise.all(promArr)
                // console.log("res promise get verifierAndPendingRequests", promRes)

                // For each issue
                for (const rawIssue of rawIssues) {
                    const data = parser.parseIssue(rawIssue.body, rawIssue.title)
                    //if (data.correct !== true) continue
                    // get comments
                    const rawComments = await this.props.github.githubOctoGeneric.octokit.issues.listComments({
                        owner: config.lotusNodes[this.props.wallet.networkIndex].notaryOwner,
                        repo: config.lotusNodes[this.props.wallet.networkIndex].notaryRepo,
                        issue_number: rawIssue.number,
                    });
                    // loop over comments
                    for (const rawComment of rawComments.data) {
                        const comment = parser.parseMultipleApproveComment(rawComment.body)
                        // found correct comment
                        if (comment.approvedMessage && comment.correct) {
                            let issue: any = {
                                id: uuidv4(),
                                issue_number: rawIssue.number,
                                issue_Url: rawIssue.html_url,
                                addresses: comment.addresses.map((addr: any) => addr.trim()),
                                datacaps: comment.datacaps,
                                txs: [],
                                proposedBy: ""
                            }
                            for (let i = 0; i < verifierAndPendingRequests.length; i++) {
                                const index = issue.addresses.indexOf(verifierAndPendingRequests[i].verifierAddress)
                                if (index !== -1) {
                                    issue.txs[index] = verifierAndPendingRequests[i]
                                    issue.proposedBy = verifierAndPendingRequests[i].signerAddress
                                    verifierAndPendingRequests.splice(i, 1)
                                    i--
                                }
                            }
                            if (rawIssue.labels.findIndex((label: any) => label.name === 'status:StartSignOnchain') !== -1) {
                                issue.proposed = true
                            }
                            if (rawIssue.labels.findIndex((label: any) => label.name === 'status:Approved') !== -1) {
                                issue.proposed = false
                            }
                            issues.push(issue)
                            break
                        }
                    }
                }
                // handle non issues
                for (let tx of verifierAndPendingRequests) {
                    issues.push({
                        id: uuidv4(),
                        issue_number: "",
                        issue_Url: "",
                        addresses: [tx.verifier],
                        datacaps: [tx.datacap],
                        txs: [tx],
                        proposedBy: tx.signerAddress,
                        proposed: true
                    })
                }
                const filteredIssues = issues.filter((notaryReq: any) => notaryReq.issue_number !== "")
                this.setState({ verifierAndPendingRequests: filteredIssues })
            },
            verifierAndPendingRequests: [],
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
                        if (
                            rawComments.data.length > 0 && (
                                rawComments.data[rawComments.data.length - 1].user.login.endsWith("[bot]") === false &&
                                rawComments.data[rawComments.data.length - 1].user.login !== rawIssue.assignee.login
                            )
                        ) {
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
                try {
                    const approvedVerifiers = await this.props.wallet.api.listVerifiers()

                    let verified: any = []

                    const promArr = approvedVerifiers
                        .map((verifiedAddress: any) =>
                            new Promise<any>(async (resolve, reject) => {
                                try {
                                    let verifierAccount = await this.props.wallet.api.actorKey(verifiedAddress.verifier)
                                    if (verifierAccount == verifiedAddress.verifier) {
                                        verifierAccount = await this.props.wallet.api.actorAddress(verifiedAddress.verifier)
                                    }
                                    verified.push({
                                        verifier: verifiedAddress.verifier,
                                        verifierAccount,
                                        datacap: verifiedAddress.datacap
                                    })
                                    resolve(verified)

                                } catch (error) {
                                    reject(error)
                                }
                            }))


                    this.setState({ verified })
                    const promRes = await Promise.all(promArr)
                    // console.log("loadVerified promise result", promRes)


                } catch (error) {
                    console.error("error in resolving promises", error)
                }
            },

            loadClients: async () => {
                try {
                    const clients = await this.props.wallet.api.listVerifiedClients()
                    let clientsamount = new BigNumber(0)
                    let promArr: Promise<void>[] = []


                    for (let txs of clients) {
                        promArr.push(new Promise<any>(async (resolve) => {
                            const amountBN = new BigNumber(txs.datacap)
                            clientsamount = amountBN.plus(clientsamount)
                            txs['key'] = await this.props.wallet.api.actorKey(txs.verified)
                            resolve(txs)
                        }))
                    }

                    const promRes = await Promise.all(promArr)
                    // console.log("loadClients promise result", promRes)

                    this.setState({ clients, clientsAmount: clientsamount.toString() })
                } catch (error) {
                    console.error("error in resolving promises", error)
                }

            },

            sortClients: async (e: any, previousOrderBy: string, previousOrder: number) => {
                const { arraySorted, orderBy, sortOrder } =
                    tableSort(
                        e,
                        this.state.clients as [],
                        previousOrderBy,
                        previousOrder)

                this.setState({ clients: arraySorted })
                return { orderBy, sortOrder }
            },
            sortPublicRequests: async (e: any, previousOrderBy: string, previousOrder: number) => {
                const { arraySorted, orderBy, sortOrder } =
                tableSortPublicRequest(
                        e,
                        this.state.clientRequests as [],
                        previousOrderBy,
                        previousOrder)

                this.setState({ clientRequests: arraySorted })
                return { orderBy, sortOrder }
            },
            sortLargeRequests: async (e: any, previousOrderBy: string, previousOrder: number) => {
                const { arraySorted, orderBy, sortOrder } =
                tableSortLargeRequest(
                        e,
                        this.state.largeClientRequests as [],
                        previousOrderBy,
                        previousOrder)

                this.setState({ largeClientRequests: arraySorted })
                return { orderBy, sortOrder }
            },
            sortNotaryRequests: async (e: any, previousOrderBy: string, previousOrder: number) => {
                const { arraySorted, orderBy, sortOrder } =
                    tableSort(
                        e,
                        this.state.verifierAndPendingRequests as [],
                        previousOrderBy,
                        previousOrder)

                this.setState({ clientRequests: arraySorted })
                return { orderBy, sortOrder }
            },
            sortVerified: async (e: any, previousOrderBy: string, previousOrder: number) => {
                const { arraySorted, orderBy, sortOrder } =
                    tableSort(
                        e,
                        this.state.verified as [],
                        previousOrderBy,
                        previousOrder)

                this.setState({ clientRequests: arraySorted })
                return { orderBy, sortOrder }
            },
            updateGithubVerified: async (requestNumber: any, messageID: string, address: string, datacap: any) => {
                const formattedDc = bytesToiB(datacap)
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

                let commentContent = `## Request Approved\nYour Datacap Allocation Request has been approved by the Notary\n#### Message sent to Filecoin Network\n>${messageID} \n#### Address \n> ${address}\n#### Datacap Allocated\n> ${formattedDc}\n#### You can check the status of the message here: https://filfox.info/en/message/${messageID}`

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
            updateGithubVerifiedLarge: async (requestNumber: any, messageID: string, address: string, datacap: any, approvals: number) => {
                const formattedDc = bytesToiB(datacap)
                let commentContent = `## Request Approved\nYour Datacap Allocation Request has been approved by the Notary\n#### Message sent to Filecoin Network\n>${messageID} \n#### Address \n> ${address}\n#### Datacap Allocated\n> ${formattedDc}\n#### You can check the status of the message here: https://filfox.info/en/message/${messageID}`

                await this.props.github.githubOcto.issues.createComment({
                    owner: config.onboardingLargeOwner,
                    repo: config.onboardingLargeClientRepo,
                    issue_number: requestNumber,
                    body: commentContent,
                })

                if ((approvals + 1) == config.approvalsThreshold) {
                    await this.props.github.githubOcto.issues.removeAllLabels({
                        owner: config.onboardingLargeOwner,
                        repo: config.onboardingLargeClientRepo,
                        issue_number: requestNumber,
                    })
                    await this.props.github.githubOcto.issues.addLabels({
                        owner: config.onboardingLargeOwner,
                        repo: config.onboardingLargeClientRepo,
                        issue_number: requestNumber,
                        labels: ['state:Granted'],
                    })
                }

            },
            assignToIssue: async (issue_number: any, assignees: any) => {
                let isAssigned = false
                for (const assigne of assignees) {
                    try {
                        const assigned = await this.props.github.githubOcto.issues.addAssignees({
                            owner: config.onboardingOwner,
                            repo: config.onboardingClientRepo,
                            issue_number,
                            assignees: [assigne]
                        });
                        if (assigned.data.assignees.length > 0) isAssigned = true
                    } catch (error) {
                    }
                }

                if (!isAssigned) {
                    await this.props.github.githubOcto.issues.addAssignees({
                        owner: config.onboardingOwner,
                        repo: config.onboardingClientRepo,
                        issue_number,
                        assignees: config.defaultAssign
                    });
                }

            },
            createRequest: async (data: any) => {
                try {
                    const user = (await this.props.github.githubOcto.users.getAuthenticated()).data.login
                    const issue = await this.props.github.githubOcto.issues.create({
                        owner: config.onboardingOwner,
                        repo: config.onboardingClientRepo,
                        title: 'Client Allocation Request for: ' + data.organization,
                        body: IssueBody(data, user)
                    });
                    if (issue.status === 201) {
                        // this.state.dispatchNotification('Request submited as #' + issue.data.number)
                        this.state.loadClientRequests()
                        await this.state.assignToIssue(issue.data.number, data.assignees)
                        return issue.data.html_url
                    } else {
                        // this.state.dispatchNotification('Something went wrong.')
                    }
                } catch (error) {
                    console.log(error)
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
            searchString: "",
            search: async (query: string) => {
                this.setState({ searchString: query })
            },
            refreshGithubData: async () => {
                this.state.loadClientRequests()
                this.state.loadNotificationClientRequests()
                this.state.loadClientsGithub()
                this.state.loadVerifierAndPendingRequests()
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
