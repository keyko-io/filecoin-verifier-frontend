import React from 'react'
import { Data } from './Index'
import { config } from '../../config';
// @ts-ignore
import { IssueBody } from '../../utils/IssueBody'
import {datacapFilter} from '../../utils/Filters'
const utils = require('@keyko-io/filecoin-verifier-tools/utils/issue-parser')
const parser = require('@keyko-io/filecoin-verifier-tools/utils/notary-issue-parser')

interface DataProviderStates {
    loadClientRequests: any
    clientRequests: any[]
    loadVerifierRequests: any
    verifierRequests: any[]
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
                if(this.props.github.githubLogged === false){
                    this.setState({clientRequests: []})
                    return
                }
                const user = await this.props.github.githubOcto.users.getAuthenticated();
                const rawIssues = await this.props.github.githubOcto.issues.listForRepo({
                    owner: config.lotusNodes[this.props.wallet.networkIndex].clientOwner,
                    repo: config.lotusNodes[this.props.wallet.networkIndex].clientRepo,
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
            loadVerifierRequests: async () => {
                if(this.props.github.githubLogged === false){
                    this.setState({verifierRequests: []})
                    return
                }
                const rawIssues = await this.props.github.githubOcto.issues.listForRepo({
                    owner: config.lotusNodes[this.props.wallet.networkIndex].notaryOwner,
                    repo: config.lotusNodes[this.props.wallet.networkIndex].notaryRepo,
                    state: 'open',
                    labels: 'status:Approved'
                })
                const issues: any[] = []
                for (const rawIssue of rawIssues.data) {
                    const data = parser.parseIssue(rawIssue.body)
                    if (data.correct) {
    
                        // get comments
                        const rawComments = await this.props.github.githubOcto.issues.listComments({
                            owner: config.lotusNodes[this.props.wallet.networkIndex].notaryOwner,
                            repo: config.lotusNodes[this.props.wallet.networkIndex].notaryRepo,
                            issue_number: rawIssue.number,
                        });
                        for (const rawComment of rawComments.data) {
                            const comment = parser.parseApproveComment(rawComment.body)
                            if(comment.approvedMessage && comment.correct){
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
                        datacap: verifiedAddress.datacap
                    })
                }
                this.setState({ verified })
            },
            updateGithubVerified : async (requestNumber: any, messageID: string, address: string, datacap: any) => {
                await this.props.github.githubOcto.issues.removeAllLabels({
                    owner: config.lotusNodes[this.props.wallet.networkIndex].clientOwner,
                    repo: config.lotusNodes[this.props.wallet.networkIndex].clientRepo,
                    issue_number: requestNumber,
                })
                await this.props.github.githubOcto.issues.addLabels({
                    owner: config.lotusNodes[this.props.wallet.networkIndex].clientOwner,
                    repo: config.lotusNodes[this.props.wallet.networkIndex].clientRepo,
                    issue_number: requestNumber,
                    labels: ['state:Granted'],
                })
        
                let commentContent = `## Request Approved\nYour Datacap Allocation Request has been approved by the Notary\n#### Message sent to Filecoin Network\n>${messageID} \n#### Address \n> ${address}\n#### Datacap Allocated\n> ${datacapFilter(String(datacap))}`
        
                await this.props.github.githubOcto.issues.createComment({
                    owner: config.lotusNodes[this.props.wallet.networkIndex].clientOwner,
                    repo: config.lotusNodes[this.props.wallet.networkIndex].clientRepo,
                    issue_number: requestNumber,
                    body: commentContent,
                })

                await this.props.github.githubOcto.issues.update({
                    owner: config.lotusNodes[this.props.wallet.networkIndex].clientOwner,
                    repo: config.lotusNodes[this.props.wallet.networkIndex].clientRepo,
                    issue_number: requestNumber,
                    state: 'closed',
                })
            },
            createRequest: async (data: any) => {
                try {
                    const issue = await this.props.github.githubOcto.issues.create({
                        owner: data.onboarding ? 'keyko-io' : config.lotusNodes[this.props.wallet.networkIndex].clientOwner,
                        repo: data.onboarding ? config.onboardingClientRepo : config.lotusNodes[this.props.wallet.networkIndex].clientRepo,
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
                    // this.state.dispatchNotification(error.toString())
                }
            },
            selectedNotaryRequests: [] as any[],
            selectNotaryRequest: async (number:any) => {
                let selectedTxs = this.state.selectedNotaryRequests
                if(selectedTxs.includes(number)){
                    selectedTxs = selectedTxs.filter((item:number) => item !== number)
                } else {
                    selectedTxs.push(number)
                }
                this.setState({selectedNotaryRequests:selectedTxs})
            },
            clientsGithub: {},
            loadClientsGithub: async () => {
                if(this.props.github.githubLogged === false){
                    this.setState({clientsGithub: []})
                    return
                }
                const rawIssues = await this.props.github.githubOcto.issues.listForRepo({
                    owner: config.lotusNodes[this.props.wallet.networkIndex].clientOwner,
                    repo: config.lotusNodes[this.props.wallet.networkIndex].clientRepo,
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
                if(this.props.github.githubLogged === false){
                    console.log('not logged')
                }
                let results:any[] = []
                if(this.state.viewroot){
                    results = await this.props.github.githubOcto.search.issuesAndPullRequests({
                        q: encodeURIComponent(`${query} in:body is:issue repo:${config.lotusNodes[this.props.wallet.networkIndex].notaryOwner}/${config.lotusNodes[this.props.wallet.networkIndex].notaryRepo}`)
                    })
                }else{
                    results = await this.props.github.githubOcto.search.issuesAndPullRequests({
                        q: encodeURIComponent(`${query} in:body is:issue repo:${config.lotusNodes[this.props.wallet.networkIndex].clientOwner}/${config.lotusNodes[this.props.wallet.networkIndex].clientRepo}`)
                    })
                }
                console.log('results', results)
                return results
            },
            refreshGithubData: async () => {
                this.state.loadClientRequests()
                this.state.loadClientsGithub()
                this.state.loadVerifierRequests()
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