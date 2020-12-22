import React, { Component } from 'react';
// @ts-ignore
import { config } from '../config'
import { Data } from '../context/Data/Index'
import ReactMarkdown from 'react-markdown'
import parserMarkdown from '../utils/Markdown'
// @ts-ignore
import { parser } from "himalaya";


export default class TableVerifiers extends Component {
    public static contextType = Data

    columns = [
        { key: "name", name: "Notary Name", type: "FILE_LINK", width: "98px" },
        { key: "use_case", name: "Use Case" },
        { key: "location", name: "Location" },
        { key: "website", name: "website" },
        { key: "max_datacap_allocation", name: "Max Datacap Allocation" },
        { key: "private_request", name: "Available for Private Request" }
    ]

    state = {
        selectedVerifier: 0,
        checks: [],
        miners: '',
    }

    componentDidMount() {
        this.loadData()
    }


    loadData = async () => {
        const result = await this.getMiners();
        console.log(result)
    }

    getMiners = async () => {
        const response = await fetch(config.minersUrl)
        const text = await response.text()

        const html = parserMarkdown.render(text)
        const json = parser(html);

        return json
    }


    public render() {
        return (
            <div className="verifiers">
                <div className="tableverifiers miners">
                    {this.state.miners !== '' ?
                        <div>

                        </div>
                        : <div className="nodata">There are not available miners yet</div>}
                </div>
            </div>
        )
    }
}