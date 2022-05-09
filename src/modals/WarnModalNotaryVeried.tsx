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
                    Hello! Please, to continue, click the button to verify your wallet. You won't have to do this again in the future. Thank you and happy Notarying!
                </div>
                <div className="ledgermessage" >Please check your Ledger to sign and send the message.
                    {!this.context.isVerifyWalletLoading ? <ButtonPrimary style={{ marginTop: "12px", minWidth: "130px" }} onClick={() => this.props.onClick()}>Verify Wallet</ButtonPrimary>
                        : <ButtonPrimary style={{ marginTop: "12px", minWidth: "130px" }} ><CircularProgress size={20} style={{ color: "white" }} /></ButtonPrimary>}
                </div>
            </div>
        )
    }
}

export default WarnModalNotaryVerified;