import React, { Component } from 'react';
import { Data } from '../../context/Data/Index';
import AddClientModal from '../../modals/AddClientModal';
import AddVerifierModal from '../../modals/AddVerifierModal';
// @ts-ignore
import { ButtonPrimary, dispatchCustomEvent, ButtonSecondary } from "slate-react-system";
import { bytesToiB, anyToBytes } from "../../utils/Filters"
import BigNumber from 'bignumber.js'
// @ts-ignore
import LoginGithub from 'react-login-github';
import { config } from '../../config'
import WarnModal from '../../modals/WarnModal';
import WarnModalVerify from '../../modals/WarnModalVerify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { tableElementFilter } from '../../utils/SortFilter';
import Pagination from '../Pagination';
import history from '../../context/History';
import { BeatLoader } from "react-spinners";



type NotaryStates = {
    tabs: string
    selectedTransactions: any[]
    selectedClientRequests: any[]
    selectedLargeClientRequests: any[]
    sortOrderVerified: number,
    orderByVerified: string,
    refVerified: any,
    regLargePublic: any,
    sortOrderLargePublic: number,
    orderByLargePublic: string,
    sortOrderPublic: number,
    orderByPublic: string,
    refPublic: any,
    approveLoading: boolean
}

type NotaryProps = {
    clients: any[]
    searchString: string
}
const CANT_SIGN_MESSAGE = "You can currently only approve the allocation requests associated with the multisig organization you signed in with. Signing proposals for additional DataCap allocations will require you to sign in again"
export default class Notary extends Component<NotaryProps, NotaryStates> {
    public static contextType = Data


    verifiedClientsColums = [
        { id: "verified", value: "ID" },
        { id: "key", value: "Address" },
        { id: "datacap", value: "Datacap" },
    ]

    publicRequestColums = [
        { id: "name", value: "Client" },
        { id: "address", value: "Address" },
        { id: "datacap", value: "Datacap" },
        { id: "number", value: "Audit Trail" }
    ]

    largeRequestColums = [
        { id: "name", value: "Client" },
        { id: "address", value: "Address" },
        { id: "multisig", value: "multisig" },
        { id: "datacap", value: "Datacap" },
        { id: "approvals", value: "Approvals" },
        { id: "issue_number", value: "Audit Trail" }
    ]

    state = {
        selectedTransactions: [] as any[],
        selectedClientRequests: [] as any[],
        selectedLargeClientRequests: [] as any[],
        tabs: '1',
        sortOrderVerified: -1,
        orderByVerified: "name",
        refVerified: {} as any,
        sortOrderPublic: -1,
        orderByPublic: "name",
        sortOrderLargePublic: -1,
        orderByLargePublic: "name",
        refPublic: {} as any,
        regLargePublic: {} as any,
        approveLoading: false
    }

    componentDidMount() {
    }


    showVerifiedClients = async () => {
        this.setState({ tabs: "2" })
    }

    showClientRequests = async () => {
        this.setState({ tabs: "1" })
    }

    showLargeRequests = async () => {
        this.setState({ tabs: "3" })
    }

    onRefVerifiedChange = (refVerified: any) => {
        this.setState({ refVerified });
    };

    onRefPublicChange = (refPublic: any) => {
        this.setState({ refPublic });
    };

    onRefLargePublicChange = (regLargePublic: any) => {
        this.setState({ regLargePublic });
    };

    requestDatacap = () => {

        dispatchCustomEvent({
            name: "create-modal", detail: {
                id: Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 5),
                modal: <AddClientModal />
            }
        })
    }

    verifyNewDatacap = () => {

        if (this.state.selectedClientRequests.length === 0 || this.state.selectedClientRequests.length > 1) {
            dispatchCustomEvent({
                name: "create-modal", detail: {
                    id: Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 5),
                    modal: <WarnModal message={'Please select only one address'} />
                }
            })
        } else {
            const selected = this.state.selectedClientRequests[0]
            this.setState({
                selectedClientRequests: []
            })
            dispatchCustomEvent({
                name: "create-modal", detail: {
                    id: Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 5),
                    modal: <AddClientModal newDatacap={true} clientRequest={this.context.clientRequests} selected={selected} />
                }
            })
        }
    }

    showWarnVerify = async (e: any, origin: string) => {
        await e.preventDefault()
        dispatchCustomEvent({
            name: "create-modal", detail: {
                id: Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 5),
                modal: <WarnModalVerify
                    clientRequests={
                        origin === 'Notary' ? this.context.clientRequests
                            : origin === 'Large' ? this.context.largeClientRequests
                                : []}
                    selectedClientRequests={
                        origin === 'Notary' ? this.state.selectedClientRequests
                            : origin === 'Large' ? this.state.selectedLargeClientRequests
                                : []
                    }
                    onClick={
                        origin === 'Notary' ? this.verifyClients.bind(this)
                            : origin === 'newDatacap' ? this.verifyNewDatacap.bind(this)
                                : origin === 'Large' ? this.verifyLargeClients.bind(this)
                                    : this.requestDatacap.bind(this)
                    }
                    largeAddress={origin == "Large" ? true : false}
                    origin={origin === 'Notary' || 'Large' ? 'Notary' : "single-message"}
                />
            }
        })
    }

    verifyClients = async () => {

        dispatchCustomEvent({ name: "delete-modal", detail: {} })

        for (const request of this.context.clientRequests) {
            if (this.state.selectedClientRequests.includes(request.number)) {
                let messageID = ""
                let address = ""
                let dc = request.data.datacap
                let sentryData: any = {}
                try {
                    const datacap = anyToBytes(request.data.datacap)
                    console.log('datacap', datacap)
                    address = request.data.address
                    if (address.length < 12) {
                        address = await this.context.wallet.api.actorKey(address)
                    }
                    if (this.context.wallet.multisig) {
                        messageID = await this.context.wallet.api.multisigVerifyClient(this.context.wallet.multisigID, address, BigInt(datacap), this.context.wallet.walletIndex)
                    } else {
                        messageID = await this.context.wallet.api.verifyClient(address, BigInt(datacap.toFixed()), this.context.wallet.walletIndex)
                    }
                    // github update
                    this.context.updateGithubVerified(request.number, messageID, address, request.data.datacap)

                    // send notifications
                    this.context.wallet.dispatchNotification('Verify Client Message sent with ID: ' + messageID)
                    this.context.loadClientRequests()
                    sentryData = {
                        requestNumber: request.number,
                        messageID: messageID,
                        address: address,
                        dataCap: dc,
                        multisigId: this.context.wallet.multisigID,
                        activeAccount: this.context.wallet.activeAccount,
                        accounts: this.context.wallet.accounts,
                        walletIndex: this.context.wallet.walletIndex
                    }
                } catch (e) {
                    sentryData = {
                        ...sentryData,
                        error: e
                    }

                    this.context.logToSentry(`verifyClients issue n. ${request.number}`, `verifyClients error: ${e.message}`, "error", sentryData)
                    this.context.wallet.dispatchNotification('Verification failed: ' + e.message)
                } finally {
                    this.context.logToSentry(`verifyClients issue n. ${request.number}`, "verifyClients info", "info", sentryData)
                }
            }
        }
    }


    verifyLargeClients = async () => {
        this.setState({ approveLoading: true })
        dispatchCustomEvent({ name: "delete-modal", detail: {} })
        for (const request of this.context.largeClientRequests) {
            if (this.state.selectedLargeClientRequests.includes(request.number)) {
                let sentryData: any = {}
                sentryData.requestNumber = request.number
                try {
                    const datacap = anyToBytes(request.datacap)
                    console.log('datacap', datacap)
                    sentryData.datacap = datacap.toString()

                    let address = request.address

                    if (address.length < 12) {
                        address = await this.context.wallet.api.actorKey(address)
                    }

                    console.log('address', address)
                    sentryData.address = address

                    let messageID

                    // const approvals = request.approvals[0] && request.approvals[0].tx ? request.approvals[0].tx.signers.length : 0
                    const approvals = request.approvals ? request.approvals : 0
                    sentryData.approvals = approvals

                    approvals == 0 ?
                        messageID = await this.context.wallet.api.multisigVerifyClient(this.context.wallet.multisigID, address, BigInt(datacap), this.context.wallet.walletIndex)
                        :
                        messageID = await this.context.wallet.api.approvePending(this.context.wallet.multisigID, request.tx, this.context.wallet.walletIndex)

                    sentryData.messageID = messageID

                    const signer = this.context.wallet.activeAccount ? this.context.wallet.activeAccount : ""
                    this.context.updateGithubVerifiedLarge(request.number, messageID, address, datacap, approvals, signer)
                    sentryData.signer = signer

                    this.context.wallet.dispatchNotification('Verify Client Message sent with ID: ' + messageID)
                    this.setState({ approveLoading: false })
                    this.context.loadClientRequests()
                } catch (e) {
                    this.context.wallet.dispatchNotification('Verification failed: ' + e.message)
                    console.log(e.stack)
                    this.setState({ approveLoading: false })
                    sentryData = {
                        ...sentryData,
                        error: e
                    }
                    this.context.logToSentry(`verifyLargeClients issue n. ${request.number}`, `verifyLargeClients error: ${e.message}`, "error", sentryData)
                } finally {
                    this.context.logToSentry(`verifyLargeClients issue n. ${request.number}`, "verifyLargeClients info", "info", sentryData)
                }
            }
        }

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

    selectClientRow = (number: string) => {
        let selectedTxs = this.state.selectedClientRequests
        if (selectedTxs.includes(number)) {
            selectedTxs = selectedTxs.filter(item => item !== number)
        } else {
            selectedTxs.push(number)
        }
        this.setState({ selectedClientRequests: selectedTxs })
    }

    selectLargeClientRow = (number: string) => {
        let selectedTxs = this.state.selectedLargeClientRequests
        if (selectedTxs.includes(number)) {
            selectedTxs = selectedTxs.filter(item => item !== number)
        } else {
            selectedTxs.push(number)
        }
        this.setState({ selectedLargeClientRequests: selectedTxs })
    }

    proposeVerifier = async () => {
        dispatchCustomEvent({
            name: "create-modal", detail: {
                id: Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 5),
                modal: <AddVerifierModal />
            }
        })
    }

    orderVerified = async (e: any) => {
        const { orderBy, sortOrder } = await this.context.sortClients(e, this.state.orderByVerified, this.state.sortOrderVerified)
        this.setState({ orderByVerified: orderBy, sortOrderVerified: sortOrder })
    }

    orderPublic = async (e: any) => {
        const { orderBy, sortOrder } = await this.context.sortPublicRequests(e, this.state.orderByPublic, this.state.sortOrderPublic, this.context.clientRequests)
        this.setState({ orderByPublic: orderBy, sortOrderPublic: sortOrder })
    }

    orderLarge = async (e: any) => {
        const { orderBy, sortOrder } = await this.context.sortLargeRequests(e, this.state.orderByLargePublic, this.state.sortOrderLargePublic)
        this.setState({ orderByLargePublic: orderBy, sortOrderLargePublic: sortOrder })
    }

    timeout(delay: number) {
        return new Promise(res => setTimeout(res, delay));
    }

    showClientDetail(e: any) {
        const listRequestFiltered = this.context.clientRequests.filter((element: any) => tableElementFilter(this.props.searchString, element.data) === true)
            .filter((_: any, i: any) => this.state.refPublic?.checkIndex(i))

        const client = listRequestFiltered[e.currentTarget.id].data.name
        const user = listRequestFiltered[e.currentTarget.id].owner
        const address = listRequestFiltered[e.currentTarget.id].data.address
        const datacap = listRequestFiltered[e.currentTarget.id].data.datacap


        history.push('/client', { client, user, address, datacap })

    }

    sortBeginning(msig: boolean) {
        if (!msig) {
            return this.context.largeClientRequests
        }
        const arrSignable = this.context.largeClientRequests.filter((clientReq: any) => this.context.wallet.multisigID === clientReq?.multisig)
        if (!arrSignable || arrSignable.length === 0) {
            return this.context.largeClientRequests
        }
        const arrUnSignable = this.context.largeClientRequests.filter((clientReq: any) => this.context.wallet.multisigID !== clientReq?.multisig)
        return arrSignable.concat(arrUnSignable)
    }


    public render() {
        return (
            <div className="main">
                <div className="tabsholder">
                    {
                        this.context.ldnRequestsLoading ?
                            <div className="tabs">
                                <div className={this.state.tabs === "1" ? "selected" : ""} onClick={() => { this.showClientRequests() }}><BeatLoader size={15} color={"rgb(24,160,237)"} /></div>
                                <div className={this.state.tabs === "3" ? "selected" : ""} onClick={() => { this.showLargeRequests() }}><BeatLoader size={15} color={"rgb(24,160,237)"} /></div>
                                <div className={this.state.tabs === "2" ? "selected" : ""} onClick={() => { this.showVerifiedClients() }}>Verified clients ({this.props.clients.length})</div>
                            </div> :
                            <div className="tabs">
                                <div className={this.state.tabs === "1" ? "selected" : ""} onClick={() => { this.showClientRequests() }}>Public Requests ({this.context.clientRequests.length})</div>
                                <div className={this.state.tabs === "3" ? "selected" : ""} onClick={() => { this.showLargeRequests() }}>Large Requests ({this.context.largeClientRequests.length})</div>
                                <div className={this.state.tabs === "2" ? "selected" : ""} onClick={() => { this.showVerifiedClients() }}>Verified clients ({this.props.clients.length})</div>
                            </div>
                    }
                    <div className="tabssadd">
                        {this.state.tabs !== "3" ? <ButtonPrimary onClick={() => this.requestDatacap()}>Approve Private Request</ButtonPrimary> : null}
                        {this.state.tabs === "1" || this.state.tabs === "3" ? <>
                            <ButtonPrimary onClick={(e: any) => this.showWarnVerify(e, this.state.tabs === "3" ? "Large" : "Notary")}>{this.state.tabs === "3" ? "Approve Request" : "Verify client"}</ButtonPrimary>
                            {this.state.tabs !== "3" ? <ButtonPrimary onClick={() => this.verifyNewDatacap()}>Verify new datacap</ButtonPrimary> : null}
                        </>
                            : null}
                    </div>
                </div>
                {this.state.tabs === "1" && this.context.github.githubLogged ?
                    <div>
                        <table>
                            <thead>
                                <tr>
                                    <td></td>
                                    {this.publicRequestColums.map((column: any) => <td
                                        id={column.id} onClick={this.orderPublic}>
                                        {column.value}
                                        <FontAwesomeIcon icon={["fas", "sort"]} />
                                    </td>)}
                                </tr>
                            </thead>
                            <tbody>
                                {this.state.refPublic && this.state.refPublic.checkIndex ?
                                    this.context.clientRequests.filter((element: any) => tableElementFilter(this.props.searchString, element.data) === true)
                                        .filter((_: any, i: any) => this.state.refPublic?.checkIndex(i))
                                        .map((clientReq: any, index: any) =>
                                            <tr key={index} >
                                                <td><input type="checkbox" onChange={() => this.selectClientRow(clientReq.number)} checked={this.state.selectedClientRequests.includes(clientReq.number)} /></td>
                                                <td><FontAwesomeIcon icon={["fas", "info-circle"]} id={index} onClick={(e) => this.showClientDetail(e)} /> {clientReq.data.name} </td>
                                                <td>{clientReq.data.address}</td>
                                                <td>{clientReq.data.datacap}</td>
                                                <td><a target="_blank" rel="noopener noreferrer" href={clientReq.url}>#{clientReq.number}</a></td>
                                            </tr>
                                        ) : null}
                            </tbody>
                        </table>
                        <Pagination
                            elements={this.context.clientRequests}
                            maxElements={10}
                            ref={this.onRefPublicChange}
                            refresh={() => this.setState({})}
                            search={this.props.searchString}
                        />
                        {this.context.clientRequests.length === 0 ? <div className="nodata">No client requests yet</div> : null}
                        <div className="alignright">
                            <ButtonSecondary className="buttonsecondary" onClick={async () => {
                                await this.context.github.logoutGithub()
                                await this.context.refreshGithubData()
                            }}>
                                Logout GitHub
                            </ButtonSecondary>
                        </div>
                    </div>
                    : null}
                {this.state.tabs === "3" && this.context.github.githubLogged ?
                    <div>
                        <table>
                            <thead>
                                <tr>
                                    <td></td>
                                    {this.largeRequestColums.map((column: any) => <td
                                        id={column.id} onClick={this.orderLarge}>
                                        {column.value}
                                        <FontAwesomeIcon icon={["fas", "sort"]} />
                                    </td>)}
                                </tr>
                            </thead>
                            <tbody>
                                {this.state.regLargePublic && this.state.regLargePublic.checkIndex && this.context.largeClientRequests[0] !== undefined ?
                                    this.sortBeginning(this.context.wallet.multisig)
                                        .filter((element: any) => tableElementFilter(this.props.searchString, element?.data) === true)
                                        .filter((_: any, i: any) => this.state.regLargePublic?.checkIndex(i))
                                        .map((clientReq: any, index: any) =>
                                            <tr key={index}
                                                className={this.context.wallet.multisigID !== clientReq?.multisig ? "disabledRow" : ""}
                                                onClick={() => this.context.wallet.multisigID !== clientReq?.multisig ?
                                                    this.context.wallet.dispatchNotification(CANT_SIGN_MESSAGE) : {}}>
                                                {this.context.wallet.multisigID === clientReq?.multisig &&
                                                    <td><input type="checkbox" onChange={() => this.selectLargeClientRow(clientReq?.number)} checked={this.state.selectedLargeClientRequests.includes(clientReq?.number)} /></td>}
                                                {this.context.wallet.multisigID !== clientReq?.multisig &&
                                                    <td><input type="checkbox" disabled title={CANT_SIGN_MESSAGE} /></td>}
                                                <td><FontAwesomeIcon icon={["fas", "info-circle"]} id={index} onClick={(e) => this.showClientDetail(e)} /> {clientReq?.data?.name} </td>
                                                <td>{clientReq?.address}</td>
                                                <td>{clientReq?.multisig}</td>
                                                <td>{clientReq?.datacap}</td>
                                                <td>{clientReq?.approvals ? clientReq?.approvals : 0}</td>
                                                <td><a target="_blank" rel="noopener noreferrer" href={clientReq?.url}>#{clientReq?.number}</a></td>
                                            </tr>
                                        ) : null}
                            </tbody>
                        </table>
                        <Pagination
                            elements={this.context.largeClientRequests}
                            maxElements={10}
                            ref={this.onRefLargePublicChange}
                            refresh={() => this.setState({})}
                            search={this.props.searchString}
                        />
                        {this.context.largeClientRequests.length === 0 ? <div className="nodata">No large client requests yet</div> : null}
                        <div className="alignright">
                            <ButtonSecondary className="buttonsecondary" onClick={async () => {
                                await this.context.github.logoutGithub()
                                await this.context.refreshGithubData()
                            }}>
                                Logout GitHub
                            </ButtonSecondary>
                        </div>
                    </div>
                    : null}
                {this.state.tabs === "1" && !this.context.github.githubLogged ?
                    <div id="githublogin">
                        <LoginGithub
                            redirectUri={config.oauthUri}
                            clientId={config.githubApp}
                            scope="repo"
                            onSuccess={async (response: any) => {
                                await this.context.github.loginGithub(response.code)
                                await this.context.refreshGithubData()
                            }}
                            onFailure={(response: any) => {
                                console.log('failure', response)
                            }}
                        />
                    </div>
                    : null}
                {this.state.tabs === "2" ?
                    <div>
                        <table>
                            <thead>
                                <tr>
                                    {this.verifiedClientsColums.map((column: any) => <td
                                        id={column.id} onClick={this.orderVerified}>
                                        {column.value}
                                        <FontAwesomeIcon icon={["fas", "sort"]} />
                                    </td>)}
                                </tr>
                            </thead>
                            <tbody>
                                {this.state.refVerified && this.state.refVerified.checkIndex ?
                                    this.props.clients.filter((element) => tableElementFilter(this.props.searchString, element) === true)
                                        .filter((_, i: any) => this.state.refVerified?.checkIndex(i))
                                        .map((transaction: any, index: any) =>
                                            <tr key={index}>
                                                <td>{transaction.verified}</td>
                                                <td>{transaction.key}</td>
                                                <td>{bytesToiB(transaction.datacap)}</td>
                                            </tr>
                                        ) : null}
                            </tbody>
                        </table>
                        {this.props.clients.length === 0 ? <div className="nodata">No verified clients yet</div> : null}
                        <Pagination
                            elements={this.props.clients}
                            maxElements={10}
                            ref={this.onRefVerifiedChange}
                            refresh={() => this.setState({})}
                            search={this.props.searchString}
                        />
                    </div>
                    : null}
            </div>
        )
    }
}