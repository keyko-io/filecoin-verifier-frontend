import React, { Component } from 'react';
import { Wallet } from './context/Index'

export default class Verifiedclients extends Component {
    public static contextType = Wallet

    componentDidMount() {

    }

    public render(){
        return (
            <div>
                Verifiedclients
            </div>
        )
    }
}
