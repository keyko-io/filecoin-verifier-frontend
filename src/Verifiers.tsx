import React, { Component } from 'react';
import { Wallet } from './context/Index'
// @ts-ignore
import { Table, H1, ButtonSecondary } from "slate-react-system";

export default class Verifiers extends Component {
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
            <div>
                <H1>Verifiers</H1>
                <Table data={{rows: this.state.verifiers, columns: this.columns}}/>
                <ButtonSecondary onClick={()=>this.getList()}>Refresh</ButtonSecondary>
            </div>
        )
    }
}
