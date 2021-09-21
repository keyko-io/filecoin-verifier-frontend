import React, { Component } from 'react';
// @ts-ignore
import { dispatchCustomEvent } from "slate-react-system";
import MakeRequestModal from '../modals/MakeRequestModal';
import NotaryInfoModal from '../modals/NotaryInfoModal';
import { config } from '../config'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { tableFilter, tableMinerFilter, tableSort } from '../utils/SortFilter';
import Pagination from './Pagination';

type TableVerifiersProps = {
    search: string
}

export default class TableVerifiers extends Component<TableVerifiersProps> {
    child: any

    constructor(props: TableVerifiersProps) {
        super(props);
        this.child = React.createRef();
    }


    columns = [
        { key: "name", name: "Notary Name", type: "FILE_LINK", width: "98px" },
        { key: "use_case", name: "Use Case" },
        { key: "location", name: "Location" },
        { key: "contacts", name: "Contacts", order: "false" },
    ]


    state = {
        verifiers: [],
        allVerifiers: [],
        selectedVerifier: 0,
        checks: [],
        pages: [] as any[],
        sortOrder: -1,
        orderBy: "name",
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
        this.child.current.calculatePages()
    }

    getList = async () => {
        const dataSource = config.dataSource;
        console.log(`../data/${dataSource}.json`)
        const verifiers = require(`../data/${dataSource}.json`);
        this.shuffleArray(verifiers.notaries)
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
        const { arraySorted, orderBy, sortOrder } = tableSort(e, this.state.verifiers as [], this.state.orderBy, this.state.sortOrder)
        this.setState({ verifiers: arraySorted })
        this.setState({ sortOrder })
        this.setState({ orderBy })
    }

    filter = async (search: string) => {
        const verifiers = await tableMinerFilter(search, this.state.allVerifiers as [])
        this.setState({ verifiers })
        this.child.current.calculatePages()
    }

    shuffleArray(array: any[]) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    public render() {
        return (
            <div className="verifiers">
                <div className="tableverifiers verifierview">
                    {this.state.verifiers.length > 0 ?
                        <table>
                            <thead>
                                <tr>
                                    <td></td>
                                    {this.columns.map((column: any) =>
                                        column.visible === false ? null :
                                            column.order !== "false" ?
                                                <td>{column.name}
                                                    <FontAwesomeIcon icon={["fas", "sort"]} id={column.key} onClick={this.order} />
                                                </td>
                                                :
                                                <td>{column.name}</td>
                                    )}
                                </tr>
                            </thead>
                            <tbody>
                                {
                                    this.state.verifiers.map((verifier: any, i) =>
                                        this.child.current.checkIndex(i) ?
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
                                                <td>Slack: {verifier.fil_slack_id} <br /> Github: {verifier.github_user[0]}</td>
                                            </tr>
                                            : null
                                    )
                                }
                            </tbody>
                        </table>
                        : <div className="nodata">There are not available notaries yet</div>}
                    <Pagination elements={this.state.verifiers} search={this.props.search} ref={this.child} maxElements={5} refresh={() => this.setState({})} />
                </div>
            </div>
        )
    }
}