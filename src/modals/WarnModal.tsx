import React, { Component } from 'react';
// @ts-ignore
import { H3 } from "slate-react-system";

type ModalProps = {
    message?: string,
}

class WarnModal extends Component<ModalProps> {

    render() {
        return (
            <div className="warnmodal">
                <H3>{this.props.message}</H3>
            </div>
        )
    }
}

export default WarnModal;