import React, { Component } from 'react';
// @ts-ignore
import { config } from '../config'
import { Data } from '../context/Data/Index'
import parserMarkdown from '../utils/Markdown'
// @ts-ignore
import { parse } from "himalaya";
import TableCell from '../components/TableCell'
import { PuffLoader } from "react-spinners";
import { bytesToiB } from '../utils/Filters';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const NUMBER_OF_PAGES = 9;
export default class TableVerifiers extends Component {
    public static contextType = Data
    state = {
        selectedVerifier: 0,
        checks: [],
        miners: [],
        minersIds: [],
        verifiedPrice: new Array(),
        minPieceSize: new Array(),
        reputationScore: new Array(),
        loadingApiData: true,
        initialIndex: 0,
        finalIndex: NUMBER_OF_PAGES,
        pages: [],
        actualPage: 1
    }

    columns = [
        { key: "miner", name: "Miner" },
        { key: "location", name: "Location" },
        { key: "miner_id", name: "Miner ID" },
        { key: "contact_info", name: "Contact Info" },
        { key: "flst_price_for_verified_deals", name: "Last Price for Verified Deals", info: true },
        { key: "min_piece_size", name: "Min Piece Size", info: true },
        { key: "reputation_score", name: "Reputation Score", info: true }
    ]


    componentDidMount() {
        this.loadData()

    }

    setPage = async (e: any) => {
        const actualPage = Number(e.target.id)
        this.setState({
            finalIndex: actualPage * NUMBER_OF_PAGES,
            initialIndex: (actualPage * NUMBER_OF_PAGES) - NUMBER_OF_PAGES,
            actualPage
        }, () => {
            this.fetchApiData(this.state.minersIds.slice(this.state.initialIndex, this.state.finalIndex))
        })
    }

    checkIndex = (index: number) => {
        return (index >= this.state.initialIndex && index < this.state.finalIndex)
    }

    movePage = async (index: number) => {
        const page = this.state.actualPage + index
        if (page <= this.state.pages.length && page >= 1) {
            this.setState({
                finalIndex: page * NUMBER_OF_PAGES,
                initialIndex: (page * NUMBER_OF_PAGES) - NUMBER_OF_PAGES,
                actualPage: page,
            }, () => {
                this.fetchApiData(this.state.minersIds.slice(this.state.initialIndex, this.state.finalIndex))
            })
        }
    }

    loadData = async () => {
        const response = await fetch(config.minersUrl)
        const text = await response.text()

        const html = parserMarkdown.render(text)
        const json = parse(html);
        const miners = json[2].children[3].children
            .filter((ele: any) => ele.type === "element")
        this.setState({ miners })

        const numerOfPages = Math.ceil(this.state.miners.length / NUMBER_OF_PAGES)
        let pages = []
        for (let index = 0; index < numerOfPages; index++) {
            pages.push(index + 1)
        }
        this.setState({ pages })

        const minersIds = miners.map((miner: any) => miner.children[5].children[0].content)
        this.setState({ minersIds })
        await this.fetchApiData(minersIds.slice(0, NUMBER_OF_PAGES))
    }

    formatFil(val: string) {
        const n = Number(val);
        let retVal = ''
        if (val === "0") {
            return '0 FIL'
        }
        if (val.length > 18) {
            retVal = `${n / 1000000000000000000} FIL`
            // console.log("/10^18 ", `${n/1000000000000000000} FIL`)
            return retVal
        }
        if (val.length <= 18 && val.length > 6) {
            retVal = `${n / 1000000000} nanoFIL`
            // console.log("/10^9 ", `${n/1000000000} nanoFIL`)
            return retVal
        }
        if (val.length <= 6) {
            retVal = `${n / 1000} attoFIL`
            // console.log("/10^9 ", `${n/1000} attoFIL`)
            return retVal
        }

    }

    fetchApiData = async (minersIds: any[]) => {
        console.log(minersIds)
        Promise.all(
            minersIds.map(async id => {
                let opts = {
                    headers: {
                        'mode': 'cors',
                        'Access-Control-Allow-Origin': '*'
                    }
                }
                //check if id is contained in state so I don't make the call
                const isPriceInList = this.state.verifiedPrice.includes((item: any) => item.address === id)
                const isSizeInList = this.state.minPieceSize.includes((item: any) => item.address === id)
                const isReputationScoreInList = this.state.reputationScore.includes((item: any) => item.address === id)

                if (isPriceInList && isSizeInList && isReputationScoreInList) {
                    return null
                }

                const res = await fetch(`https://api.filrep.io/api/v1/miners?search=${id}`, opts)
                const json = await res.json()
              
                let verPrice = {}
                let minSize = {}
                let rep = {}

                if (!isPriceInList) {
                    verPrice = {
                        address: id,
                        price: json.miners[0]?.verifiedPrice ? this.formatFil(json.miners[0]?.verifiedPrice) : "not found"
                    }
                    this.setState({
                        verifiedPrice: [...this.state.verifiedPrice, verPrice],
                    }, () => {
                        // console.log(this.state.verifiedPrice)
                    })
                }


                if (!isSizeInList) {
                    minSize = {
                        address: id,
                        size: bytesToiB(json.miners[0]?.minPieceSize) === "NaNB" ? "not found" : bytesToiB(json.miners[0]?.minPieceSize)
                    }
                    this.setState({
                        minPieceSize: [...this.state.minPieceSize, minSize],
                    }, () => {
                        // console.log(this.state.minPieceSize)
                    })
                }

                if (!isReputationScoreInList) {
                    rep = {
                        address: id,
                        reputation: json.miners[0]?.scores !== undefined ? json.miners[0]?.scores.total : "not found",
                        color: !Number(json.miners[0]?.scores.total) ? "black" : Number(json.miners[0]?.score) < 50 ? "red" : " green",
                    }
                    this.setState({
                        reputationScore: [...this.state.reputationScore, rep],
                    }, () => {
                        // console.log(this.state.reputationScore)
                    })
                }
            })
        ).catch(error => {
            console.error(error)
            return
        })


    }


    public render() {
        return (
            <div className="verifiers">
                <div className="tableverifiers miners">
                    <table>
                        <thead>
                            <tr>
                                {this.columns.map((item: any) =>
                                    item.info ?
                                        <td style={{ "textAlign": "center" }}>
                                            {item.name}
                                            {/* <FontAwesomeIcon icon={["fas", "sort"]} id={item.key} /> */}
                                            <FontAwesomeIcon title={"This information is coming from filrep.io"} icon={["fas", "info-circle"]} />
                                        </td> :
                                        <td style={{ "textAlign": "center" }}>
                                            {item.name}
                                            {/* <FontAwesomeIcon icon={["fas", "sort"]} id={item.key} /> */}
                                        </td>
                                )}
                            </tr>
                        </thead>
                        <tbody>
                            {this.state.miners.map((miner: any, i) =>

                                this.checkIndex(i) ?

                                    <tr key={i} >
                                        <td style={{ "textAlign": "center" }}>
                                            {miner.children[1].children[0].content}
                                        </td>
                                        <td style={{ "textAlign": "center" }}>
                                            <TableCell
                                                text={miner.children[3].children[0].content}
                                                type="Location" />
                                        </td>
                                        <td style={{ "textAlign": "center" }}>
                                            <TableCell
                                                text={miner.children[5].children[0].content} />
                                        </td>
                                        <td style={{ "textAlign": "center" }}>
                                            <TableCell
                                                text={miner.children[7].children[0].content}
                                                href={miner.children[7].children[1]}
                                                type="Contact" />
                                        </td>
                                        {/* <td>
                                            <TableCell
                                                text={miner.children[11].children[0].content} />
                                        </td> */}
                                        <td style={{ "textAlign": "center" }}>
                                            {this.state.verifiedPrice.find(item => item.address === miner.children[5].children[0].content) !== undefined ?
                                                <TableCell
                                                    text={this.state.verifiedPrice?.find(item => item.address === miner.children[5].children[0].content)?.price} />
                                                :
                                                <PuffLoader speedMultiplier={0.8} size={30} color={"rgb(24,160,237)"} />
                                            }
                                        </td>
                                        <td style={{ "textAlign": "center" }}>
                                            {this.state.minPieceSize.find(item => item.address === miner.children[5].children[0].content) !== undefined ?
                                                <TableCell
                                                    text={this.state.minPieceSize?.find(item => item.address === miner.children[5].children[0].content)?.size} />
                                                :
                                                <PuffLoader speedMultiplier={0.8} size={30} color={"rgb(24,160,237)"} />
                                            }
                                        </td>
                                        {this.state.reputationScore.find(item => item.address === miner.children[5].children[0].content) !== undefined ?
                                            <td style={{
                                                "textAlign": "center",
                                                "color": this.state.reputationScore?.find(item => item.address === miner.children[5].children[0].content)?.color

                                            }} 
                                            >

                                                <TableCell
                                                    text={this.state.reputationScore?.find(item => item.address === miner.children[5].children[0].content)?.reputation} />
                                            </td>   
                                            :
                                            <td style={{ "textAlign": "center" }}>
                                                <PuffLoader speedMultiplier={0.8} size={30} color={"rgb(24,160,237)"} />
                                            </td>
                                        }
                                    </tr>
                                    : null
                            )
                            }
                        </tbody>
                    </table>
                </div>
                <div className="pagination paginationminers">
                    <div className="pagenumber paginator" onClick={e => this.movePage(-1)}>{"<"}</div>
                    {this.state.pages.map((page: any, i) =>
                        <div className="pagenumber"
                            style={this.state.actualPage === i + 1 ? { backgroundColor: "#33A7FF", color: 'white' } : {}}
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