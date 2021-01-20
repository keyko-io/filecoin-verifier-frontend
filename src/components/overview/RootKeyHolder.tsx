import React, { Component } from 'react';
import { Data } from '../../context/Data/Index';
import AddVerifierModal from '../../modals/AddVerifierModal';
import RequestVerifierModal from '../../modals/RequestVerifierModal';
// @ts-ignore
import { ButtonPrimary, dispatchCustomEvent, ButtonSecondary } from "slate-react-system";
import { datacapFilter } from "../../utils/Filters"
// @ts-ignore
import LoginGithub from 'react-login-github';
import { config } from '../../config'
const parser = require('@keyko-io/filecoin-verifier-tools/utils/notary-issue-parser')

type RootKeyHolderState = {
    tabs: string
    approveLoading: boolean
    selectedTransactions: any[]
}

type RootKeyHolderProps = {
    pendingverifiers: any[]
}

export default class RootKeyHolder extends Component<RootKeyHolderProps, RootKeyHolderState> {
    public static contextType = Data

    state = {
        selectedTransactions: [] as any[],
        approveLoading: false,
        tabs: '1',
    }

    componentDidMount() {
        this.context.loadVerifierRequests()
    }

    showPending = async () => {
        this.setState({ tabs: "1" })
    }

    showApproved = async () => {
        this.setState({ tabs: "2" })
    }

    showVerifierRequests = async () => {
        this.setState({ tabs: "0" })
    }

    selectRow = (transactionId: string) => {
        let selectedTxs = this.state.selectedTransactions
        if (selectedTxs.includes(transactionId)) {
            selectedTxs = selectedTxs.filter(item => item !== transactionId)
        } else {
            selectedTxs.push(transactionId)
        }
        this.setState({ selectedTransactions: selectedTxs })
    }

    selectNotaryRow = (number: string) => {
        this.context.selectNotaryRequest(number)
    }


    proposeVerifier = async () => {
        dispatchCustomEvent({
            name: "create-modal", detail: {
                id: Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 5),
                modal: <AddVerifierModal />
            }
        })
    }

    requestVerifier = async () => {
        dispatchCustomEvent({
            name: "create-modal", detail: {
                id: Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 5),
                modal: <RequestVerifierModal />
            }
        })
    }

    acceptRequestVerifier = async () => {
        for (const request of this.context.verifierRequests) {
            if (this.context.selectedNotaryRequests.includes(request.number)) {
                try {
                    let prepDatacap = '1'
                    let prepDatacapExt = 'B'
                    console.log("request.datacap: " + request.datacap)
                    const dataext = config.datacapExtNotary.slice().reverse()
                    for (const entry of dataext) {
                        if (request.datacap.endsWith(entry.name)) {
                            console.log("found unit: " + entry.name)
                            prepDatacapExt = entry.value
                            prepDatacap = request.datacap.substring(0, request.datacap.length - entry.name.length)
                            break
                        }
                    }

                    console.log("prepDatacap: " + prepDatacap)
                    console.log("prepDatacapExt: " + prepDatacapExt)

                    const datacap = parseFloat(prepDatacap)
                    const fullDatacap = BigInt(datacap * parseFloat(prepDatacapExt))


                    let address = request.address
                    console.log("request address: " + request.address)

                    if (address.startsWith("t1") || address.startsWith("f1")) {
                        address = await this.context.wallet.api.actorAddress(address)
                        console.log("getting t0/f0 ID. Result of  actorAddress method: " + address)
                    }

                    console.log("address to propose: " + address)
                    console.log("fullDatacap to propose: " + fullDatacap)

                    let messageID = await this.context.wallet.api.proposeVerifier(address, fullDatacap, this.context.wallet.walletIndex)
                    console.log("messageID: " + messageID)
                    // github update
                    // DISABLED temporaly until we can use a generic token to avoid exposing RKH Identity
                    
                    await this.context.github.githubOctoGenericLogin()

                    await this.context.github.githubOctoGeneric.octokit.issues.removeAllLabels({
                        owner: config.lotusNodes[this.context.wallet.networkIndex].notaryOwner,
                        repo: config.lotusNodes[this.context.wallet.networkIndex].notaryRepo,
                        issue_number: request.number,
                    })
                    await this.timeout(1000)
                    let label = config.lotusNodes[this.context.wallet.networkIndex].rkhtreshold > 1 ? 'status:StartSignOnchain' : 'status:AddedOnchain'
                    await this.context.github.githubOctoGeneric.octokit.issues.addLabels({
                        owner: config.lotusNodes[this.context.wallet.networkIndex].notaryOwner,
                        repo: config.lotusNodes[this.context.wallet.networkIndex].notaryRepo,
                        issue_number: request.number,
                        labels: [label],
                    })

                    let commentContent = `## The request has been signed by a new Root Key Holder\n#### Message sent to Filecoin Network\n>${messageID}`

                    await this.context.github.githubOctoGeneric.octokit.issues.createComment({
                        owner: config.lotusNodes[this.context.wallet.networkIndex].notaryOwner,
                        repo: config.lotusNodes[this.context.wallet.networkIndex].notaryRepo,
                        issue_number: request.number,
                        body: commentContent,
                    })

                    await this.timeout(1000)
                    
                    await this.context.loadVerifierRequests()
                    // send notifications
                    this.context.wallet.dispatchNotification('Accepting Message sent with ID: ' + messageID)
                } catch (e) {
                    this.context.wallet.dispatchNotification('Verification failed: ' + e.message)
                    console.log(e.stack)
                }
            }
        }
    }

    handleSubmitApprove = async () => {
        this.setState({ approveLoading: true })
        // load github issues
        const rawIssues = await this.context.github.githubOcto.issues.listForRepo({
            owner: config.lotusNodes[this.context.wallet.networkIndex].notaryOwner,
            repo: config.lotusNodes[this.context.wallet.networkIndex].notaryRepo,
            state: 'open',
            labels: 'status:StartSignOnchain'
        })
        const issues: any = {}
        for (const rawIssue of rawIssues.data) {
            const data = parser.parseIssue(rawIssue.body)
            try {
                // get t0/f0 ID
                const address = await this.context.wallet.api.actorAddress(data.address)
                if (data.correct && address) {
                    issues[address] = {
                        number: rawIssue.number,
                        url: rawIssue.html_url,
                        data
                    }
                }
            } catch (e) {
                console.log('retrieval', e)
            }
        }
        // go over transactions
        try {
            const multisigInfo = await this.context.wallet.api.multisigInfo(config.lotusNodes[this.context.wallet.networkIndex].rkhMultisig)
            for (let tx of this.props.pendingverifiers) {
                if (this.state.selectedTransactions.includes(tx.id)) {
                    const datacap = BigInt(tx.datacap)
                    let messageID = await this.context.wallet.api.approveVerifier(tx.verifier, datacap, tx.signer, tx.id, this.context.wallet.walletIndex);

                    // check if we have github issue
                     // DISABLED temporaly until we can use a generic token to avoid exposing RKH Identity
                     
                    if (issues[tx.verifier]) {
                        let commentContent = `## The request has been signed by a new Root Key Holder\n#### Message sent to Filecoin Network\n>${messageID}`

                        await this.context.github.githubOctoGenericLogin()
                        
                        await this.context.github.githubOctoGeneric.octokit.issues.createComment({
                            owner: config.lotusNodes[this.context.wallet.networkIndex].notaryOwner,
                            repo: config.lotusNodes[this.context.wallet.networkIndex].notaryRepo,
                            issue_number: issues[tx.verifier].number,
                            body: commentContent,
                        })

                        if (multisigInfo &&
                            multisigInfo.signers &&
                            multisigInfo.signers > config.lotusNodes[this.context.wallet.networkIndex].rkhtreshold) {

                            await this.timeout(1000)
                            await this.context.github.githubOctoGeneric.octokit.issues.removeAllLabels({
                                owner: config.lotusNodes[this.context.wallet.networkIndex].notaryOwner,
                                repo: config.lotusNodes[this.context.wallet.networkIndex].notaryRepo,
                                issue_number: issues[tx.verifier].number,
                            })
                            await this.timeout(1000)
                            await this.context.github.githubOctoGeneric.octokit.issues.addLabels({
                                owner: config.lotusNodes[this.context.wallet.networkIndex].notaryOwner,
                                repo: config.lotusNodes[this.context.wallet.networkIndex].notaryRepo,
                                issue_number: issues[tx.verifier].number,
                                labels: ['status:AddedOnchain'],
                            })
                        }
                    }
                    
                }
            }
            this.setState({ selectedTransactions: [], approveLoading: false })
            this.context.wallet.dispatchNotification('Transactions confirmed')
        } catch (e) {
            this.setState({ approveLoading: false })
            this.context.wallet.dispatchNotification('Approval failed: ' + e.message)
            console.log('error', e.stack)
        }
    }

    timeout(delay: number) {
        return new Promise(res => setTimeout(res, delay));
    }

    public render() {
        return (
            <div className="main">
                <div className="tabsholder">
                    <div className="tabs">
                        <div className={this.state.tabs === "0" ? "selected" : ""} onClick={() => { this.showVerifierRequests() }}>Notaries Approved by Governance ({this.context.verifierRequests.length})</div>
                        <div className={this.state.tabs === "1" ? "selected" : ""} onClick={() => { this.showPending() }}>Notaries Pending to Sign On-chain ({this.props.pendingverifiers.length})</div>
                        <div className={this.state.tabs === "2" ? "selected" : ""} onClick={() => { this.showApproved() }}>Accepted Notaries ({this.context.verified.length})</div>
                    </div>
                    <div className="tabssadd">
                        {this.state.tabs === "0" ? <ButtonPrimary onClick={() => this.acceptRequestVerifier()}>Propose On-chain</ButtonPrimary> : null}
                        {this.state.tabs === "1" ? <ButtonPrimary onClick={() => this.handleSubmitApprove()}>Sign On-chain</ButtonPrimary> : null}
                    </div>
                </div>
                {this.state.tabs === "0" ?
                    <div>
                        <table>
                            <thead>
                                <tr>
                                    <td></td>
                                    <td>Client</td>
                                    <td>Address</td>
                                    <td>Datacap</td>
                                    <td>Audit trail</td>
                                </tr>
                            </thead>
                            <tbody>
                                {this.context.verifierRequests.map((notaryReq: any, index: any) =>
                                    <tr key={index}>
                                        <td><input type="checkbox" onChange={() => this.selectNotaryRow(notaryReq.number)} checked={this.context.selectedNotaryRequests.includes(notaryReq.number)} /></td>
                                        <td>{notaryReq.data.name}</td>
                                        <td>{notaryReq.address}</td>
                                        <td>{notaryReq.datacap}</td>
                                        <td><a target="_blank" rel="noopener noreferrer" href={notaryReq.url}>#{notaryReq.number}</a></td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                        {this.context.verifierRequests.length === 0 ? <div className="nodata">No public requests yet</div> : null}
                    </div>
                    : null}

                {this.state.tabs === "2" ?
                    <div>
                        <table>
                            <thead>
                                <tr>
                                    <td>Notary</td>
                                    <td>Address</td>
                                    <td>Datacap</td>
                                </tr>
                            </thead>
                            <tbody>
                                {this.context.verified.map((transaction: any, index: any) =>
                                    <tr key={index}>
                                        <td>{transaction.verifier}</td>
                                        <td>{transaction.verifierAccount}</td>
                                        <td>{datacapFilter(transaction.datacap)}</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                        {this.context.verified.length === 0 ? <div className="nodata">No notaries yet</div> : null}
                    </div> : null
                }
                {this.state.tabs === "1" ?
                    <div>
                        <table>
                            <thead>
                                <tr>
                                    <td></td>
                                    <td>Type</td>
                                    <td>Notary</td>
                                    <td>Datacap</td>
                                    <td>Proposed By</td>
                                </tr>
                            </thead>
                            <tbody>
                                {this.props.pendingverifiers.map((transaction: any) =>
                                    <tr key={transaction.id}>
                                        <td><input type="checkbox" onChange={() => this.selectRow(transaction.id)} checked={this.state.selectedTransactions.includes(transaction.id)} /></td>
                                        <td>{transaction.type}</td>
                                        <td>{transaction.verifier}</td>
                                        <td>{datacapFilter(transaction.datacap)}</td>
                                        <td>{transaction.signer}</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                        {this.props.pendingverifiers.length === 0 ? <div className="nodata">No pending notaries yet</div> : null}
                    </div> : null
                }
            </div>
        )
    }
}
