import React, { Component } from 'react';
import { Wallet } from './context/Index'
// @ts-ignore
import { Table, H1, ButtonSecondary, ButtonPrimary } from "slate-react-system";

type OverviewStates = {
    tabs: string
    verifiers: any[]
    pendingverifiers: any[]
}

export default class Overview extends Component<{}, OverviewStates> {
    public static contextType = Wallet

    columns = [
        { key: "status", name: "Account Status" },
        { key: "verifier", name: "Verifier" },
        { key: "datacap", name: "Datacap Granted" },
        { key: "grantedby", name: "Granted By" }
    ]

    state = {
        tabs: '1',
        verifiers: [],
        pendingverifiers: []
    }

    componentDidMount() {
        this.getList()
    }

    handleTab = async (e:any) => {
        console.log(e)
    }

    showPending = async () => {
        this.setState({tabs: "1"})
    }

    showApproved = async () => {
        this.setState({tabs: "2"})
    }


    getList = async () => {
        // const verifiers = await this.context.api.listVerifiers()
        // console.log([{verifier: 'xx111xx', datacap: '1000'},{verifier: 'xx222xx', datacap: '2000'}])
        this.setState({
            verifiers: [{
                status: 'Verified',
                grantedby: 'xx111xx',
                verifier: 'Wikimedia',
                datacap: '1000'
            },{
                status: 'Verified',
                grantedby: 'xx222xx',
                verifier: 'Mozilla Foundation',
                datacap: '2000'
            }],
            pendingverifiers: [{
                status: 'Pending',
                grantedby: 'xx333xx',
                verifier: 'Github',
                datacap: '5000'
            },{
                status: 'Pending',
                grantedby: 'xx444xx',
                verifier: 'Linux Foundation',
                datacap: '6000'
            }]
        })
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
                    <div className="tabsholder">
                        <div className="tabs">
                            <div className={this.state.tabs === "1" ? "selected" : ""} onClick={()=>{this.showPending()}}>Pending verifiers ({this.state.verifiers.length})</div>
                            <div className={this.state.tabs === "2" ? "selected" : ""} onClick={()=>{this.showApproved()}}>Approved Verfifiers ({this.state.pendingverifiers.length})</div>
                        </div>
                        <div className="tabssadd">
                            <ButtonPrimary>Propose Verifier</ButtonPrimary>
                        </div>
                    </div>
                    { this.state.tabs === "2" ?
                        <div>

                            <table>
                                <thead>
                                    <tr>
                                        <td>Account status</td>
                                        <td>Verifier</td>
                                        <td>Datacap</td>
                                        <td>Granted By</td>
                                    </tr>
                                </thead>
                                <tbody>
                                    {this.state.verifiers.map((transaction:any, index:any) => 
                                        <tr
                                            key={index}
                                            // onClick={()=>this.selectRow(transaction.id)}
                                            /*className={this.state.selectedTransactions.includes(transaction.id)?'selected':''}*/
                                        >
                                            <td>{transaction.status}</td>
                                            <td>{transaction.verifier}</td>
                                            <td>{transaction.datacap}</td>
                                            <td>{transaction.grantedby}</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>

                            <ButtonSecondary onClick={()=>this.getList()}>Refresh</ButtonSecondary>
                        </div>:null
                    }
                    { this.state.tabs === "1" ?
                        <div>
                            
                            <table>
                                <thead>
                                    <tr>
                                        <td>Account status</td>
                                        <td>Verifier</td>
                                        <td>Datacap</td>
                                        <td>Granted By</td>
                                    </tr>
                                </thead>
                                <tbody>
                                    {this.state.pendingverifiers.map((transaction:any, index:any) => 
                                        <tr
                                            key={index}
                                            // onClick={()=>this.selectRow(transaction.id)}
                                            /*className={this.state.selectedTransactions.includes(transaction.id)?'selected':''}*/
                                        >
                                            <td>{transaction.status}</td>
                                            <td>{transaction.verifier}</td>
                                            <td>{transaction.datacap}</td>
                                            <td>{transaction.grantedby}</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>

                            <ButtonSecondary onClick={()=>this.getList()}>Refresh</ButtonSecondary>
                        </div>:null
                    }
                </div>
            </div>
        )
    }
}
