import React, { Component } from 'react';
import { Wallet } from './context/Index'

export default class Rootkey extends Component {
    public static contextType = Wallet

    componentDidMount() {

    }

    public render(){
        return (
            <div>
                Rootkey
            </div>
        )
    }
}
