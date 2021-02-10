import React, { Component } from 'react';
// @ts-ignore
import { dispatchCustomEvent } from "slate-react-system";
import MakeRequestModal from '../modals/MakeRequestModal';
import NotaryInfoModal from '../modals/NotaryInfoModal';
import { config } from '../config'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'


export default class TableVerifiers extends Component {

    columns = [
        { key: "name", name: "Notary Name", type: "FILE_LINK", width: "98px" },
        { key: "use_case", name: "Use Case" },
        { key: "location", name: "Location" },
        { key: "website", name: "Website / Social Media" },
        { key: "max_datacap_allocation", name: "Max Datacap Allocation", visible: false },
        { key: "private_request", name: "Private Requests" }
    ]


    state = {
        verifiers: [],
        allVerifiers: [],
        selectedVerifier: 0,
        checks: [],
        initialIndex: 0,
        finalIndex: 5,
        pages: [],
        actualPage: 1,
        sortOrder: -1,
        orderBy: "name"
    }

    componentDidMount() {
        this.loadData()
    }

    loadData = async () => {
        await this.getList()
        let initialChecks = [] as any[]
        this.state.verifiers.forEach((_) => {
            initialChecks.push(false)
        })
        this.setState({ checks: initialChecks })
        this.calculatePages()

    }

    calculatePages = () => {
        const numerOfPages = Math.ceil(this.state.verifiers.length / 5)
        let pages = []
        for (let index = 0; index < numerOfPages; index++) {
            pages.push(index + 1)
        }
        this.setState({ pages })
    }

    getList = async () => {
        const dataSource = config.dataSource;
        console.log(`../data/${dataSource}.json`)
        const verifiers = require(`../data/${dataSource}.json`);
        this.setState({ verifiers: verifiers.notaries })
        this.setState({ allVerifiers: verifiers.notaries })

    }

    updateChecks = (e: any) => {
        let checks = [] as any[]
        this.state.checks.forEach((_, i) => {
            checks.push(Number(e.target.name) === i ?
                e.target.value :
                false)
        })
        this.setState({ checks: checks })
        this.setState({ selectedVerifier: Number(e.target.name) })
    }

    showNotaryInfo = (e: any) => {
        const verifier: any = this.state.verifiers[Number(e.currentTarget.id)]
        dispatchCustomEvent({
            name: "create-modal", detail: {
                id: Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 5),
                modal: <NotaryInfoModal message={verifier.info} markdown={verifier.info_markdown} />
            }
        })
    }

    checkIndex = (index: number) => {
        return (index >= this.state.initialIndex && index < this.state.finalIndex)
    }

    contactVerifier = async () => {
        let verifier: any = this.state.verifiers[this.state.selectedVerifier]
        dispatchCustomEvent({
            name: "create-modal", detail: {
                id: Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 5),
                modal: <MakeRequestModal verifier={verifier} />
            }
        })
    }


    order = (e: any) => {
        const orderBy = e.currentTarget.id
        const sortOrder = orderBy === this.state.orderBy ? this.state.sortOrder * -1 : -1

        const verifiers = this.state.verifiers.sort((a: any, b: any) => {
            return a[orderBy] < b[orderBy] ?
                sortOrder :
                a[orderBy] > b[orderBy] ?
                    sortOrder * -1 : 0;
        });

        this.setState({ verifiers })
        this.setState({ sortOrder })
        this.setState({ orderBy })
    }


    orderByName = () => {
        const verifiers = this.state.verifiers.sort((a: any, b: any) => {
            return a.name < b.name ?
                this.state.sortOrder :
                a.name > b.name ?
                    this.state.sortOrder * -1 : 0;
        });

        this.setState({ verifiers })
        this.setState({ sortOrder: this.state.sortOrder * -1 })
    }

    filter = async (name: string) => {
        const verifiers = this.state.allVerifiers.filter((verifier: any) =>
            Object.values(verifier).some((k: any) =>
                typeof (k) === 'object' ?
                    k.join().toLowerCase().includes(name.toLowerCase())
                    :
                    k.toString().toLowerCase().includes(name.toLowerCase())

            ));

        await this.setState({ verifiers })
        this.calculatePages()
    }

    setPage = (e: any) => {
        const actualPage = Number(e.target.id)
        this.setState({ finalIndex: actualPage * 5 })
        this.setState({ initialIndex: (actualPage * 5) - 5 })
        this.setState({ actualPage })
    }

    movePage = (index: number) => {
        const page = this.state.actualPage + index
        if (page <= this.state.pages.length && page >= 1) {
            this.setState({ finalIndex: page * 5 })
            this.setState({ initialIndex: (page * 5) - 5 })
            this.setState({ actualPage: page })
        }
    }



    public render() {
        return (
            <div className="verifiers">
                <div className="tableverifiers">
                    {this.state.verifiers.length > 0 ?
                        <table>
                            <thead>
                                <tr>
                                    <td></td>
                                    {this.columns.map((column: any) =>
                                        column.visible === false ? null :
                                            <td>{column.name}
                                                <FontAwesomeIcon icon={["fas", "sort"]} id={column.key} onClick={this.order} />
                                            </td>
                                    )}
                                </tr>
                            </thead>
                            <tbody>
                                {
                                    this.state.verifiers.map((verifier: any, i) =>
                                        this.checkIndex(i) ?
                                            <tr>
                                                <td>
                                                    <input type="checkbox" key={i} name={String(i)}
                                                        checked={this.state.checks[i]}
                                                        onChange={(e) => this.updateChecks(e)}
                                                    />
                                                </td>
                                                <td>{verifier.name}
                                                    <div className="notaryinfo" id={i.toString()}
                                                        onClick={(e) => this.showNotaryInfo(e)}>
                                                        <FontAwesomeIcon icon={["fas", "info-circle"]} />
                                                    </div>
                                                </td>
                                                <td>{verifier.use_case.map((useCase: any) =>
                                                    <p style={{ padding: 3 }}>{useCase}</p>
                                                )}</td>
                                                <td>{verifier.location}</td>
                                                <td>{verifier.website}</td>
                                                <td>{verifier.private_request}</td>
                                            </tr>
                                            : null
                                    )
                                }
                            </tbody>
                        </table>
                        : <div className="nodata">There are not available notaries yet</div>}
                </div>
                <div className="pagination">
                    <div className="pagenumber paginator" onClick={e => this.movePage(-1)}>{"<"}</div>
                    {this.state.pages.map((page: any, i) =>
                        <div className="pagenumber"
                            style={this.state.actualPage == i + 1 ? { backgroundColor: "#33A7FF", color: 'white' } : {}}
                            id={(i + 1).toString()}
                            onClick={e => this.setPage(e)}>
                            {page}
                        </div>
                    )}
                    <div className="pagenumber paginator" onClick={e => this.movePage(1)}>{">"}</div>
                </div>
            </div>
        )
    }
}