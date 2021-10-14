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

type ModalStates = {
    address: string,
    multisig: boolean
}

type ModalProps = {
    type: string,
}

class LogAsNotaryModal extends Component<ModalProps, ModalStates> {
    public static contextType = Data


    constructor(props: ModalProps) {
        super(props);
        this.state = {
            multisig: false,
            address: ''
        }
    }

    componentDidMount() {

    }

    handleChange = (e: any) => {
        this.setState({ [e.target.name]: e.target.value } as any)
    }


    loadWallet = async (type: any) => {
        const logged = await this.context.wallet.loadWallet(type, {
            multisig: true,
            multisigAddress: this.state.address
        })
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

    loadPrivate = () => {
        this.setState({
            multisig: false
        })
    }

    loadMultisig = () => {
        this.setState({
            multisig: true
        })
    }

    render() {
        return (
            <div className="loginmodal">
                <React.Fragment>
                    <div className="imgheader">
                        <img src={Verifiers} alt={'Verifiers'} />
                    </div>
                    <div className="info">
                        <div className="title">
                            Log in as a Notary
                        </div>
                        <div className="description">
                            Here is where you can manage pending public requests and action DataCap allocation decisions. To become a rootkey holder, you’ll need to have been preselected.
                        </div>
                    </div>
                    <div className="tabs">
                        {/* <div className={this.state.multisig ? "tab" : "tab selected"} onClick={()=>this.loadPrivate()}>Individual</div> */}
                        <div className={this.state.multisig ? "tab selected" : "tab"} onClick={() => this.loadMultisig()}>Organization</div>
                    </div>
                    <div className="buttons">
                        {!config.networks.includes('Mainnet') ?
                            <div className="button left">
                                <ButtonPrimary onClick={() => this.loadWallet("Burner")}>
                                    <img src={Logo} alt={'Logo'} />
                                    Load Browser Wallet
                                </ButtonPrimary>
                                {true ?
                                    <input className="multisiginput" name="address" placeholder="Multisig address" value={this.state.address} onChange={this.handleChange} />
                                    : null
                                }
                            </div>
                            : null}
                        <div className={config.networks.includes('Mainnet') ? "button center" : "button right"}>
                            <ButtonPrimary onClick={() => this.loadWallet("Ledger")}>
                                <img src={Ledger} alt={'Ledger'} />
                                Load Ledger Wallet
                            </ButtonPrimary>
                            {true ?
                                <input className="multisiginput" name="address" placeholder="Multisig address" value={this.state.address} onChange={this.handleChange} />
                                : null
                            }
                            <p>Please ensure you have “expert mode” enabled</p>
                        </div>
                    </div>
                </React.Fragment>
            </div>
        )
    }
}

export default LogAsNotaryModal;
