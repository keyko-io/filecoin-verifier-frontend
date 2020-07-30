import React, { Component } from 'react';
import { Wallet } from './context/Index'

export default class Verifiers extends Component {
    public static contextType = Wallet

    componentDidMount() {

    }

    getAccounts = async () => {
        const accounts = await this.context.getAccounts()
        console.log(accounts)
    }

    sign = async () => {
        const signature = await this.context.sign({
            // object
        })
        console.log(signature)
    }

    public render(){
        return (
            <div>
                Verifiers
            </div>
        )
    }
}
