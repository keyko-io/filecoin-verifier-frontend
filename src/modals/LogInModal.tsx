import React, { Component } from 'react';
import RootKey from '../svg/root-key.svg';
import Verifiers from '../svg/verifier-wallet.svg';
import Logo from '../svg/logo-button.svg';
import Ledger from '../svg/ledger-logo.svg';
import history from '../context/History'
import { Data } from '../context/Data/Index'

// @ts-ignore
import { ButtonPrimary, dispatchCustomEvent } from "slate-react-system";
import { config } from '../config';


type ModalProps = {
    type: string,
}

class LogInModal extends Component<ModalProps> {
    public static contextType = Data


    constructor(props: ModalProps) {
        super(props);
    }

    componentDidMount() {

    }

    loadLedgerWallet = async () => {

        const logged = await this.context.wallet.loadWallet('Ledger')

        console.log(logged)

        if (logged) {
            if (this.props.type == '0') {
                const isVerifier = await this.checkVerifier()
                if (this.context.viewroot === false && isVerifier) {
                    this.context.switchview()
                }
                isVerifier ? this.grantAccess() : this.showModalNotAccess('verifier')
            } else {
                const isRootKey = await this.checkRKH()
                isRootKey ? this.grantAccess() : this.showModalNotAccess('rootKeyHolder')
            }
        }
    }

    loadBurnerWallet = async () => {
        const logged = await this.context.wallet.loadWallet('Burner')
        if (logged) {
            if (this.context.viewroot === false && this.props.type == '0') {
                this.context.switchview()
            }

            dispatchCustomEvent({ name: "delete-modal", detail: {} })

            history.push({
                pathname: "/app"
            })
        }
    }

    showModalNotAccess = async (type: string) => {
        console.log('No access')
    }

    grantAccess = async () => {
        dispatchCustomEvent({ name: "delete-modal", detail: {} })

        history.push({
            pathname: "/app"
        })
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
            <div className="loginmodal">
                <div className="imgheader">
                    {this.props.type === '0' ?
                        <img src={RootKey} alt={'RootKey'} />
                        :
                        <img src={Verifiers} alt={'Verifiers'} />
                    }
                </div>
                <div className="info">
                    <div className="title">
                        {this.props.type === '0' ?
                            "Log in as a Root Key Holder"
                            :
                            "Log in as a Notary"
                        }
                    </div>
                    <div className="description">
                        {this.props.type === '0' ?
                            "Here is where you can action pending Notary allocation decisions.To become a rootkey holder, you’ll need to have been selected by the network originally."
                            :
                            "Here is where you can manage pending public requests and action DataCap allocation decisions. To become a rootkey holder, you’ll need to have been preselected."
                        }
                    </div>
                </div>
                <div className="buttons">
                    {!config.networks.includes('Mainnet') ?
                        <div className="button left">
                            <ButtonPrimary onClick={this.loadBurnerWallet}>
                                <img src={Logo} alt={'Logo'} />
                            Load Browser Wallet
                        </ButtonPrimary>
                        </div>
                        : null}
                    <div className={config.networks.includes('Mainnet') ? "button center" : "button right"}>
                        <ButtonPrimary onClick={this.loadLedgerWallet}>
                            <img src={Ledger} alt={'Ledger'} />
                            Load Ledger Wallet
                        </ButtonPrimary>
                    </div>
                </div>
            </div>
        )
    }
}

export default LogInModal;