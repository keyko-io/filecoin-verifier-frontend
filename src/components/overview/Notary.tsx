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


type NotaryStates = {
    tabs: string
    selectedTransactions: any[]
    selectedClientRequests: any[]
    sortOrder: number,
    orderBy: string,
    ref: any
}

type NotaryProps = {
    clients: any[]
    searchString: string
}

export default class Notary extends Component<NotaryProps, NotaryStates> {
    public static contextType = Data

    verifiedClientsColums = [
        { id: "verified", value: "ID" },
        { id: "key", value: "Address" },
        { id: "datacap", value: "Datacap" },
    ]

    state = {
        selectedTransactions: [] as any[],
        selectedClientRequests: [] as any[],
        tabs: '1',
        sortOrder: -1,
        orderBy: "name",
        ref: {} as any
    }

    componentDidMount() {
    }


    showVerifiedClients = async () => {
        this.setState({ tabs: "2" })
    }

    showClientRequests = async () => {
        this.setState({ tabs: "1" })
    }

    onRefChange = (ref: any) => {
        this.setState({ ref });
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
                    clientRequests={origin === 'Notary' ? this.context.clientRequests : []}
                    selectedClientRequests={origin === 'Notary' ? this.state.selectedClientRequests : []}
                    onClick={origin === 'Notary' ? this.verifyClients.bind(this) : origin === 'newDatacap' ? this.verifyNewDatacap.bind(this) : this.requestDatacap.bind(this)}
                    origin={origin === 'Notary' ? 'Notary' : "single-message"}
                />
            }
        })
    }

    verifyClients = async () => {

        dispatchCustomEvent({ name: "delete-modal", detail: {} })

        for (const request of this.context.clientRequests) {
            if (this.state.selectedClientRequests.includes(request.number)) {
                try {
                    const datacap = anyToBytes(request.data.datacap)
                    console.log('datacap', datacap)
                    let address = request.data.address
                    if (address.length < 12) {
                        address = await this.context.wallet.api.actorKey(address)
                    }
                    let messageID = await this.context.wallet.api.verifyClient(address, BigInt(datacap), this.context.wallet.walletIndex)
                    // github update
                    this.context.updateGithubVerified(request.number, messageID, address, request.data.datacap)

                    // send notifications
                    this.context.wallet.dispatchNotification('Verify Client Message sent with ID: ' + messageID)
                    this.context.loadClientRequests()
                } catch (e) {
                    this.context.wallet.dispatchNotification('Verification failed: ' + e.message)
                    console.log(e.stack)
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

    proposeVerifier = async () => {
        dispatchCustomEvent({
            name: "create-modal", detail: {
                id: Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 5),
                modal: <AddVerifierModal />
            }
        })
    }

    order = async (e: any) => {
        const { orderBy, sortOrder } = await this.context.sortClients(e, this.state.orderBy, this.state.sortOrder)
        this.setState({ orderBy, sortOrder })
    }

    timeout(delay: number) {
        return new Promise(res => setTimeout(res, delay));
    }

    public render() {
        return (
            <div className="main">
                <div className="tabsholder">
                    <div className="tabs">
                        <div className={this.state.tabs === "1" ? "selected" : ""} onClick={() => { this.showClientRequests() }}>Public Requests ({this.context.clientRequests.length})</div>
                        <div className={this.state.tabs === "2" ? "selected" : ""} onClick={() => { this.showVerifiedClients() }}>Verified clients ({this.props.clients.length})</div>
                    </div>
                    <div className="tabssadd">
                        <ButtonPrimary onClick={() => this.requestDatacap()}>Approve Private Request</ButtonPrimary>
                        {this.state.tabs === "1" ? <>
                            <ButtonPrimary onClick={(e: any) => this.showWarnVerify(e, "Notary")}>Verify client</ButtonPrimary>
                            <ButtonPrimary onClick={() => this.verifyNewDatacap()}>Verify new datacap</ButtonPrimary>
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
                                    <td>Client</td>
                                    <td>Address</td>
                                    <td>Datacap</td>
                                    <td>Audit trail</td>
                                </tr>
                            </thead>
                            <tbody>
                                {this.context.clientRequests.map((clientReq: any, index: any) =>
                                    <tr key={index}>
                                        <td><input type="checkbox" onChange={() => this.selectClientRow(clientReq.number)} checked={this.state.selectedClientRequests.includes(clientReq.number)} /></td>
                                        <td>{clientReq.data.name}</td>
                                        <td>{clientReq.data.address}</td>
                                        <td>{clientReq.data.datacap}</td>
                                        <td><a target="_blank" rel="noopener noreferrer" href={clientReq.url}>#{clientReq.number}</a></td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
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
                                        id={column.id} onClick={this.order}>
                                        {column.value}
                                        <FontAwesomeIcon icon={["fas", "sort"]} />
                                    </td>)}
                                </tr>
                            </thead>
                            <tbody>
                                {this.state.ref && this.state.ref.checkIndex ?
                                    this.props.clients.filter((element) => tableElementFilter(this.props.searchString, element) === true)
                                        .filter((_, i: any) => this.state.ref?.checkIndex(i))
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
                            ref={this.onRefChange}
                            refresh={() => this.setState({})}
                            search={this.props.searchString}
                        />
                    </div>
                    : null}
            </div>
        )
    }
}