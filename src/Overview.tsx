import React, { Component } from 'react';
import { Wallet } from './context/Index'

export default class Overview extends Component {
    public static contextType = Wallet

    componentDidMount() {

    }

    public render(){
        return (
            <div>
                Overview
            </div>
        )
    }
}
