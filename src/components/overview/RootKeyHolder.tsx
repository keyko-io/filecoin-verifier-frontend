import React, { Component } from 'react';
import { Data } from '../../context/Data/Index';
import AddVerifierModal from '../../modals/AddVerifierModal';
import RequestVerifierModal from '../../modals/RequestVerifierModal';
// @ts-ignore
import { ButtonPrimary, dispatchCustomEvent } from "slate-react-system";
import { bytesToiB, anyToBytes } from "../../utils/Filters"
import { config } from '../../config'
import WarnModalVerify from '../../modals/WarnModalVerify';
import Pagination from '../Pagination';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { tableElementFilter } from '../../utils/SortFilter';
import { BeatLoader } from "react-spinners";

import * as Sentry from "@sentry/react";
const parser = require('@keyko-io/filecoin-verifier-tools/utils/notary-issue-parser')

type RootKeyHolderState = {
    tabs: string
    approveLoading: boolean
    selectedTransactions: any[]
    refAccepted: any
    sortOrderAccepted: number,
    orderByAccepted: string,
    refRequests: any,
    sortOrderRequest: number,
    orderByRequest: string,
}

type RootKeyHolderProps = {
    searchString: string
}

export default class RootKeyHolder extends Component<RootKeyHolderProps, RootKeyHolderState> {
    public static contextType = Data

    state = {
        selectedTransactions: [] as any[],
        approveLoading: false,
        tabs: '0',
        refAccepted: {} as any,
        sortOrderAccepted: -1,
        orderByAccepted: "verifier",
        refRequests: {} as any,
        orderByRequest: "addresses",
        sortOrderRequest: -1
    }

    acceptedNotaryColums = [
        { id: "verifier", value: "Notary" },
        { id: "verifierAccount", value: "Address" },
        { id: "datacapConverted", value: "Datacap" },
    ]

    requestColums = [
        { id: "proposed", value: "Status" },
        { id: "issue_number", value: "Issue" },
        { id: "addresses", value: "Address" },
        { id: "datacaps", value: "Datacap" },
        { id: "txs", value: "Transaction ID" },
        { id: "proposedBy", value: "Proposed by" },
    ]

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

    showWarnPropose = async (e: any, origin: string, selected: any[]) => {
        await e.preventDefault()
        if(selected.length === 0){
            this.context.wallet.dispatchNotification("Plese, select at least one client to sign")
            return
        }
        dispatchCustomEvent({
            name: "create-modal", detail: {
                id: Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 5),
                modal: <WarnModalVerify
                    clientRequests={this.context.verifierAndPendingRequests}
                    selectedClientRequests={selected}
                    onClick={origin === 'ProposeSign' ? this.handleSubmitApproveSign.bind(this) : this.handleSubmitCancel.bind(this)}
                    origin={origin}
                />
            }
        })
    }

    handleSubmitCancel = async (id: string) => {
        try {
            for (const request of this.context.verifierAndPendingRequests) {
                if (request.id === id) {
                    if (request.proposed === true) {
                        if (request.proposedBy != this.context.wallet.activeAccount) {
                            alert("You must be the proposer of the request  to cancel it! ")
                            continue;
                        }
                        // for each tx
                        for (const tx of request.txs) {
                            const messageID = await this.context.wallet.api.cancelVerifier(tx.verifier, BigInt(tx.datacap), tx.signer, tx.id, this.context.wallet.walletIndex);
                            console.log("cancel: " + messageID)
                            this.context.wallet.dispatchNotification('Cancel Message sent with ID: ' + messageID)
                        }
                    }
                }
            }
        } catch (e) {
            this.setState({ approveLoading: false })
            this.context.wallet.dispatchNotification('Cancel failed: ' + e.message)
            console.log('error', e.stack)
        }
    }

    handleSubmitApproveSign = async () => {
        dispatchCustomEvent({ name: "delete-modal", detail: {} })
        this.setState({ approveLoading: true })
        // loop over selected rows
        const multisigInfo = await this.context.wallet.api.multisigInfo(config.lotusNodes[this.context.wallet.networkIndex].rkhMultisig)
        await this.context.github.githubOctoGenericLogin()
        for (const request of this.context.verifierAndPendingRequests) {
            if (this.context.selectedNotaryRequests.includes(request.id)) {
                const messageIds: any[] = []
                var commentContent = ''
                var label = ''
                let filfox = ''
                let errorMessage = ''
                try {
                const assignee = (await this.context.github.githubOctoGeneric.octokit.issues.get({
                    owner: config.lotusNodes[this.context.wallet.networkIndex].notaryOwner,
                    repo: config.lotusNodes[this.context.wallet.networkIndex].notaryRepo,
                    issue_number: request.issue_number,
               }))?.data?.assignee?.login
                if(!assignee){
                    throw new Error("You should assign the issue to someone")
                }

                    let breadCrumb = {
                        category: "handleSubmitApproveSign",
                        message: `handleSubmitApproveSign, request id: ${request.id}, missing the messageID`,
                        level: Sentry.Severity.Warning,
                        data: {
                            request: request,
                        }
                    }
                    if (request.proposed === true) {
                        // for each tx
                        for (const tx of request.txs) {
                            let messageID = tx.datacap === 0 ?
                                await this.context.wallet.api.removeVerifier(tx.verifier, tx.signer, tx.id, this.context.wallet.walletIndex)
                                :
                                await this.context.wallet.api.approveVerifier(tx.verifier, BigInt(tx.datacap), tx.signer, tx.id, this.context.wallet.walletIndex);

                            const txReceipt = await this.context.wallet.api.getReceipt(messageID)
                            if (txReceipt.ExitCode !== 0) errorMessage += `#### @${assignee} There was an error processing the message >${messageID}`
                            messageIds.push(messageID)
                            this.context.wallet.dispatchNotification('Accepting Message sent with ID: ' + messageID)
                            this.setState({approveLoading:false})
                            filfox += `#### You can check the status of the message here: https://filfox.info/en/message/${messageID}\n`
                        }
                        if(messageIds.length === 0){
                            this.setState({approveLoading:false})
                            Sentry.addBreadcrumb(breadCrumb);
                            Sentry.captureMessage(breadCrumb.message)
                        }
                        // comment to issue
                        commentContent = `## The request has been signed by a new Root Key Holder\n#### Message sent to Filecoin Network\n>${messageIds.join()}\n${errorMessage}\n${filfox}`
                        label = errorMessage === '' ? 'status:AddedOnchain' : 'status:Error'
                    } else {
                        let filfox = ''
                        let errorMessage = ''
                        for (let i = 0; i < request.datacaps.length; i++) {
                            if (request.datacaps[i] && request.addresses[i]) {
                                const datacap = anyToBytes(request.datacaps[i])
                                let address = request.addresses[i]
                                console.log("request address: " + address)
                                console.log("request datacap: " + request.datacaps[i])
                                console.log("datacap: " + datacap)

                                if (address.startsWith("t1") || address.startsWith("f1")) {
                                    address = await this.context.wallet.api.actorAddress(address)
                                    console.log("getting t0/f0 ID. Result of  actorAddress method: " + address)
                                }

                                console.log("address to propose: " + address)

                                let messageID = datacap === 0 ?
                                    await this.context.wallet.api.proposeRemoveVerifier(address, this.context.wallet.walletIndex)
                                    :
                                    await this.context.wallet.api.proposeVerifier(address, BigInt(datacap), this.context.wallet.walletIndex)
                                console.log("messageID: " + messageID)
                                const txReceipt = await this.context.wallet.api.getReceipt(messageID)
                                if (txReceipt.ExitCode !== 0) errorMessage += `#### @${assignee} There was an error processing the message\n>${messageID}`
                                messageIds.push(messageID)
                                this.context.wallet.dispatchNotification('Accepting Message sent with ID: ' + messageID)
                                this.setState({approveLoading:false})
                                filfox += `#### You can check the status of the message here: https://filfox.info/en/message/${messageID}\n`
                            }
                        }
                        if(messageIds.length === 0){
                            this.setState({approveLoading:false})
                            Sentry.addBreadcrumb(breadCrumb);
                            Sentry.captureMessage(breadCrumb.message)
                        }
                        commentContent = `## The request has been signed by a new Root Key Holder\n#### Message sent to Filecoin Network\n>${messageIds.join()}\n ${errorMessage}\n ${filfox}`
                        label = errorMessage === '' ?
                            config.lotusNodes[this.context.wallet.networkIndex].rkhtreshold > 1 ? 'status:StartSignOnchain' : 'status:AddedOnchain'
                            : 'status:Error'
                    }
                    if (commentContent != '') {
                        await this.context.github.githubOctoGeneric.octokit.issues.createComment({
                            owner: config.lotusNodes[this.context.wallet.networkIndex].notaryOwner,
                            repo: config.lotusNodes[this.context.wallet.networkIndex].notaryRepo,
                            issue_number: request.issue_number,
                            body: commentContent,
                        })
                    }
                    if (label != '') {
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
                            labels: [label],
                        })
                    }
                } catch (e) {
                    this.context.wallet.dispatchNotification('Failed: ' + e.message)
                    this.setState({approveLoading:false})
                    console.log('faile', e.stack)
                }
            }
        }
    }

    onRefAccepted = (refAccepted: any) => {
        this.setState({ refAccepted });
    };

    onRefRequests = (refRequests: any) => {
        this.setState({ refRequests });
    };

    orderAccepted = async (e: any) => {
        const { orderBy, sortOrder } = await this.context.sortVerified(e, this.state.orderByAccepted, this.state.sortOrderAccepted)
        this.setState({ orderByAccepted: orderBy, sortOrderAccepted: sortOrder })
    }

    orderRequest = async (e: any) => {
        const { orderBy, sortOrder } = await this.context.sortNotaryRequests(e, this.state.orderByRequest, this.state.sortOrderRequest)
        this.setState({ orderByRequest: orderBy, sortOrderRequest: sortOrder })
    }

    timeout(delay: number) {
        return new Promise(res => setTimeout(res, delay));
    }

    public render() {
        return (
            <div className="main">
                <div className="tabsholder">
                    <div className="tabs">
                        <div className={this.state.tabs === "0" ? "selected" : ""} onClick={() => { this.showVerifierRequests() }}>Notary Requests ({this.context.verifierAndPendingRequests.length})</div>
                        <div className={this.state.tabs === "2" ? "selected" : ""} onClick={() => { this.showApproved() }}>Accepted Notaries ({this.context.verified.length})</div>
                    </div>
                    <div className="tabssadd">
                        {
                        this.state.approveLoading ? 
                        <BeatLoader size={15} color={"rgb(24,160,237)"} /> :
                        this.state.tabs === "0" ? <>
                            <ButtonPrimary onClick={(e: any) => this.showWarnPropose(e, "ProposeSign", this.context.selectedNotaryRequests)}>Sign On-chain</ButtonPrimary>
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
                                    {this.requestColums.map((column: any) => <td
                                        id={column.id} onClick={this.orderRequest}>
                                        {column.value}
                                        <FontAwesomeIcon icon={["fas", "sort"]} />
                                    </td>)}
                                    <td></td>
                                </tr>
                            </thead>
                            <tbody>
                                {this.state.refRequests && this.state.refRequests.checkIndex ?
                                    this.context.verifierAndPendingRequests.filter((element: any) => tableElementFilter(this.props.searchString, element) === true)
                                        .filter((_: any, i: any) => this.state.refRequests?.checkIndex(i))
                                        .map((notaryReq: any) =>
                                            <tr key={notaryReq.id} className={notaryReq.proposedBy === this.context.wallet.activeAccount ? 'ownedrow' : ''}>
                                                <td><input type="checkbox" onChange={() => this.selectNotaryRow(notaryReq.id)} checked={this.context.selectedNotaryRequests.includes(notaryReq.id)} /></td>
                                                <td>{notaryReq.proposed === true ? 'Proposed' : 'Pending'}</td>
                                                <td><a target="_blank" rel="noopener noreferrer" href={notaryReq.issue_Url}>#{notaryReq.issue_number}</a></td>
                                                <td>
                                                    {notaryReq.addresses.map((address: any, index: any) =>
                                                        <div key={index}>{address}</div>
                                                    )}
                                                </td>
                                                <td>
                                                    {notaryReq.datacaps.map((datacap: any, index: any) =>
                                                        <div key={index}>{datacap}</div>
                                                    )}
                                                </td>
                                                <td>
                                                    {notaryReq.txs.map((tx: any, index: any) =>
                                                        <div key={index}>{tx.id}</div>
                                                    )}
                                                </td>
                                                <td>{notaryReq.proposedBy}</td>
                                                <td>{notaryReq.proposedBy === this.context.wallet.activeAccount ? <ButtonPrimary onClick={(e: any) => this.showWarnPropose(e, "Cancel", [notaryReq.id])}>Cancel</ButtonPrimary> : null}</td>
                                            </tr>
                                        ) : null}
                            </tbody>
                        </table>
                        {this.context.verifierAndPendingRequests.length === 0 ? <div className="nodata"> <BeatLoader size={15} color={"rgb(24,160,237)"} /></div> : null}
                        <Pagination
                            elements={this.context.verifierAndPendingRequests}
                            maxElements={10}
                            ref={this.onRefRequests}
                            refresh={() => this.setState({})}
                            search={this.props.searchString}
                        />
                    </div>
                    : null}
                {this.state.tabs === "2" ?
                    <div>
                        <table>
                            <thead>
                                <tr>
                                    {this.acceptedNotaryColums.map((column: any) => <td
                                        id={column.id} onClick={this.orderAccepted}>
                                        {column.value}
                                        <FontAwesomeIcon icon={["fas", "sort"]} />
                                    </td>)}
                                </tr>
                            </thead>
                            <tbody>
                                {this.state.refAccepted && this.state.refAccepted.checkIndex ?
                                    this.context.verified.filter((element: any) => tableElementFilter(this.props.searchString, element) === true)
                                        .filter((_: any, i: any) => this.state.refAccepted?.checkIndex(i))
                                        .map((transaction: any, index: any) =>
                                            <tr key={index}>
                                                <td>{transaction.verifier}</td>
                                                <td>{transaction.verifierAccount}</td>
                                                <td>{bytesToiB(transaction.datacap)}</td>
                                            </tr>
                                        ) : null}
                            </tbody>
                        </table>
                        {this.context.verified.length === 0 ? <div className="nodata">No notaries yet</div> : null}
                        <Pagination
                            elements={this.context.verified}
                            maxElements={10}
                            ref={this.onRefAccepted}
                            refresh={() => this.setState({})}
                            search={this.props.searchString}
                        />
                    </div> : null
                }
            </div>
        )
    }
}