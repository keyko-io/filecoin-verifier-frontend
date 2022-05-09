import React, { Component } from 'react';
// @ts-ignore
import { ButtonPrimary } from "slate-react-system";
import CircularProgress from '@mui/material/CircularProgress';

type ModalProps = {
    onClick: () => void;
}


class WarnModalNotaryVerified extends Component<ModalProps> {

    constructor(props: ModalProps) {
        super(props);
    }


    componentDidMount() {

    }



    render() {
        return (
            <div className="warnmodalledger">
                <div className="message" style={{ marginTop: "12px" }}>
                    Hello! Please, to continue, click the button to verify your wallet. You won't have to do this again in the future. Thank you and happy Notarying!
                </div>
                <div className="ledgermessage">Please check your Ledger to sign and send the message.
                    <ButtonPrimary style={{ marginTop: "12px" }} onClick={() => this.props.onClick()}>{this.context.isVerifyWalletLoading ? <CircularProgress style={{ color: "white" }} /> : "Verify Wallet"} </ButtonPrimary>
                </div>
            </div>
        )
    }
}

export default WarnModalNotaryVerified;