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
                        <p>Please ensure you have “expert mode” enabled</p>
                    </div>
                </div>
            </div>
        )
    }
}

export default LogInModal;