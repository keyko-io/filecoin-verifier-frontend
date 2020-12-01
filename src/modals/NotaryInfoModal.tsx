import React, { Component, Fragment } from 'react';
// @ts-ignore
import { H3 } from "slate-react-system";

type ModalProps = {
    message: string,
}

class NotaryInfoModal extends Component<ModalProps> {

    constructor(props: ModalProps) {
        super(props);
    }

    componentDidMount() {

    }

    render() {
        return (

            <div className="notaryinfoModal">
                <div className="title">Additional information</div>
                {this.props.message && this.props.message.length > 0 ?
                    <div dangerouslySetInnerHTML={{ __html: this.props.message }} />
                    :
                    <div >No more data available</div>
                }



            </div>
        )
    }
}

export default NotaryInfoModal;
