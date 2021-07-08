import React, { Component } from 'react';
// @ts-ignore
import { config } from '../config'
import { Data } from '../context/Data/Index'
import parserMarkdown from '../utils/Markdown'
// @ts-ignore
import { parse } from "himalaya";
import TableCell from '../components/TableCell'


export default class TableVerifiers extends Component {
    public static contextType = Data

    state = {
        selectedVerifier: 0,
        checks: [],
        miners: [],
        minersIds: [],
        verifiedPrice: new Array(),
        minPieceSize: new Array(),
        loadingApiData: true,
        initialIndex: 0,
        finalIndex: 5,
        pages: [],
        actualPage: 1
    }

    componentDidMount() {
        this.loadData()
    }

    setPage = async (e: any) => {
        const actualPage = Number(e.target.id)
        this.setState({ finalIndex: actualPage * 5 })
        this.setState({ initialIndex: (actualPage * 5) - 5 })
        this.setState({ actualPage })
    }

    checkIndex = (index: number) => {
        return (index >= this.state.initialIndex && index < this.state.finalIndex)
    }

    movePage = async (index: number) => {
        const page = this.state.actualPage + index
        if (page <= this.state.pages.length && page >= 1) {
            this.setState({
                finalIndex: page * 5,
                initialIndex: (page * 5) - 5,
                actualPage: page,
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

        const numerOfPages = Math.ceil(this.state.miners.length / 5)
        let pages = []
        for (let index = 0; index < numerOfPages; index++) {
            pages.push(index + 1)
        }
        this.setState({ pages })

        const minersIds = miners.map((miner: any) => miner.children[5].children[0].content)
        this.setState({ minersIds })
        await this.fetchApiData(minersIds)
    }

    fetchApiData = async (minersIds: any[]) => {

        Promise.all(
            minersIds.map(async id => {
                const res = await fetch(`https://api.filrep.io/api/v1/miners?search=${id}`,
                {mode: 'no-cors'})
                console.log(res)
                const json = await res.json()
                console.log(json)
                // const arr: any = this.state.apiData.push(json.miners[0].address)
                // console.log(arr)
                this.setState({
                    verifiedPrice: [...this.state.verifiedPrice, json.miners[0].address || "not found"],
                    minPieceSize: [...this.state.minPieceSize, json.miners[0].address || "not found"],
                }, ()=> console.log(this.state.verifiedPrice))
            })
        )
    }


    public render() {
        return (
            <div className="verifiers">
                <div className="tableverifiers miners">
                    <table>
                        <thead>
                            <tr>
                                <td>Miner</td>
                                <td>Location</td>
                                <td>Miner ID</td>
                                <td>Contact Info</td>
                                {/* <td>Features</td> */}
                                <td>verifiedPrice</td>
                                <td>minPieceSize</td>
                            </tr>
                        </thead>
                        <tbody>
                            {this.state.miners.map((miner: any, i) =>

                                this.checkIndex(i) ?

                                    <tr key={i}>
                                        <td>
                                            {miner.children[1].children[0].content}
                                        </td>
                                        <td>
                                            <TableCell
                                                text={miner.children[3].children[0].content}
                                                type="Location" />
                                        </td>
                                        <td>
                                            <TableCell
                                                text={miner.children[5].children[0].content} />
                                        </td>
                                        <td>
                                            <TableCell
                                                text={miner.children[7].children[0].content}
                                                href={miner.children[7].children[1]}
                                                type="Contact" />
                                        </td>
                                        {/* <td>
                                            <TableCell
                                                text={miner.children[11].children[0].content} />
                                        </td> */}
                                        <td>
                                            {this.state.verifiedPrice[i] ?
                                             <TableCell
                                             text={this.state.verifiedPrice[i]} />
                                             :
                                             "Loading Api Data..."
                                            }
                                        </td>
                                        <td>
                                            {this.state.verifiedPrice[i] ?
                                             <TableCell
                                             text={this.state.verifiedPrice[i]} />
                                             :
                                             "Loading Api Data..."
                                            }
                                        </td>
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