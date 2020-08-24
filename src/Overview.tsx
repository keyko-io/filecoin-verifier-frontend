import React, { Component } from 'react';
import { Wallet } from './context/Index'
// @ts-ignore
import { Table, H1, ButtonSecondary, TabGroup, ButtonPrimary } from "slate-react-system";

export default class Overview extends Component {
    public static contextType = Wallet

    columns = [
        { key: "verifier", name: "Verifier" },
        { key: "datacap", name: "Datacap" }
    ]

    state = {
        verifiers: [],
    }

    componentDidMount() {
        this.getList()
    }

    getList = async () => {
        const verifiers = await this.context.api.listVerifiers()
        this.setState({verifiers})
    }

    public render(){
        return (
            <div className="page">
                <div className="imageholder"></div>
                <div className="info">
                    <div className="textinfo">
                        <div className="textinfotext">
                            <h2>What is Filecoin Pro Registry?</h2>
                            Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.
                        </div>
                        <div className="textinfodata">
                            <div className="textinfodatablock">
                                <div className="data">60 PiB</div>
                                <div className="text">Datacap Granted</div>
                            </div>
                            <div className="textinfodatablock">
                                <div className="data">75k</div>
                                <div className="text">Comunity Members</div>
                            </div>
                            <div className="textinfodatablock">
                                <div className="data">24</div>
                                <div className="text">Pending verifiers</div>
                            </div>
                            <div className="textinfodatablock">
                                <div className="data">50</div>
                                <div className="text">Verified Verifiers</div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="main">
                    <div>
                        <div>Pending verifiers (24)</div>
                        <div>Approved Verfifiers (50)</div>
                        <ButtonPrimary>Propose Verifier</ButtonPrimary>
                    </div>
                    <Table data={{rows: this.state.verifiers, columns: this.columns}}/>
                    <ButtonSecondary onClick={()=>this.getList()}>Refresh</ButtonSecondary>
                </div>
            </div>
        )
    }
}
