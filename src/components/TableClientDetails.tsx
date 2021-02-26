import React, { Component } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Pagination from './Pagination';
import { Data } from '../context/Data/Index'

export default class TableClientDetails extends Component {
    public static contextType = Data

    constructor(props: {}) {
        super(props);
    }

    columns = [
        { key: "address", name: "Address" },
        { key: "datacap", name: "Datacap" },
        { key: "notary", name: "Notary" },
        { key: "date", name: "Date" },
        { key: "label", name: "Labels" },
        { key: "state", name: "State" },
        { key: "link", name: "Link" },
    ]


    state = {
        details: [],
        child: {} as any
    }

    componentDidMount() {
        this.loadDetails()
    }

    loadDetails = async () => {
        const details = await this.context.searchUserIssues("ialberquilla")
        this.setState({ details })
        console.log(details)
    }

    addRef = (child: any) => {
        this.setState({ child });
    };


    public render() {
        return (
            <div className="verifiers clientdetails">
                <div className="tableverifiers">
                    {this.state.details.length > 0 ?
                        <table>
                            <thead>
                                <tr>
                                    <td></td>
                                    {this.columns.map((column: any) =>
                                        column.visible === false ? null :
                                            <td>{column.name}
                                                <FontAwesomeIcon icon={["fas", "sort"]} id={column.key} />
                                            </td>
                                    )}
                                </tr>
                            </thead>
                            <tbody>
                                {this.state.child && this.state.child.checkIndex ?
                                    this.state.details.filter((_: any, i: any) => this.state.child.checkIndex(i))
                                        .map((detail: any, i) =>
                                            <tr>
                                                <td></td>
                                                <td>{detail.data.address}</td>
                                                <td>{detail.data.datacap}</td>
                                                <td>{detail.data.notary}</td>
                                                <td>{detail.created_at}</td>
                                                <td>{detail.labels.map((label: any) =>
                                                    <p style={{ padding: 3 }}>{label.name}</p>
                                                )}</td>
                                                <td>{detail.state}</td>
                                                <td><a href={detail.url} target="_blank">#{detail.number}</a></td>
                                            </tr>
                                        )
                                    : null}
                            </tbody>
                        </table>
                        : <div className="nodata">There are not available notaries yet</div>}
                </div>
                <Pagination elements={this.state.details} search={""} ref={this.addRef} maxElements={6} refresh={() => this.setState({})} />
            </div>
        )
    }
}