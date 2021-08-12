import React, { Component } from 'react';
// @ts-ignore
import { config } from '../config'
import { Data } from '../context/Data/Index'
import parserMarkdown from '../utils/Markdown'
// @ts-ignore
import { parse } from "himalaya";
import TableCell from '../components/TableCell'
import { ClimbingBoxLoader } from "react-spinners";
import { bytesToiB, anyToFil } from '../utils/Filters';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { tableMinerFilter, tableSortMiners } from '../utils/SortFilter';
import { faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons'
import ReactDOM from 'react-dom';

type TableMinersProps = {
    ref: any
    search: string
}

const NUMBER_OF_ROWS = 8;
type Miner = {
    id: number,
    name: string,
    location: string,
    minerId: string
    contacts: {
        id: number,
        slack: string,
        href: string
    }
    verifiedPrice: string,
    minPieceSize: string,
    minPieceSizeRaw: any, // to order the table
    reputationScore: string | number

}
export default class TableMiners extends Component {
    child: any

    constructor(props: TableMinersProps) {
        super(props);
        this.child = React.createRef();
    }

    public static contextType = Data
    state = {
        selectedVerifier: 0,
        checks: [],
        miners: [],
        minersIds: [],
        loadingApiData: true,
        initialIndex: 0,
        finalIndex: NUMBER_OF_ROWS,
        pages: [],
        actualPage: 1,
        orderBy: "name",
        sortOrder: -1,
        allMiners: [],
        shownContacts: [] as string[]
    }

    columns = [
        { key: "name", name: "Storage Provider", sort: true },
        { key: "location", name: "Location", sort: true },
        { key: "minerId", name: "Storage Provider ID", sort: true },
        { key: "contact_info", name: "Contact Info", sort: false },
        { key: "verifiedPrice", name: "Last Price for Verified Deals", info: true, sort: true },
        { key: "minPieceSize", name: "Min Piece Size", info: true, sort: true },
        { key: "reputationScore", name: "Reputation Score", info: true, sort: true }
    ]


    async componentDidMount() {
        const queryParams = new URLSearchParams(window.location.search);
        const search = queryParams.get('search');
        if(search === null || search === ""){
            this.loadData()
        }else{
            await  this.loadData();
            this.filter(search)
        }


    }

    setPage = async (e: any, n?: any) => {
        const actualPage = Number(e !== null ? e.target.id : n)
        this.setState({
            finalIndex: actualPage * NUMBER_OF_ROWS,
            initialIndex: (actualPage * NUMBER_OF_ROWS) - NUMBER_OF_ROWS,
            actualPage,
        })

    }

    checkIndex = (index: number) => {
        return (index >= this.state.initialIndex && index < this.state.finalIndex)
    }

    movePage = async (index: number) => {
        const page = this.state.actualPage + index
        if (page <= this.state.pages.length && page >= 1) {
            this.setState({
                finalIndex: page * NUMBER_OF_ROWS,
                initialIndex: (page * NUMBER_OF_ROWS) - NUMBER_OF_ROWS,
                actualPage: page,
            })
        }
    }

    loadData = async () => {
        try {
            const response = await fetch(config.minersUrl)
            const text = await response.text()

            const html = parserMarkdown.render(text)
            const json = parse(html);

            const minersIds = json[2].children[3].children.filter((ele: any) => ele.type === "element").map((m: any, i: number = 0) => m.children[5].children[0].content)

            const res = await fetch(`https://api.filrep.io/api/v1/miners`)
            const apiData = await res.json()
            const filteredApiData = apiData.miners.filter((item: any) => minersIds.includes(item.address))

            const miners = json[2].children[3].children
                .filter((ele: any) => ele.type === "element")
                .map((m: any, i: number = 0) => {
                    const verifiedPrice = filteredApiData.find((item: any) => item.address === m.children[5].children[0].content)?.verifiedPrice || "not found"
                    const minPieceSize = filteredApiData.find((item: any) => item.address === m.children[5].children[0].content)?.minPieceSize || "not found"
                    const reputationScore = filteredApiData.find((item: any) => item.address === m.children[5].children[0].content)?.scores.total || "not found"


                    const index = i++
                    const miner: Miner = {
                        id: index,
                        name: m.children[1].children[0].content,
                        location: m.children[3].children[0].content,
                        minerId: m.children[5].children[0].content,
                        contacts: {
                            id: index,
                            slack: m.children[7].children[0].content.slice(m.children[7].children[0].content.indexOf(":") + 2, m.children[7].children[0].content.indexOf("&")),
                            href: m.children[7].children[1]?.children[0]?.content
                        },
                        verifiedPrice: anyToFil(verifiedPrice),
                        minPieceSize: minPieceSize === "not found" ? "not found" : bytesToiB(minPieceSize),
                        minPieceSizeRaw: minPieceSize === "not found" ? -1 : Number(minPieceSize),
                        reputationScore: reputationScore === "not found" ? "not found" : Number(reputationScore),
                    }
                    return miner
                })
                .sort((a: any, b: any) => {
                    return b.reputationScore - a.reputationScore;
                })

            const numerOfPages = Math.ceil(miners.length / NUMBER_OF_ROWS)
            let pages = []
            for (let index = 0; index < numerOfPages; index++) {
                pages.push(index + 1)
            }
            this.setState({
                miners,
                allMiners: miners,
                pages,
                minersIds,
                loadingApiData: false
            })
        } catch (error) {

        }


    }

    order = async (e: any) => {
        const { arraySorted, orderBy, sortOrder } = tableSortMiners(e, this.state.miners as [], this.state.orderBy, this.state.sortOrder)
        this.setState({
            miners: arraySorted,
            sortOrder: sortOrder,
            orderBy: orderBy,
        })
    }

    filter = async (search: string) => {
        const miners = await tableMinerFilter(search, this.state.allMiners as [])

        this.setPage(null, 1)
        const numerOfPages = Math.ceil(miners.length / NUMBER_OF_ROWS)
        let pages = []
        for (let index = 0; index < numerOfPages; index++) {
            pages.push(index + 1)
        }
        this.setState({ miners, pages })
    }

    showContact = (id: any) => {
        const v = this.state.shownContacts.find((item: string) => item === id);
        if (v === undefined) {
            this.setState({ shownContacts: [...this.state.shownContacts, id] })
        } else {
            this.setState({ shownContacts: this.state.shownContacts.filter((item: string) => item !== id) })
        }
    }

    copyElem = (elem: any) => {
        navigator.clipboard.writeText(elem)
        this.context.wallet.dispatchNotification(elem + ' copied to clipboard')
    }

    renderContact = (contacts: any, id: any) => {
        if (contacts.href?.includes("@")) {
            return <div className="contacvalue">
                {this.state.shownContacts.find((item: string) => item === `SlackHide${id}`) !== undefined ?
                    <span id={`SlackHide${id}`} className={"slack"} onClick={() => this.showContact(`SlackHide${id}`)}>
                        {contacts.slack}
                        <FontAwesomeIcon icon={"copy"} className={"iconExtLink"} onClick={() => this.copyElem(contacts.slack)} title={"Click to copy!"} />
                    </span>
                    :
                    <span id={`SlackHide${id}`} className={"slack"} onClick={() => this.showContact(`SlackHide${id}`)}>
                        Slack
                        <FontAwesomeIcon icon={"eye"} className={"iconExtLink"} />
                    </span>
                }
                <br></br>
                {this.state.shownContacts.find((item: string) => item === `MailHide${id}`) !== undefined ?
                    <span id={`MailHide${id}`} className={"slack"} onClick={() => this.showContact(`MailHide${id}`)}>
                        {contacts.href}
                        <FontAwesomeIcon icon={"copy"} className={"iconExtLink"} onClick={() => this.copyElem(contacts.href)} title={"Click to copy!"} />
                    </span> :
                    <span id={`MailHide${id}`} className={"slack"} onClick={() => this.showContact(`MailHide${id}`)}>
                        Mail
                         <FontAwesomeIcon icon={"eye"} className={"iconExtLink"} />
                    </span>
                }
            </div>
        } else if (contacts.href === undefined) {
            return <div className="contacvalue">
                {this.state.shownContacts.find((item: string) => item === `SlackHide${id}`) !== undefined ?
                    <span id={`SlackHide${id}`} className={"slack"} onClick={() => this.showContact(`SlackHide${id}`)}>
                        {contacts.slack}
                        <FontAwesomeIcon icon={"copy"} className={"iconExtLink"} onClick={() => this.copyElem(contacts.slack)} title={"Click to copy!"} />
                    </span> :
                    <span id={`SlackHide${id}`} className={"slack"} onClick={() => this.showContact(`SlackHide${id}`)}>
                        Slack
                       <FontAwesomeIcon icon={"eye"} className={"iconExtLink"} />
                    </span>
                }
            </div>
        } else {
            return <div className="contacvalue">
                {this.state.shownContacts.find((item: string) => item === `SlackHide${id}`) !== undefined ?
                    <span id={`SlackHide${id}`} className={"slack"} onClick={() => this.showContact(`SlackHide${id}`)}>
                        {contacts.slack}
                        <FontAwesomeIcon icon={"copy"} className={"iconExtLink"} onClick={() => this.copyElem(contacts.slack)} title={"Click to copy!"} />
                    </span> :
                    <span id={`SlackHide${id}`} className={"slack"} onClick={() => this.showContact(`SlackHide${id}`)}>
                        Slack
                       <FontAwesomeIcon icon={"eye"} className={"iconExtLink"} />
                    </span>
                }
                <br></br>
                <span >
                    
                    <a  href={contacts.href} target={"_blank"}>
                    <span className={"website"} >Website</span>
                        <FontAwesomeIcon icon={"external-link-square-alt"} className={"iconExtLink"} /></a>
                </span>
            </div>
        }

    }




    public render() {
        if (this.state.loadingApiData) {
            return (
                <div className="verifiers">
                    <div className="tableverifiers">
                        <div className="verifiers tableverifiers minersTableLoadSpinner">
                            <ClimbingBoxLoader size={18} color={"rgb(24,160,237)"} />
                        </div>

                    </div>
                </div >

            )
        }
        return (
            <div className="verifiers">
                <div className="tableverifiers miners">
                    <table>
                        <thead>
                            <tr >
                                {this.columns.map((item: any, i: any) =>
                                    item.info ?
                                        <td style={{ "textAlign": "center" }}>
                                            {item.name}
                                            {
                                                <FontAwesomeIcon icon={["fas", "sort"]} id={item.key} onClick={async (e) => this.order(e)} />}
                                            <FontAwesomeIcon title={"This information is coming from filrep.io"} icon={["fas", "info-circle"]} />
                                        </td> : item.sort ?
                                            <td style={{ "textAlign": "center" }}>
                                                {item.name}
                                                <FontAwesomeIcon icon={["fas", "sort"]} id={item.key} onClick={async (e) => this.order(e)} />
                                            </td> :
                                            <td style={{ "textAlign": "center" }}>
                                                {item.name}
                                            </td>
                                )}
                            </tr>
                        </thead>
                        <tbody>
                            {
                            this.state.miners.length >0 ? 
                            this.state.miners.map((miner: Miner, i) =>

                                this.checkIndex(i) ?

                                    <tr key={i} id={miner?.id.toString()}>
                                        <td style={{ "textAlign": "center" }}>
                                            {miner?.name}
                                        </td>
                                        <td style={{ "textAlign": "center" }}>
                                            {miner?.location.split(',')[0]}<br></br>{miner.location.split(',')[1]}
                                        </td>
                                        <td style={{ "textAlign": "center" }}>
                                            {miner?.minerId}
                                        </td>
                                        <td style={{ "textAlign": "center" }}  >
                                            <span id={"spanId" + miner?.minerId} >
                                                {this.renderContact(miner?.contacts, miner?.minerId)}
                                            </span>
                                        </td>
                                        {/* <td>
                                            <TableCell
                                                text={miner.children[11].children[0].content} />
                                        </td> */}
                                        {miner?.verifiedPrice === "not found" ?
                                            <td style={{ "textAlign": "center", "color": "red" }}>
                                                {miner?.verifiedPrice}
                                            </td> :
                                            <td style={{ "textAlign": "center" }}>
                                                {miner?.verifiedPrice}
                                            </td>
                                        }
                                        {miner?.minPieceSize === "not found" ?
                                            <td style={{ "textAlign": "center", "color": "red" }}>
                                                {miner?.minPieceSize}
                                            </td> :
                                            <td style={{ "textAlign": "center" }}>
                                                {miner?.minPieceSize}
                                            </td>
                                        }
                                        {miner?.reputationScore > 50 ?
                                            <td >
                                                <a href={`https://filrep.io/?search=${miner?.minerId}`}
                                                    target={"_blank"}
                                                    style={{ "textAlign": "center", "color": "green", "textDecoration": "none" }}
                                                >{miner?.reputationScore}
                                                    <FontAwesomeIcon icon={"external-link-square-alt"} className={"iconExtLink"} />
                                                </a>
                                            </td>
                                            :
                                            <td >
                                                <a href={`https://filrep.io/?search=${miner?.minerId}`}
                                                    target={"_blank"}
                                                    style={{ "textAlign": "center", "color": "red", "textDecoration": "none" }}
                                                >{miner?.reputationScore}
                                                    <FontAwesomeIcon icon={"external-link-square-alt"} className={"iconExtLink"} />
                                                </a>

                                            </td>

                                        }

                                    </tr>
                                    : null
                            ): <tr ><td colSpan={7} id={"notFound"} >No result</td></tr>
                            }
                        </tbody>
                    </table>
                </div>
                <div className="pagination paginationminers">
                    {
                        this.state.pages.length !== 0 &&
                        <div className="pagenumber paginator" onClick={e => this.movePage(-1)}>{"<"}</div>
                    }
                    {
                        this.state.pages.map((page: any, i) =>
                            <div className="pagenumber"
                                style={this.state.actualPage === i + 1 ? { backgroundColor: "#33A7FF", color: 'white' } : {}}
                                id={(i + 1).toString()}
                                onClick={e => this.setPage(e)}>
                                {page}
                            </div>
                        )}
                    {
                        this.state.pages.length !== 0 &&
                        <div className="pagenumber paginator" onClick={e => this.movePage(1)}>{">"}</div>
                    }
                </div>
            </div>
        )
    }
}