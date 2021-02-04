import React, { Component } from 'react';
import { Data } from '../../context/Data/Index';
import AddVerifierModal from '../../modals/AddVerifierModal';
import RequestVerifierModal from '../../modals/RequestVerifierModal';
// @ts-ignore
import { ButtonPrimary, dispatchCustomEvent, ButtonSecondary } from "slate-react-system";
import { datacapFilter, iBtoB } from "../../utils/Filters"
import { config } from '../../config'
import BigNumber from 'bignumber.js'
const parser = require('@keyko-io/filecoin-verifier-tools/utils/notary-issue-parser')

type RootKeyHolderState = {
    tabs: string
    approveLoading: boolean
    selectedTransactions: any[]
}

type RootKeyHolderProps = {

}

export default class RootKeyHolder extends Component<RootKeyHolderProps, RootKeyHolderState> {
    public static contextType = Data

    state = {
        selectedTransactions: [] as any[],
        approveLoading: false,
        tabs: '0'
    }

    componentDidMount() {
        this.context.loadVerifierAndPendingRequests()
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

    handleSubmitCancel = async () => {

        this.setState({ approveLoading: true })
        try {
            var messages= []
            for (let tx of this.context.pendingverifiers) {
                if (this.state.selectedTransactions.includes(tx.id)) {
                    // Only RKH that proposed the tx is able to cancel it
                    // TODO modal instead alert
                    if (tx.signerAccount != this.context.wallet.activeAccount) {
                        alert("You must be the proposer of the tx " + tx.id + " to cancel it! ")
                        continue;
                    }                
                    let messageID = await this.context.wallet.api.cancelVerifier(tx.verifier, BigInt(tx.datacap), tx.signer, tx.id, this.context.wallet.walletIndex);
                    messages.push(messageID)
                }
            }
            this.setState({ selectedTransactions: [], approveLoading: false })
            this.context.wallet.dispatchNotification('Cancel Messages sent with IDs: ' + messages)
        } catch (e) {
            this.setState({ approveLoading: false })
            this.context.wallet.dispatchNotification('Cancel failed: ' + e.message)
            console.log('error', e.stack)
        }
    }

    handleSubmitApproveSign = async () => {
        // loop over selected rows
        const multisigInfo = await this.context.wallet.api.multisigInfo(config.lotusNodes[this.context.wallet.networkIndex].rkhMultisig)
        for (const request of this.context.verifierAndPendingRequests) {
            if (this.context.selectedNotaryRequests.includes(request.issue_number)) {
                try {
                    if (request.proposed === true) {

                        const messageIds:any[] = []
                        // for each tx
                        for(const tx of request.txs){
                            const messageID = await this.context.wallet.api.approveVerifier(tx.verifier, BigInt(tx.datacap), tx.signer, tx.id, this.context.wallet.walletIndex);
                            messageIds.push(messageID)
                        }
                        // send comment to issue
                        let commentContent = `## The request has been signed by a new Root Key Holder\n#### Message sent to Filecoin Network\n>${messageIds.join()}`
                        await this.context.github.githubOctoGeneric.octokit.issues.createComment({
                            owner: config.lotusNodes[this.context.wallet.networkIndex].notaryOwner,
                            repo: config.lotusNodes[this.context.wallet.networkIndex].notaryRepo,
                            issue_number: request.issue_number,
                            body: commentContent,
                        })
                        if (multisigInfo &&
                            multisigInfo.signers &&
                            multisigInfo.signers > config.lotusNodes[this.context.wallet.networkIndex].rkhtreshold) {

                            await this.timeout(1000)
                            await this.context.github.githubOctoGeneric.octokit.issues.removeAllLabels({
                                owner: config.lotusNodes[this.context.wallet.networkIndex].notaryOwner,
                                repo: config.lotusNodes[this.context.wallet.networkIndex].notaryRepo,
                                issue_number: request.issue_number,
                            })
                            await this.timeout(1000)
                            await this.context.github.githubOctoGeneric.octokit.issues.addLabels({
                                owner: config.lotusNodes[this.context.wallet.networkIndex].notaryOwner,
                                repo: config.lotusNodes[this.context.wallet.networkIndex].notaryRepo,
                                issue_number: request.issue_number,
                                labels: ['status:AddedOnchain'],
                            })
                        }

                    } else {
                        const messageIds: any[] = []
                        for (let i=0; i<request.datacaps.length; i++) {
                            if (request.datacaps[i] && request.addresses[i]) {
                                
                                // request.datacaps
                                let prepDatacap = '1'
                                let prepDatacapExt = 'B'
                                console.log("request.datacaps: " + request.datacaps[i])
                                const dataext = config.datacapExt.slice().reverse()
                                for (const entry of dataext) {
                                    if (request.datacaps[i].endsWith(entry.name)) {
                                        console.log("found unit: " + entry.name)
                                        prepDatacapExt = entry.value
                                        prepDatacap = request.datacaps[i].substring(0, request.datacaps[i].length - entry.name.length)
                                        break
                                    }
                                }
            
                                console.log("prepDatacap: " + prepDatacap)
                                console.log("prepDatacapExt: " + prepDatacapExt)
            
                                const datacap = new BigNumber(prepDatacap)
                                const fullDatacap = new BigNumber(prepDatacapExt).multipliedBy(datacap).toFixed(0)
                                console.log("fullDatacap to propose: " + fullDatacap)
            
                                let address = request.addresses[i]
                                console.log("request address: " + request.address)
                                    
                                if (address.startsWith("t1") || address.startsWith("f1")) {
                                    address = await this.context.wallet.api.actorAddress(address)
                                    console.log("getting t0/f0 ID. Result of  actorAddress method: " + address)
                                }
            
                                console.log("address to propose: " + address)  
            
                                let messageID = await this.context.wallet.api.proposeVerifier(address, BigInt(fullDatacap), this.context.wallet.walletIndex)
                                console.log("messageID: " + messageID)
                                messageIds.push(messageID)
                                this.context.wallet.dispatchNotification('Accepting Message sent with ID: ' + messageID)
                                
                            }
                        }
                        await this.context.github.githubOctoGenericLogin()
                        await this.context.github.githubOctoGeneric.octokit.issues.removeAllLabels({
                            owner: config.lotusNodes[this.context.wallet.networkIndex].notaryOwner,
                            repo: config.lotusNodes[this.context.wallet.networkIndex].notaryRepo,
                            issue_number: request.issue_number,
                        })
                        await this.timeout(1000)
                        let label = config.lotusNodes[this.context.wallet.networkIndex].rkhtreshold > 1 ? 'status:StartSignOnchain' : 'status:AddedOnchain'
                        await this.context.github.githubOctoGeneric.octokit.issues.addLabels({
                            owner: config.lotusNodes[this.context.wallet.networkIndex].notaryOwner,
                            repo: config.lotusNodes[this.context.wallet.networkIndex].notaryRepo,
                            issue_number: request.issue_number,
                            labels: [label],
                        })
                    }
                } catch (e) {
                    this.context.wallet.dispatchNotification('Failed: ' + e.message)
                    console.log('faile', e.stack)
                }
            }
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
                        <div className={this.state.tabs === "0" ? "selected" : ""} onClick={() => { this.showVerifierRequests() }}>Notary Requests ({ this.context.verifierAndPendingRequests.length })</div>
                        <div className={this.state.tabs === "2" ? "selected" : ""} onClick={() => { this.showApproved() }}>Accepted Notaries ({this.context.verified.length})</div>
                    </div>
                    <div className="tabssadd">
                        {this.state.tabs === "0" ? <>
                        <ButtonPrimary onClick={() => this.handleSubmitApproveSign()}>Approve</ButtonPrimary> 
                        <ButtonPrimary onClick={() => this.handleSubmitCancel()}>Cancel</ButtonPrimary> 
                        </>
                        : null}
                    </div>
                </div>
                {this.state.tabs === "0" ?
                    <div>
                        <table>
                            <thead>
                                <tr>
                                    <td></td>
                                    <td>Status</td>
                                    <td>Issue</td>
                                    <td>Addresses</td>
                                    <td>Datacaps</td>
                                    <td>Proposed</td>
                                </tr>
                            </thead>
                            <tbody>
                                {this.context.verifierAndPendingRequests.map((notaryReq: any, index: any) =>
                                    <tr key={index}>
                                        <td><input type="checkbox" onChange={() => this.selectNotaryRow(notaryReq.issue_number)} checked={this.context.selectedNotaryRequests.includes(notaryReq.issue_number)} /></td>
                                        <td>{notaryReq.proposed === true ? 'Proposed' : 'Pending'}</td>
                                        <td><a target="_blank" rel="noopener noreferrer" href={notaryReq.issue_Url}>#{notaryReq.issue_number}</a></td>
                                        <td>
                                            {notaryReq.addresses.map((address: any) => 
                                                <div>{address}</div>
                                            )}
                                        </td>
                                        <td>
                                            {notaryReq.datacaps.map((datacap: any) => 
                                                <div>{datacap}</div>
                                            )}
                                        </td>
                                        <td>{notaryReq.signerAccount}</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                        {this.context.verifierAndPendingRequests.length === 0 ? <div className="nodata">No requests yet</div> : null}
                    </div>
                : null }
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
                                        <td>{datacapFilter(transaction.datacapConverted)}</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                        {this.context.verified.length === 0 ? <div className="nodata">No notaries yet</div> : null}
                    </div> : null
                }
            </div>
        )
    }
}