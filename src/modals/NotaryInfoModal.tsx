import React, { Component, Fragment } from 'react';
import parserMarkdown from '../utils/Markdown'


type ModalProps = {
    message: string,
    markdown?: boolean,

}

class NotaryInfoModal extends Component<ModalProps> {

    constructor(props: ModalProps) {
        super(props);
    }

    componentDidMount() {
    }

    render() {
        return (

            <div className="notaryinfoModal" style={this.props.markdown ? {width: 800} : {}}>
                <div className="title">Additional information</div>
                {this.props.message && this.props.message.length > 0 ?
                    <div
                        className={this.props.markdown ? 'content markdown': 'content'}
                        dangerouslySetInnerHTML={{ __html: parserMarkdown.render(this.props.message) }}
                    />
                    :
                    <div >No more data available</div>
                }



            </div>
        )
    }
}

export default NotaryInfoModal;
