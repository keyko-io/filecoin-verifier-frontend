import React, { Component } from 'react';
// @ts-ignore
import { ButtonPrimary } from "slate-react-system";
import CircularProgress from '@mui/material/CircularProgress';
import { Data } from '../context/Data/Index';

type ModalProps = {
    onClick: () => void;
}


class WarnModalNotaryVerified extends Component<ModalProps> {
    public static contextType = Data
    constructor(props: ModalProps) {
        super(props);
    }


    componentDidMount() {

    }



    render() {
        return (
            <div className="warnmodalledger">
                <div className="message" style={{ marginTop: "12px" }}>
                    {!this.context.isVerifyWalletLoading ? "Hello! Please, to continue, click the button to verify your wallet. You won't have to do this again in the future. Thank you and happy Notarying!" :
                        <div>
                            Please, do not leave the page and wait for the confirmation alert.If the app makes you sign this again, please open a thread  <a href="https://filecoinproject.slack.com/archives/G01HRNU4VBK" target="_blank" rel="noopener noreferrer">here</a>  pasting the address you are using to verify the wallet.
                        </div>
                    }
                </div>

                <div className="ledgermessage" > {!this.context.isVerifyWalletLoading && <span>Please check your Ledger to sign and send the message.</span>}
                    {!this.context.isVerifyWalletLoading ? <ButtonPrimary style={{ marginTop: "12px", minWidth: "130px" }} onClick={() => this.props.onClick()}>Verify Wallet</ButtonPrimary>
                        : <ButtonPrimary style={{ marginTop: "12px", minWidth: "130px" }} ><CircularProgress size={20} style={{ color: "white" }} /></ButtonPrimary>}
                </div>
            </div>
        )
    }
}

export default WarnModalNotaryVerified;


