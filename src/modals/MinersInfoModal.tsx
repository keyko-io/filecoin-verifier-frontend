import React, { Component } from 'react';
import { Data } from '../context/Data/Index'


type ModalProps = {
    message: string,
}

class MinersInfoModal extends Component<ModalProps> {
    public static contextType = Data

    state = {
        render: "",
    }

    constructor(props: ModalProps) {
        super(props);
    }

    renderMarkdown = async (text: string) => {
        const response = await this.context.github.githubOcto.markdown.render({
            text
        });

        this.setState({ render: response.data })
    }

    componentDidMount() {
        this.renderMarkdown(this.props.message);
        
        console.log(`http://${window.location.host}/oauth/`)
    }

    render() {


        return (

            <div className="minersinfomodal">
                <div className="title">Additional information</div>
                {this.props.message && this.props.message.length > 0 ?
                    <div dangerouslySetInnerHTML={{ __html: this.state.render }} />
                    :
                    <div >No more data available</div>
                }



            </div>
        )
    }
}

export default MinersInfoModal;
