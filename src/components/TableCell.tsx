import React, { Component } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'


type TableCellProps = {
    text: string,
    type?: string,
    href?: any,
}


class TableCell extends Component<TableCellProps> {

    state = {
        cellContent: []
    }

    componentDidMount() {
        this.formatData()
    }

    formatData = async () => {
        if (this.props.text) {
            const replaced = await this.props.text.split('&lt;br&gt;');
            this.setState({ cellContent: replaced })
        }
    }

    renderContact = (data: any) => {
        const contactElements = data.split(':')
        if (contactElements[0].includes('Website')) {
            return <div className="contacvalue" >
                <a href={this.props.href.attributes[0].value}>{contactElements[0]}</a>
            </div>
        }
        if (contactElements[0].includes('Slack')) {
            return <div className="contacvalue">{contactElements[0]}
                <FontAwesomeIcon title={contactElements[1]} icon={["fas", "info-circle"]} />
            </div>
        }
        if (contactElements[0].includes('Email')) {
            return <div className="contacvalue">
                <a href={this.props.href.attributes[0].value}>{contactElements[0]} </a>
            </div>
        }
        return <div className="contacvalue">{contactElements[0]}</div>

    }

    render() {
        return (
            <>
                {this.state.cellContent.map((ele: any, i) => <p key={i}>{
                    this.props.type === 'Location' ?
                        <><p>{ele.split(',')[0]}</p><p>{ele.split(',')[1]}</p> </>
                        :
                        this.props.type === 'Contact' ? this.renderContact(ele)
                            : ele
                }</p>)}
            </>
        )
    }
}

export default TableCell;
