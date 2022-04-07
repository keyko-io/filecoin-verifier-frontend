import React, { Component } from 'react';
// @ts-ignore
import { dispatchCustomEvent } from "slate-react-system";
import WarnModal from '../modals/WarnModal';
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
        selectedVerifier: null as any,
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
        const queryParams = new URLSearchParams(window.location.search);
        const search = queryParams.get('search');
        if (search !== null) {
            this.filter(search)
        }
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
        this.setState({ selectedVerifier: Number(e.target.id) })
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
        if (this.state.selectedVerifier !== null) {
            let verifier: any = this.state.verifiers[this.state.selectedVerifier]
  
           

            dispatchCustomEvent({
                name: "create-modal", detail: {
                    id: Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 5),
                    modal: <MakeRequestModal verifier={verifier} />
                }
            })
            return
        }
        
        dispatchCustomEvent({
            name: "create-modal", detail: {
                id: Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 5),
                modal: <WarnModal message={'Please select one verifier'} />
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
                                    {this.columns.map((column: any, i:any) =>
                                        column.visible === false ? null :
                                            column.order !== "false" ?
                                                <td key={i}>{column.name}
                                                    <FontAwesomeIcon icon={["fas", "sort"]} id={column.key} onClick={this.order} />
                                                </td>
                                                :
                                                <td key={i}>{column.name}</td>
                                    )}
                                </tr>
                            </thead>
                            <tbody>
                                {
                                    this.state.verifiers.map((verifier: any, i) =>
                                        this.child.current.checkIndex(i) ?
                                            <tr key={i}
                                                onClick={(e) => this.updateChecks(e)}
                                            >
                                                <td
                                                     id={String(i)}
                                                    onClick={(e) => this.updateChecks(e)}
                                                >
                                                    <input type="radio" key={i} name={"verifiers"} id={String(i)}
                                                        onChange={(e) => this.updateChecks(e)}
                                                        checked={this.state.selectedVerifier == i}
                                                    />
                                                </td>
                                                <td id={String(i)}>{verifier.name}
                                                    <div className="notaryinfo" id={String(i)}
                                                        onClick={(e) => this.showNotaryInfo(e)}>
                                                            <FontAwesomeIcon icon={["fas", "info-circle"]} />
                                                    </div>
                                                </td>
                                                <td key={i} id={String(i)}>{verifier.use_case.map((useCase: any) =>
                                                    <p key={useCase} id={String(i)} style={{ padding: 3 }}>{useCase}</p>
                                                )}</td>
                                                <td id={String(i)}>{verifier.location}</td>
                                                <td id={String(i)}>Slack: {verifier.fil_slack_id} <br /> Github: {verifier.github_user[0]}</td>
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