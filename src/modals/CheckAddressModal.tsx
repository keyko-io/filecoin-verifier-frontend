import React, { Component } from 'react';
// @ts-ignore
import {  dispatchCustomEvent } from "slate-react-system";
import history from '../context/History'
import { Data } from '../context/Data/Index'


type States = {
    loading: boolean
    granted: boolean
    type: string
};

type ModalProps = {
    type: string,
}

class CheckAddressModal extends Component<ModalProps, States>  {
    public static contextType = Data


    constructor(props: ModalProps) {
        super(props);
        this.state = {
            loading: true,
            granted: false,
            type: ''
        }
    }

    componentDidMount() {
        this.login()
    }

    acceptMessage = async (e: any) => {
        dispatchCustomEvent({ name: "delete-modal", detail: {} })
    }

    showModalNotAccess = async (type: string) => {
        this.setState({
            loading: false,
            type
        })
    }

    grantAccess = async () => {
        dispatchCustomEvent({ name: "delete-modal", detail: {} })

        history.push({
            pathname: "/app"
        })
    }


    login = async () => {

        const logged = await this.context.wallet.loadWallet('Ledger')

        console.log(logged)

        if (logged) {
            if (this.props.type == '1') {
                const isVerifier = await this.checkVerifier()
                isVerifier ? this.grantAccess() : this.showModalNotAccess('Notary')
            } else {
                const isRootKey = await this.checkRKH()
                if (this.context.viewroot === false && isRootKey) {
                    this.context.switchview()
                }
                isRootKey ? this.grantAccess() : this.showModalNotAccess('Root key holder')
            }
        }
    }

    checkRKH = async () => {
        let isRootKey = false
        await this.context.loadRKH()
        const accounts = await this.context.wallet.getAccounts()
        const rootKeyHolders = await this.context.rootKeyHolders
        console.log(rootKeyHolders)
        for (const account of accounts) {
            if (rootKeyHolders.includes(account)) {
                isRootKey = true
                break;
            }
        }
        return isRootKey
    }

    checkVerifier = async () => {
        let isVerifier = false
        await this.context.loadVerified()
        const accounts = await this.context.wallet.getAccounts()
        const verifiers = await this.context.verified
        for (const account of accounts) {
            if (verifiers.includes(account)) {
                isVerifier = true
                break;
            }
        }
        return isVerifier
    }


    render() {
        return (
            <>
                {this.state.loading ?
                    <div className="confirmmodal">
                        <div className="title">Cheking your wallet</div>
                        <div className="description">Checking that your wallet has a valid address</div>
                    </div >
                    :
                    <div className="confirmmodal">
                        <div className="title">Your wallet has not a valid access</div>
                        <div className="description">Your wallet does not contain any valid {this.state.type} address</div>
                    </div >}
            </>
        )
    }
}

export default CheckAddressModal;
